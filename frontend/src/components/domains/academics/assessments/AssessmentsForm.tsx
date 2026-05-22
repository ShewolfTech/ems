import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "@/utils/api.js";

interface AssessmentsFormProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

export function AssessmentsForm({ initialData, onSave, onClose }: AssessmentsFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    class_id: initialData?.class_id || '',
    subject_id: initialData?.subject_id || '',
    term_id: initialData?.term_id || '',
    conductors: initialData?.conductors || [], // Array of { staff_id, role }
    max_score: initialData?.max_score || 100,
    weight: initialData?.weight || 1,
    date: initialData?.date || new Date().toISOString().split('T')[0],
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const handleAddConductor = () => {
    const staffId = Number(selectedStaffId);
    if (!staffId) return;
    if (formData.conductors.some((c: any) => c.staff_id === staffId)) return;
    setFormData({
      ...formData,
      conductors: [...formData.conductors, { staff_id: staffId, role: 'invigilator' }],
    });
    setSelectedStaffId("");
  };

  const handleRemoveConductor = (idx: number) => {
    const updated = formData.conductors.filter((_: any, i: number) => i !== idx);
    setFormData({ ...formData, conductors: updated });
  };

  const handleConductorRoleChange = (idx: number, role: string) => {
    const updated = [...formData.conductors];
    updated[idx] = { ...updated[idx], role };
    setFormData({ ...formData, conductors: updated });
  };
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    setLoading(true);
    try {
      const [classesRes, subjectsRes, termsRes, teachersRes] = await Promise.all([
        api.get("/academics/classes"),
        api.get("/academics/subjects"),
        api.get("/academics/terms"),
        api.get("/staffmgt/staff"),
      ]);
      setClasses(classesRes.data?.data || []);
      setSubjects(subjectsRes.data?.data || []);
      setTerms(termsRes.data?.data || []);
      setTeachers(teachersRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSave({
        ...formData,
        id: initialData?.id,
        class_id: Number(formData.class_id),
        subject_id: Number(formData.subject_id),
        term_id: Number(formData.term_id),
        max_score: Number(formData.max_score),
        weight: Number(formData.weight),
      });
    } catch (err: any) {
      setError(err.message || "Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading form...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-bold">{initialData ? "Edit Assessment" : "New Assessment"}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., Mid-Term Test"
            required
          />
        </div>

        {/* Class & Subject */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
            <select
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select class...</option>
              {Array.from(new Map(classes.map((c: any) => [c.id, c])).values()).map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select subject...</option>
              {Array.from(new Map(subjects.map((s: any) => [s.id, s])).values()).map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Term */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
          <select
            value={formData.term_id}
            onChange={(e) => setFormData({ ...formData, term_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select term...</option>
            {Array.from(new Map(terms.map((t: any) => [t.id, t])).values()).map((t: any) => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </select>
        </div>

        {/* Conductors (Staff conducting the assessment) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Conducting Staff</label>
          <p className="text-xs text-gray-500 mb-2">Add staff members who will conduct/invigilate this assessment</p>
          
          <div className="space-y-2 mb-3">
            {formData.conductors.map((conductor: any, idx: number) => {
              const staff = teachers.find((t: any) => Number(t.id) === Number(conductor.staff_id));
              return (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm flex-1">{staff ? `${staff.first_name} ${staff.last_name}` : `Staff #${conductor.staff_id}`}</span>
                  <select
                    value={conductor.role || 'invigilator'}
                    onChange={(e) => handleConductorRoleChange(idx, e.target.value)}
                    className="text-xs px-2 py-1 border rounded"
                  >
                    <option value="lead">Lead</option>
                    <option value="invigilator">Invigilator</option>
                    <option value="assistant">Assistant</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveConductor(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select staff to add...</option>
              {Array.from(new Map(teachers.map((t: any) => [t.id, t])).values())
                .filter((t: any) => !formData.conductors.some((c: any) => Number(c.staff_id) === Number(t.id)))
                .map((t: any) => (
                  <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                ))}
            </select>
            <button
              type="button"
              onClick={handleAddConductor}
              disabled={!selectedStaffId}
              className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Max Score & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Score *</label>
            <input
              type="number"
              value={formData.max_score}
              onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: Math.min(1, Math.max(0.1, parseFloat(e.target.value) || 0.1)) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0.1"
              max="1"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">How much this assessment contributes to final grade (0.1 to 1.0)</p>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Optional description..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : initialData ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssessmentsForm;
