import React, { useState } from "react";
import { X, CheckCircle, XCircle, Clock, BookOpen, FileText, Save } from "lucide-react";
import * as controller from "@/domains/academics/lesson_deliveries/controller.js";

interface LessonDeliveryModalProps {
  delivery: any;
  action: 'delivered' | 'cancelled' | 'postponed';
  onClose: () => void;
  onSuccess: () => void;
}

export function LessonDeliveryModal({ delivery, action, onClose, onSuccess }: LessonDeliveryModalProps) {
  const [formData, setFormData] = useState({
    teacher_notes: delivery.teacher_notes || '',
    objectives_covered: delivery.objectives_covered ?? null,
    resources_used: delivery.resources_used || [],
    homework_assigned: delivery.homework_assigned || [],
    challenges_faced: delivery.challenges_faced || '',
    follow_up_needed: delivery.follow_up_needed ?? false,
    follow_up_notes: delivery.follow_up_notes || '',
    status: (delivery.status || 'planned') as 'delivered' | 'cancelled' | 'postponed' | 'planned',
    attendance_count: delivery.attendance_count || 0,
    total_students: delivery.total_students || 0,
    rescheduled_to_date: delivery.rescheduled_to_date || '',
  });

  const [resourceInput, setResourceInput] = useState('');
  const [homeworkInput, setHomeworkInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actionConfig = {
    delivered: {
      title: 'Mark as Delivered',
      color: 'green',
      icon: <CheckCircle className="w-6 h-6" />,
      message: 'Record this lesson as delivered',
    },
    cancelled: {
      title: 'Mark as Cancelled',
      color: 'red',
      icon: <XCircle className="w-6 h-6" />,
      message: 'Record this lesson as cancelled',
    },
    postponed: {
      title: 'Mark as Postponed',
      color: 'yellow',
      icon: <Clock className="w-6 h-6" />,
      message: 'Record this lesson as postponed',
    },
  };

  const config = actionConfig[action];

  const addResource = () => {
    if (resourceInput.trim()) {
      setFormData({
        ...formData,
        resources_used: [...formData.resources_used, resourceInput.trim()],
      });
      setResourceInput('');
    }
  };

  const removeResource = (index: number) => {
    setFormData({
      ...formData,
      resources_used: formData.resources_used.filter((_: any, i: number) => i !== index),
    });
  };

  const addHomework = () => {
    if (homeworkInput.trim()) {
      setFormData({
        ...formData,
        homework_assigned: [...formData.homework_assigned, homeworkInput.trim()],
      });
      setHomeworkInput('');
    }
  };

  const removeHomework = (index: number) => {
    setFormData({
      ...formData,
      homework_assigned: formData.homework_assigned.filter((_: any, i: number) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate reschedule date if postponed
      if (formData.status === 'postponed' && !formData.rescheduled_to_date) {
        setError("Please select a reschedule date");
        setSaving(false);
        return;
      }

      // Update delivery with all fields
      await controller.saveLessonDelivery({
        id: delivery.id || delivery.delivery_id,
        status: formData.status,
        teacher_notes: formData.teacher_notes,
        objectives_covered: formData.objectives_covered,
        resources_used: formData.resources_used,
        homework_assigned: formData.homework_assigned,
        challenges_faced: formData.challenges_faced,
        follow_up_needed: formData.follow_up_needed,
        follow_up_notes: formData.follow_up_notes,
        attendance_count: formData.attendance_count,
        total_students: formData.total_students,
        rescheduled_to_date: formData.rescheduled_to_date || null,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to update lesson delivery");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="text-gray-700"><Save className="w-6 h-6" /></div>
            <div>
              <h2 className="text-xl font-bold">Update Lesson Delivery</h2>
              <p className="text-sm text-gray-600">Edit status and add delivery details</p>
            </div>
          </div>
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

          {/* Status Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="planned">📋 Planned</option>
              <option value="delivered">✅ Delivered</option>
              <option value="cancelled">❌ Cancelled</option>
              <option value="postponed">⏰ Postponed</option>
            </select>
          </div>

          {/* Lesson Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Class:</span>
                <span className="ml-2 font-medium">{delivery.class_name || delivery.class_code || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">Subject:</span>
                <span className="ml-2 font-medium">{delivery.subject_name || delivery.subject_code || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">Teacher:</span>
                <span className="ml-2 font-medium">{delivery.teacher_name || `${delivery.teacher_first_name || ''} ${delivery.teacher_last_name || ''}` || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">Time:</span>
                <span className="ml-2 font-medium">{delivery.lesson_start_time ? delivery.lesson_start_time.substring(0, 5) : '—'} - {delivery.lesson_end_time ? delivery.lesson_end_time.substring(0, 5) : '—'}</span>
              </div>
            </div>
            
            {/* Past lesson indicator */}
            {delivery.scheduled_date && new Date(delivery.scheduled_date) < new Date(new Date().toISOString().split('T')[0]) && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                ⚠️ This lesson was scheduled for {new Date(delivery.scheduled_date).toLocaleDateString()}. Last updated: {delivery.updated_at ? new Date(delivery.updated_at).toLocaleString() : 'Never'}
              </div>
            )}
          </div>

          {formData.status === 'delivered' && (
            <>
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.objectives_covered ?? false}
                    onChange={(e) => setFormData({ ...formData, objectives_covered: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Lesson objectives were covered</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Resources Used
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={resourceInput}
                    onChange={(e) => setResourceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                    placeholder="Add a resource..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={addResource}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {formData.resources_used.length > 0 && (
                  <div className="space-y-1">
                    {formData.resources_used.map((resource: string, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                        <span className="text-sm">{resource}</span>
                        <button
                          type="button"
                          onClick={() => removeResource(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Homework Assigned
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={homeworkInput}
                    onChange={(e) => setHomeworkInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHomework())}
                    placeholder="Add homework..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={addHomework}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                {formData.homework_assigned.length > 0 && (
                  <div className="space-y-1">
                    {formData.homework_assigned.map((hw: string, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded">
                        <span className="text-sm">{hw}</span>
                        <button
                          type="button"
                          onClick={() => removeHomework(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Count</label>
                  <input
                    type="number"
                    value={delivery.attendance_count || 0}
                    onChange={(e) => setFormData({ ...formData, attendance_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Students</label>
                  <input
                    type="number"
                    value={delivery.total_students || 0}
                    onChange={(e) => setFormData({ ...formData, total_students: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              </div>
            </>
          )}

          {formData.status === 'cancelled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Cancellation</label>
              <textarea
                value={formData.challenges_faced}
                onChange={(e) => setFormData({ ...formData, challenges_faced: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Why was this lesson cancelled?"
              />
            </div>
          )}

          {formData.status === 'postponed' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Reschedule To *
                </label>
                <input
                  type="date"
                  value={formData.rescheduled_to_date || ''}
                  onChange={(e) => setFormData({ ...formData, rescheduled_to_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  A new delivery record will be created for this date
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.follow_up_needed}
                    onChange={(e) => setFormData({ ...formData, follow_up_needed: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Follow-up lesson needed</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Notes</label>
                <textarea
                  value={formData.follow_up_notes}
                  onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="What needs to be covered in the follow-up?"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Notes (Optional)</label>
            <textarea
              value={formData.teacher_notes}
              onChange={(e) => setFormData({ ...formData, teacher_notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Any additional notes..."
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LessonDeliveryModal;
