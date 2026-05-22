import React, { useState, useEffect } from "react";
import { X, Save, FileText } from "lucide-react";
import api from "@/utils/api.js";

export function AssignmentsForm({ initialData, onClose, onSave }: any) {
  const [formData, setFormData] = useState<any>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    class_id: initialData?.class_id || "",
    subject_id: initialData?.subject_id || "",
    term_id: initialData?.term_id || "",
    start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : "",
    due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().slice(0, 16) : "",
    max_score: initialData?.max_score || 100,
    weight: initialData?.weight || 0,
    teacher_id: initialData?.teacher_id || "",
    teacher_comments: initialData?.teacher_comments || "",
    status_id: initialData?.status_id || "",
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Parse teacher_comments safely
    let parsedComments = null;
    if (formData.teacher_comments) {
      try {
        parsedComments = JSON.parse(formData.teacher_comments);
      } catch (err) {
        console.error('[AssignmentsForm] Invalid JSON in teacher_comments:', err);
        alert('Teacher Comments must be valid JSON. Example: {"comment": "Good work"}');
        return;
      }
    }
    
    // Prepare payload
    const payload: any = {
      ...formData,
      class_id: formData.class_id ? Number(formData.class_id) : null,
      subject_id: formData.subject_id ? Number(formData.subject_id) : null,
      term_id: formData.term_id ? Number(formData.term_id) : null,
      teacher_id: formData.teacher_id ? Number(formData.teacher_id) : null,
      max_score: Number(formData.max_score),
      weight: Number(formData.weight),
      status_id: formData.status_id ? Number(formData.status_id) : null,
      teacher_comments: parsedComments,
    };

    // Include id from initialData for updates
    if (initialData?.id) {
      payload.id = initialData.id;
    }

    onSave(payload);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            {initialData?.id ? "Edit Assignment" : "Create New Assignment"}
          </h3>
          <p className="text-sm text-slate-600 mt-1">Fill in the assignment details below</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
          <X className="w-6 h-6 text-slate-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Assignment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Chapter 5 Homework"
              required
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => handleChange("due_date", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
            <select
              value={formData.class_id}
              onChange={(e) => handleChange("class_id", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select class...</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
            <select
              value={formData.subject_id}
              onChange={(e) => handleChange("subject_id", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select subject...</option>
              {subjects.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          {/* Term */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Term</label>
            <select
              value={formData.term_id}
              onChange={(e) => handleChange("term_id", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select term...</option>
              {terms.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>

          {/* Teacher */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Teacher</label>
            <select
              value={formData.teacher_id}
              onChange={(e) => handleChange("teacher_id", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select teacher...</option>
              {teachers.map((t: any) => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
              ))}
            </select>
          </div>

          {/* Max Score & Weight */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Maximum Score</label>
            <input
              type="number"
              value={formData.max_score}
              onChange={(e) => handleChange("max_score", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="0"
              step="1"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              Weight for Grade Aggregation
              <span className="group relative">
                <svg className="w-4 h-4 text-slate-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg w-64 z-50">
                  Determines how much this assignment contributes to the final grade. 0 = practice only (no grade impact), higher values = more impact. Used with exams and assessments to calculate overall performance.
                </span>
              </span>
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="0"
              max="10.0"
              step="0.1"
              placeholder="0"
            />
            <p className="text-xs text-slate-500 mt-1">Range: 0 to 10.0 (default: 0 = practice only)</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={formData.status_id}
              onChange={(e) => handleChange("status_id", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select status...</option>
              <option value="1">Draft</option>
              <option value="2">Active</option>
              <option value="3">Completed</option>
              <option value="4">Archived</option>
            </select>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
            <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 cursor-pointer">
              Assignment is Active
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={4}
            placeholder="Provide details about the assignment..."
          />
        </div>

        {/* Teacher Comments (JSON) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Teacher Comments (JSON)</label>
          <textarea
            value={formData.teacher_comments}
            onChange={(e) => handleChange("teacher_comments", e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
            rows={3}
            placeholder='{"comment": "Good work", "feedback": "Keep it up"}'
          />
          <p className="text-xs text-slate-500 mt-1">Enter valid JSON format for teacher comments</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Save className="w-5 h-5" />
            {initialData?.id ? "Update Assignment" : "Create Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignmentsForm;
