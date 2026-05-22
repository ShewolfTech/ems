import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface LessonDeliveryFormProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

export function LessonDeliveryForm({ initialData, onSave, onClose }: LessonDeliveryFormProps) {
  const [formData, setFormData] = useState({
    lesson_id: initialData?.lesson_id || '',
    scheduled_date: initialData?.scheduled_date || new Date().toISOString().split('T')[0],
    status: initialData?.status || 'planned',
    teacher_notes: initialData?.teacher_notes || '',
    objectives_covered: initialData?.objectives_covered ?? null,
    challenges_faced: initialData?.challenges_faced || '',
    follow_up_needed: initialData?.follow_up_needed || false,
    follow_up_notes: initialData?.follow_up_notes || '',
    resources_used: initialData?.resources_used || [],
    homework_assigned: initialData?.homework_assigned || [],
    attendance_count: initialData?.attendance_count || 0,
    total_students: initialData?.total_students || 0,
    actual_start_time: initialData?.actual_start_time || '',
    actual_end_time: initialData?.actual_end_time || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSave({
        ...formData,
        id: initialData?.id,
        lesson_id: Number(formData.lesson_id),
        attendance_count: Number(formData.attendance_count),
        total_students: Number(formData.total_students),
      });
    } catch (err: any) {
      setError(err.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-bold">
          {initialData ? "Edit Lesson Delivery" : "New Lesson Delivery"}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lesson *</label>
            <input
              type="number"
              value={formData.lesson_id}
              onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date *</label>
            <input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="planned">Planned</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Actual Start Time</label>
            <input
              type="time"
              value={formData.actual_start_time}
              onChange={(e) => setFormData({ ...formData, actual_start_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Actual End Time</label>
            <input
              type="time"
              value={formData.actual_end_time}
              onChange={(e) => setFormData({ ...formData, actual_end_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Count</label>
            <input
              type="number"
              value={formData.attendance_count}
              onChange={(e) => setFormData({ ...formData, attendance_count: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Students</label>
            <input
              type="number"
              value={formData.total_students}
              onChange={(e) => setFormData({ ...formData, total_students: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.objectives_covered ?? false}
                onChange={(e) => setFormData({ ...formData, objectives_covered: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Objectives Covered</span>
            </label>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.follow_up_needed}
                onChange={(e) => setFormData({ ...formData, follow_up_needed: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Follow Up Needed</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Notes</label>
          <textarea
            value={formData.teacher_notes}
            onChange={(e) => setFormData({ ...formData, teacher_notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Challenges Faced</label>
          <textarea
            value={formData.challenges_faced}
            onChange={(e) => setFormData({ ...formData, challenges_faced: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Follow Up Notes</label>
          <textarea
            value={formData.follow_up_notes}
            onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={2}
          />
        </div>

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

export default LessonDeliveryForm;
