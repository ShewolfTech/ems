import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Trash2, Plus, Info, Settings, AlertTriangle, Check, X, Eye, Palette, ArrowLeft } from "lucide-react";
import {
  getGradingConfigurations,
  getDefaultGradingConfiguration,
  saveGradingConfiguration,
  deleteGradingConfiguration,
} from "@/domains/academics/grading_configurations/services.js";

interface GradingScaleEntry {
  grade: string;
  min_percentage: number;
  max_percentage: number;
  grade_point: number;
  description: string;
  color?: string;
}

interface GradingConfig {
  id?: number;
  name: string;
  description: string;
  assessments_weight: number;
  exams_weight: number;
  assignments_weight: number;
  grading_scale: GradingScaleEntry[];
  calculation_method: 'weighted_average' | 'total_points' | 'category_average';
  round_final_grade: boolean;
  decimal_places: number;
  is_active: boolean;
  is_default: boolean;
}

const DEFAULT_GRADE_COLORS: Record<string, string> = {
  "A+": "bg-green-500",
  "A": "bg-green-500",
  "A-": "bg-green-400",
  "B+": "bg-blue-500",
  "B": "bg-blue-500",
  "B-": "bg-blue-400",
  "C+": "bg-teal-500",
  "C": "bg-teal-500",
  "C-": "bg-teal-400",
  "D+": "bg-orange-500",
  "D": "bg-orange-500",
  "D-": "bg-orange-400",
  "F": "bg-red-500",
};

const DEFAULT_GRADING_SCALE: GradingScaleEntry[] = [
  { grade: "A+", min_percentage: 97, max_percentage: 100, grade_point: 5.0, description: "Exceptional", color: "bg-green-500" },
  { grade: "A", min_percentage: 93, max_percentage: 96.99, grade_point: 5.0, description: "Outstanding", color: "bg-green-500" },
  { grade: "A-", min_percentage: 90, max_percentage: 92.99, grade_point: 4.7, description: "Excellent", color: "bg-green-400" },
  { grade: "B+", min_percentage: 87, max_percentage: 89.99, grade_point: 4.3, description: "Very Good Plus", color: "bg-blue-500" },
  { grade: "B", min_percentage: 83, max_percentage: 86.99, grade_point: 4.0, description: "Very Good", color: "bg-blue-500" },
  { grade: "B-", min_percentage: 80, max_percentage: 82.99, grade_point: 3.7, description: "Good Plus", color: "bg-blue-400" },
  { grade: "C+", min_percentage: 77, max_percentage: 79.99, grade_point: 3.3, description: "Above Average", color: "bg-teal-500" },
  { grade: "C", min_percentage: 73, max_percentage: 76.99, grade_point: 3.0, description: "Average", color: "bg-teal-500" },
  { grade: "C-", min_percentage: 70, max_percentage: 72.99, grade_point: 2.7, description: "Below Average", color: "bg-teal-400" },
  { grade: "D+", min_percentage: 67, max_percentage: 69.99, grade_point: 2.3, description: "Passing Plus", color: "bg-orange-500" },
  { grade: "D", min_percentage: 63, max_percentage: 66.99, grade_point: 2.0, description: "Passing", color: "bg-orange-500" },
  { grade: "D-", min_percentage: 60, max_percentage: 62.99, grade_point: 1.7, description: "Minimal Pass", color: "bg-orange-400" },
  { grade: "F", min_percentage: 0, max_percentage: 59.99, grade_point: 0.0, description: "Failing", color: "bg-red-500" },
];

