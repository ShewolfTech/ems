import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import api from "@/utils/api.js";

interface BulkAssessmentFormProps {
  onSave: () => void;
  onClose: () => void;
}

interface AssessmentRow {
  title: string;
  max_score: string;
  weight: string;
  date: string;
  description: string;
}

export function BulkAssessmentsForm({ onSave, onClose }: BulkAssessmentFormProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [conductors, setConductors] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [rows, setRows] = useState<AssessmentRow[]>([
    { title: "", max_score: "100", weight: "1", date: new Date().toISOString().split('T')[0], description: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [classesRes, subjectsRes, termsRes, staffRes] = await Promise.all([
        api.get("/academics/classes"),
        api.get("/academics/subjects"),
        api.get("/academics/terms"),
        api.get("/staffmgt/staff"),
      ]);
      setClasses(classesRes.data?.data || []);
      setSubjects(subjectsRes.data?.data || []);
      setTerms(termsRes.data?.data || []);
      setConductors(staffRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    }
  };

  const addRow = () => {
    setRows([...rows, { title: "", max_score: "100", weight: "1", date: new Date().toISOString().split('T')[0], description: "" }]);
  };

  const removeRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: keyof AssessmentRow, value: string) => {
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
      setError("Please add at least one assessment title");
      setSaving(false);
      return;
    }

    try {
      let count = 0;
      for (const row of validRows) {
        await api.post("/academics/assessments", {
          title: row.title,
          class_id: Number(selectedClass),
          subject_id: Number(selectedSubject),
          term_id: Number(selectedTerm),
          max_score: Number(row.max_score),
          weight: Number(row.weight),
          date: row.date,
          description: row.description || null,
        });
        count++;
      }
      setSuccessCount(count);
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create assessments");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto max-h-[90vh] overflow-auto">
      <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold">Bulk Create Assessments</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        )}
        {successCount > 0 && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            ✅ Successfully created {successCount} assessment{successCount > 1 ? 's' : ''}!
          </div>
        )}

        {/* Common Fields */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select term...</option>
              {terms.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assessment Rows */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Assessments</label>
            <button
              type="button"
              onClick={addRow}
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Row
            </button>
          </div>
          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm text-gray-400 w-6">{idx + 1}</span>
                <input
                  type="text"
                  value={row.title}
                  onChange={(e) => updateRow(idx, "title", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Assessment title..."
                  required
                />
                <input
                  type="number"
                  value={row.max_score}
                  onChange={(e) => updateRow(idx, "max_score", e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Max"
                  min="1"
                />
                <input
                  type="number"
                  value={row.weight}
                  onChange={(e) => updateRow(idx, "weight", e.target.value)}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="W"
                  min="0.1"
                  step="0.1"
                />
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => updateRow(idx, "date", e.target.value)}
                  className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="p-2 text-red-500 hover:text-red-700"
                  disabled={rows.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : `Create ${rows.filter(r => r.title).length} Assessments`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BulkAssessmentsForm;
