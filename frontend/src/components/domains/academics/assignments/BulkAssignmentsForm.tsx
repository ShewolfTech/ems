import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, FileText } from "lucide-react";
import api from "@/utils/api.js";

interface BulkAssignmentsFormProps {
  onSave: () => void;
  onClose: () => void;
}

interface AssignmentRow {
  title: string;
  max_score: string;
  weight: string;
  due_date: string;
  description: string;
}

export function BulkAssignmentsForm({ onSave, onClose }: BulkAssignmentsFormProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [rows, setRows] = useState<AssignmentRow[]>([
    { 
      title: "", 
      max_score: "100", 
      weight: "0", 
      due_date: new Date().toISOString().split('T')[0],
      description: "" 
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [classesRes, subjectsRes, termsRes] = await Promise.all([
        api.get("/academics/classes"),
        api.get("/academics/subjects"),
        api.get("/academics/terms"),
      ]);
      setClasses(classesRes.data?.data || []);
      setSubjects(subjectsRes.data?.data || []);
      setTerms(termsRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    }
  };

  const addRow = () => {
    setRows([...rows, { 
      title: "", 
      max_score: "100", 
      weight: "0", 
      due_date: new Date().toISOString().split('T')[0],
      description: "" 
    }]);
  };

  const removeRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: keyof AssignmentRow, value: string) => {
    const updated = [...rows];
    updated[idx] = { ...updated[idx], [field]: value };
    setRows(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessCount(0);

    const validRows = rows.filter(r => r.title.trim());
    if (validRows.length === 0) {
      setError("Please add at least one assignment title");
      setSaving(false);
      return;
    }

    if (!selectedClass || !selectedSubject || !selectedTerm) {
      setError("Please select class, subject, and term");
      setSaving(false);
      return;
    }

    try {
      let count = 0;
      for (const row of validRows) {
        await api.post("/academics/assignments", {
          title: row.title,
          class_id: Number(selectedClass),
          subject_id: Number(selectedSubject),
          term_id: Number(selectedTerm),
          max_score: Number(row.max_score),
          weight: Number(row.weight),
          due_date: row.due_date,
          description: row.description || null,
        });
        count++;
      }
      setSuccessCount(count);
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create assignments");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-teal-600" />
              Bulk Create Assignments
            </h2>
            <p className="text-sm text-slate-600 mt-1">Create multiple assignments at once</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {successCount > 0 && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                ✅ Successfully created {successCount} assignment{successCount > 1 ? 's' : ''}!
              </div>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Class *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select class...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Term *</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select term...</option>
                  {terms.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignment Rows */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Assignments</h3>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Assignment
                </button>
              </div>

              {rows.map((row, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">Assignment #{idx + 1}</span>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => updateRow(idx, "title", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., Chapter 5 Homework"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={row.due_date}
                        onChange={(e) => updateRow(idx, "due_date", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Max Score</label>
                      <input
                        type="number"
                        value={row.max_score}
                        onChange={(e) => updateRow(idx, "max_score", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Weight</label>
                      <input
                        type="number"
                        value={row.weight}
                        onChange={(e) => updateRow(idx, "weight", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        min="0"
                        max="10"
                        step="0.1"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => updateRow(idx, "description", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Optional description..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create {rows.filter(r => r.title.trim()).length} Assignment{rows.filter(r => r.title.trim()).length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BulkAssignmentsForm;