const COLOR_OPTIONS = [
  { value: "bg-green-500", label: "Green" },
  { value: "bg-green-400", label: "Light Green" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-blue-400", label: "Light Blue" },
  { value: "bg-teal-500", label: "Teal" },
  { value: "bg-teal-400", label: "Light Teal" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-orange-400", label: "Light Orange" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-slate-500", label: "Gray" },
];

export function GradingConfigurationsPage() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<any[]>([]);
  const [editingConfig, setEditingConfig] = useState<GradingConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const { data } = await getGradingConfigurations();
      setConfigs(data || []);
    } catch (err: any) {
      setError("Failed to load configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const newConfig: GradingConfig = {
      name: "",
      description: "",
      assessments_weight: 40,
      exams_weight: 40,
      assignments_weight: 20,
      grading_scale: [...DEFAULT_GRADING_SCALE],
      calculation_method: 'weighted_average',
      round_final_grade: true,
      decimal_places: 1,
      is_active: true,
      is_default: false,
    };
    setEditingConfig(newConfig);
    setShowForm(true);
    setActiveTab('form');
  };

  const handleEdit = async (config: any) => {
    try {
      const { data } = await getGradingConfiguration(config.id);
      // Parse grading_scale if it's a string
      const gradingScale = typeof data.grading_scale === 'string' 
        ? JSON.parse(data.grading_scale) 
        : data.grading_scale;
      
      setEditingConfig({
        ...data,
        grading_scale: gradingScale,
      });
      setShowForm(true);
      setActiveTab('form');
    } catch (err: any) {
      setError("Failed to load configuration");
    }
  };

  const handleSave = async () => {
    if (!editingConfig) return;

    // Validate weights sum to 100
    const total = editingConfig.assessments_weight + editingConfig.exams_weight + editingConfig.assignments_weight;
    if (Math.abs(total - 100) > 0.01) {
      setError(`Category weights must sum to 100%. Current total: ${total.toFixed(1)}%`);
      return;
    }

    // Validate grading scale
    if (editingConfig.grading_scale.length === 0) {
      setError("At least one grade entry is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveGradingConfiguration(editingConfig);
      await loadConfigs();
      setShowForm(false);
      setActiveTab('list');
    } catch (err: any) {
      setError("Failed to save configuration: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this grading configuration?")) return;
    
    try {
      await deleteGradingConfiguration(id.toString());
      await loadConfigs();
    } catch (err: any) {
      setError("Failed to delete configuration");
    }
  };

  const updateWeight = (field: 'assessments_weight' | 'exams_weight' | 'assignments_weight', value: number) => {
    if (!editingConfig) return;
    setEditingConfig({ ...editingConfig, [field]: value });
  };

  const updateGradingScale = (index: number, field: keyof GradingScaleEntry, value: any) => {
    if (!editingConfig) return;
    const updated = [...editingConfig.grading_scale];
    updated[index] = { ...updated[index], [field]: value };
    setEditingConfig({ ...editingConfig, grading_scale: updated });
  };

  const addGradingScaleEntry = () => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      grading_scale: [
        ...editingConfig.grading_scale,
        { grade: "", min_percentage: 0, max_percentage: 100, grade_point: 0, description: "", color: "bg-slate-500" },
      ],
    });
  };

  const removeGradingScaleEntry = (index: number) => {
    if (!editingConfig) return;
    const updated = editingConfig.grading_scale.filter((_, i) => i !== index);
    setEditingConfig({ ...editingConfig, grading_scale: updated });
  };

  const totalWeight = editingConfig 
    ? editingConfig.assessments_weight + editingConfig.exams_weight + editingConfig.assignments_weight 
    : 0;

  const getWeightStatusColor = () => {
    if (Math.abs(totalWeight - 100) < 0.01) return "text-green-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-600">Loading configurations...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm -mx-6 -mt-6 px-6 py-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <Settings className="w-7 h-7 text-teal-600" />
                  Grading Configurations
                </h1>
                <p className="text-slate-600 mt-1">Configure how your school calculates final grades</p>
              </div>
            </div>
            {activeTab === 'list' && !showForm && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Configuration
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* List View */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {configs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Configurations Yet</h3>
                <p className="text-slate-600 mb-4">Create your first grading configuration to get started.</p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Create Configuration
                </button>
              </div>
            ) : (
              configs.map((config) => (
                <div key={config.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-teal-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{config.name}</h3>
                        {config.is_default && (
                          <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Default
                          </span>
                        )}
                        {!config.is_active && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      {config.description && (
                        <p className="text-sm text-slate-600 mb-3">{config.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(config)}
                        className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-teal-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Assessments</p>
                      <p className="text-2xl font-bold text-teal-700">{parseFloat(config.assessments_weight).toFixed(0)}%</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Exams</p>
                      <p className="text-2xl font-bold text-purple-700">{parseFloat(config.exams_weight).toFixed(0)}%</p>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Assignments</p>
                      <p className="text-2xl font-bold text-teal-700">{parseFloat(config.assignments_weight).toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    <span className="font-semibold">Grade Scale:</span> {config.grading_scale?.length || 0} grades defined
                    {" • "}
                    <span className="font-semibold">Method:</span> {config.calculation_method}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Form View */}
        {activeTab === 'form' && editingConfig && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Configuration Name *</label>
                  <input
                    type="text"
                    value={editingConfig.name}
                    onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Standard Grading 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={editingConfig.description}
                    onChange={(e) => setEditingConfig({ ...editingConfig, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    rows={2}
                    placeholder="Optional description..."
                  />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingConfig.is_active}
                      onChange={(e) => setEditingConfig({ ...editingConfig, is_active: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingConfig.is_default}
                      onChange={(e) => setEditingConfig({ ...editingConfig, is_default: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">Set as Default</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Category Weights */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Category Weights</h2>
                <div className={`text-lg font-bold ${getWeightStatusColor()}`}>
                  Total: {totalWeight.toFixed(1)}%
                  {Math.abs(totalWeight - 100) < 0.01 && (
                    <Check className="w-5 h-5 inline ml-2 text-green-600" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-teal-700 mb-2">Assessments Weight</label>
                  <input
                    type="number"
                    value={editingConfig.assessments_weight}
                    onChange={(e) => updateWeight('assessments_weight', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    min="0"
                    max="100"
                    step="5"
                  />
                  <p className="text-xs text-slate-500 mt-1">Quizzes, tests, continuous assessment</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-700 mb-2">Exams Weight</label>
                  <input
                    type="number"
                    value={editingConfig.exams_weight}
                    onChange={(e) => updateWeight('exams_weight', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="0"
                    max="100"
                    step="5"
                  />
                  <p className="text-xs text-slate-500 mt-1">Mid-terms, finals, major examinations</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-teal-700 mb-2">Assignments Weight</label>
                  <input
                    type="number"
                    value={editingConfig.assignments_weight}
                    onChange={(e) => updateWeight('assignments_weight', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="5"
                  />
                  <p className="text-xs text-slate-500 mt-1">Homework, projects, submissions</p>
                </div>
              </div>
              {Math.abs(totalWeight - 100) > 0.01 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  ⚠️ Weights must sum to exactly 100%. Currently off by {(100 - totalWeight).toFixed(1)}%
                </div>
              )}
            </div>

            {/* Grading Scale */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Grading Scale</h2>
                <button
                  onClick={addGradingScaleEntry}
                  className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Grade
                </button>
              </div>
              <div className="space-y-3">
                {editingConfig.grading_scale.map((entry, index) => (
                  <div key={index} className="grid grid-cols-13 gap-2 items-end p-3 bg-slate-50 rounded-lg">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Grade</label>
                      <input
                        type="text"
                        value={entry.grade}
                        onChange={(e) => updateGradingScale(index, 'grade', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        placeholder="A"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Min %</label>
                      <input
                        type="number"
                        value={entry.min_percentage}
                        onChange={(e) => updateGradingScale(index, 'min_percentage', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Max %</label>
                      <input
                        type="number"
                        value={entry.max_percentage}
                        onChange={(e) => updateGradingScale(index, 'max_percentage', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Point</label>
                      <input
                        type="number"
                        value={entry.grade_point}
                        onChange={(e) => updateGradingScale(index, 'grade_point', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        min="0"
                        max="5"
                        step="0.1"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={entry.description}
                        onChange={(e) => updateGradingScale(index, 'description', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        placeholder="e.g., Excellent"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
                      <div className="flex items-center gap-1">
                        <div className={`w-6 h-6 rounded ${entry.color || 'bg-slate-300'}`} />
                        <select
                          value={entry.color || 'bg-slate-500'}
                          onChange={(e) => updateGradingScale(index, 'color', e.target.value)}
                          className="flex-1 px-1 py-1 border border-slate-300 rounded text-xs"
                        >
                          {COLOR_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => removeGradingScaleEntry(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Grade Scale Preview */}
            {editingConfig.grading_scale.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-teal-600" />
                    Grade Scale Preview
                  </h2>
                  <span className="text-sm text-slate-500">Live preview of your grading scale</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Grade</th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">Color</th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">Min %</th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">Max %</th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">Points</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...editingConfig.grading_scale].reverse().map((entry, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-lg ${entry.color || 'bg-slate-500'}`}>
                              {entry.grade || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className={`inline-block w-6 h-6 rounded ${entry.color || 'bg-slate-300'}`} />
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700 font-medium">
                            {entry.min_percentage?.toFixed(1) || '0'}%
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700 font-medium">
                            {entry.max_percentage?.toFixed(1) || '0'}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-slate-100 rounded text-sm font-semibold text-slate-700">
                              {entry.grade_point?.toFixed(1) || '0.0'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {entry.description || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Card */}
                <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                  <h3 className="font-semibold text-teal-900 mb-3">Quick Reference</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {editingConfig.grading_scale.slice(0, 5).map((entry, idx) => (
                      <div key={idx} className={`p-3 rounded-lg text-center text-white ${entry.color || 'bg-slate-500'}`}>
                        <div className="text-lg font-bold">{entry.grade || '-'}</div>
                        <div className="text-xs opacity-90">{entry.min_percentage?.toFixed(0)}-{entry.max_percentage?.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Additional Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Calculation Method</label>
                  <select
                    value={editingConfig.calculation_method}
                    onChange={(e) => setEditingConfig({ ...editingConfig, calculation_method: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="weighted_average">Weighted Average</option>
                    <option value="total_points">Total Points</option>
                    <option value="category_average">Category Average</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Decimal Places</label>
                  <select
                    value={editingConfig.decimal_places}
                    onChange={(e) => setEditingConfig({ ...editingConfig, decimal_places: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={0}>0 (Round to whole number)</option>
                    <option value={1}>1 (e.g., 85.3%)</option>
                    <option value={2}>2 (e.g., 85.35%)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingConfig.round_final_grade}
                      onChange={(e) => setEditingConfig({ ...editingConfig, round_final_grade: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">Round final grade</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setActiveTab('list'); setShowForm(false); }}
                className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || Math.abs(totalWeight - 100) > 0.01}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GradingConfigurationsPage;
