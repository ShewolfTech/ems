import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, MessageSquare, Info, Clock } from "lucide-react";
import api from "@/utils/api.js";

interface ExamsFormProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

// Helper: Parse time string "HH:MM" to minutes since midnight
const timeToMinutes = (timeStr: string): number | null => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

// Helper: Minutes since midnight to "HH:MM"
const minutesToTime = (mins: number): string => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function ExamsForm({ initialData, onSave, onClose }: ExamsFormProps) {
  // Calculate initial duration from end_time - start_time if both exist
  const initialStartMins = timeToMinutes(initialData?.start_time || "");
  const initialEndMins = timeToMinutes(initialData?.end_time || "");
  const initialDurationMins = (initialStartMins !== null && initialEndMins !== null && initialEndMins > initialStartMins)
    ? initialEndMins - initialStartMins
    : 120; // default 2 hours

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    class_id: initialData?.class_id || '',
    subject_id: initialData?.subject_id || '',
    term_id: initialData?.term_id || '',
    exam_date: initialData?.exam_date
      ? (typeof initialData.exam_date === 'string'
          ? initialData.exam_date.substring(0, 10)
          : new Date(initialData.exam_date).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0],
    start_time: initialData?.start_time || '09:00',
    end_time: initialData?.end_time || '',
    max_score: initialData?.max_score || 100,
    weight: initialData?.weight || 1.0,
    conductors: initialData?.conductors || [],
    teacher_comments: initialData?.teacher_comments || {},
  });

  // Duration state (in minutes)
  const [durationHours, setDurationHours] = useState(Math.floor(initialDurationMins / 60));
  const [durationMinutes, setDurationMinutes] = useState(initialDurationMins % 60);

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [commentKey, setCommentKey] = useState("");
  const [commentValue, setCommentValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate end_time when start_time or duration changes
  const calculatedEndTime = useMemo(() => {
    const startMins = timeToMinutes(formData.start_time);
    if (startMins === null) return "";
    const totalMins = startMins + (durationHours * 60) + durationMinutes;
    return minutesToTime(totalMins);
  }, [formData.start_time, durationHours, durationMinutes]);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    setLoading(true);
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
      setStaff(staffRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConductor = () => {
    const staffId = Number(selectedStaffId);
    if (!staffId) return;
    if (formData.conductors.some((c: any) => Number(c.staff_id) === staffId)) return;
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

  const handleAddComment = () => {
    if (!commentKey.trim()) return;
    const comments = { ...formData.teacher_comments };
    comments[commentKey] = commentValue;
    setFormData({ ...formData, teacher_comments: comments });
    setCommentKey("");
    setCommentValue("");
  };

  const handleRemoveComment = (key: string) => {
    const comments = { ...formData.teacher_comments };
    delete comments[key];
    setFormData({ ...formData, teacher_comments: comments });
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
        start_time: formData.start_time || null,
        end_time: calculatedEndTime || null,
        teacher_comments: formData.teacher_comments,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save exam");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading form...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-3xl mx-auto overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-teal-50 to-cyan-50">
        <h2 className="text-xl font-bold text-slate-900">{initialData ? "Edit Exam" : "Create New Exam"}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="e.g., Mid-Term Examination"
            required
          />
        </div>

        {/* Class & Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class *</label>
            <select
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              <option value="">Select class...</option>
              {Array.from(new Map(classes.map((c: any) => [c.id, c])).values()).map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
          <label className="block text-sm font-semibold text-slate-700 mb-2">Term *</label>
          <select
            value={formData.term_id}
            onChange={(e) => setFormData({ ...formData, term_id: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          >
            <option value="">Select term...</option>
            {Array.from(new Map(terms.map((t: any) => [t.id, t])).values()).map((t: any) => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </select>
        </div>

        {/* Conductors (Staff conducting the exam) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Invigilation Staff</label>
          <p className="text-xs text-slate-500 mb-3">Add staff members who will supervise this exam</p>

          <div className="space-y-2 mb-4">
            {formData.conductors.map((conductor: any, idx: number) => {
              const person = staff.find((t: any) => Number(t.id) === Number(conductor.staff_id));
              return (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-sm font-medium text-slate-900 flex-1">
                    {person ? `${person.first_name} ${person.last_name}` : `Staff #${conductor.staff_id}`}
                  </span>
                  <select
                    value={conductor.role || 'invigilator'}
                    onChange={(e) => handleConductorRoleChange(idx, e.target.value)}
                    className="text-sm px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="invigilator">Invigilator</option>
                    <option value="assistant">Assistant</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveConductor(idx)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="">Select staff to add...</option>
              {Array.from(new Map(staff.map((t: any) => [t.id, t])).values())
                .filter((t: any) => !formData.conductors.some((c: any) => Number(c.staff_id) === Number(t.id)))
                .map((t: any) => (
                  <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                ))}
            </select>
            <button
              type="button"
              onClick={handleAddConductor}
              disabled={!selectedStaffId}
              className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Date & Time with Duration */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Exam Schedule</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Exam Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Date *</label>
              <input
                type="date"
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Duration</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-teal-500"
                    min="0"
                    max="12"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-center text-slate-500 mt-0.5">hrs</p>
                </div>
                <span className="text-slate-400 font-bold text-lg">:</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-teal-500"
                    min="0"
                    max="59"
                    step="5"
                    placeholder="00"
                  />
                  <p className="text-[10px] text-center text-slate-500 mt-0.5">min</p>
                </div>
              </div>
            </div>

            {/* End Time (auto-calculated) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Time <span className="text-xs font-normal text-slate-500">(auto)</span>
              </label>
              <div className={`px-4 py-2.5 border rounded-lg font-mono text-center text-lg ${
                calculatedEndTime 
                  ? "bg-teal-50 border-teal-300 text-teal-800" 
                  : "bg-slate-100 border-slate-200 text-slate-400"
              }`}>
                {calculatedEndTime || "--:--"}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Calculated from start + duration</p>
            </div>
          </div>
        </div>

        {/* Max Score & Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Maximum Score *</label>
            <input
              type="number"
              value={formData.max_score}
              onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="1"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Max possible score</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              Weight for Grade Aggregation
              <span className="group relative">
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg w-64">
                  Determines how much this exam contributes to the final grade. Higher weight = more impact. Used with assessments and assignments to calculate overall performance.
                </span>
              </span>
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="0.1"
              max="1.0"
              step="0.1"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Range: 0.1 to 1.0 (default: 1.0)</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={3}
            placeholder="Optional description or notes about this exam..."
          />
        </div>

        {/* Teacher Comments Section */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <span className="font-semibold text-slate-900">Teacher Comments & Notes</span>
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                {Object.keys(formData.teacher_comments || {}).length}
              </span>
            </div>
            <span className="text-slate-400">{showComments ? '▼' : '▶'}</span>
          </button>

          {showComments && (
            <div className="p-4 space-y-3 bg-white">
              <p className="text-xs text-slate-500 mb-3">
                Add structured comments that will appear on student report cards (e.g., "general_feedback", "improvement_areas", "next_steps")
              </p>

              {/* Existing Comments */}
              {Object.entries(formData.teacher_comments || {}).length > 0 && (
                <div className="space-y-2 mb-4">
                  {Object.entries(formData.teacher_comments).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-teal-600 mb-1">{key}</div>
                        <div className="text-sm text-slate-700">{value as string}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveComment(key)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Comment */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={commentKey}
                  onChange={(e) => setCommentKey(e.target.value)}
                  placeholder="Comment key (e.g., general_feedback)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  placeholder="Comment value"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment())}
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!commentKey.trim() || !commentValue.trim()}
                  className="w-full px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  Add Comment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              initialData ? "Update Exam" : "Create Exam"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExamsForm;
