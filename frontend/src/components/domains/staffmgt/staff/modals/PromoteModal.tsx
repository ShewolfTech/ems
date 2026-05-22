import React, { useState, useEffect } from "react";
import { X, TrendingUp, AlertCircle } from "lucide-react";
import { getStaffRoles } from "@/domains/staffmgt/staff/services.js";

interface PromoteModalProps {
  staff: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function PromoteModal({ staff, isOpen, onClose, onSubmit, loading = false }: PromoteModalProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    new_role_id: "",
    promotion_date: new Date().toISOString().split("T")[0],
    reason: "",
    remarks: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  const loadRoles = async () => {
    try {
      const data = await getStaffRoles();
      setRoles(data.filter((role: any) => role.id !== staff.role_id)); // Exclude current role
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        staff_id: staff.id,
        ...formData
      });
      setFormData({
        new_role_id: "",
        promotion_date: new Date().toISOString().split("T")[0],
        reason: "",
        remarks: ""
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Promote Staff Member</h2>
              <p className="text-purple-100 text-sm mt-1">Advance {staff.first_name} {staff.last_name}'s career</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Current Info */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">Current Position</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Staff Member</p>
                <p className="text-lg font-bold text-slate-800">{staff.first_name} {staff.last_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Employee Number</p>
                <p className="text-lg font-bold text-slate-800">{staff.employee_no}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Role</p>
                <p className="text-lg font-bold text-slate-800">{staff.role_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</p>
                <p className="text-lg font-bold text-slate-800">{staff.department_name}</p>
              </div>
            </div>
          </div>

          {/* Promotion Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">New Role *</label>
              <select
                value={formData.new_role_id}
                onChange={(e) => setFormData(prev => ({ ...prev, new_role_id: e.target.value }))}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                <option value="">Select a new role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Promotion Date *</label>
              <input
                type="date"
                value={formData.promotion_date}
                onChange={(e) => setFormData(prev => ({ ...prev, promotion_date: e.target.value }))}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Promotion *</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                <option value="">Select a reason</option>
                <option value="merit">Outstanding Performance</option>
                <option value="seniority">Seniority</option>
                <option value="qualification">New Qualification</option>
                <option value="reorganization">Organizational Restructuring</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
                placeholder="Add any additional notes about this promotion..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none"
              />
            </div>
          </div>

          {/* Warning */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-green-900">Promotion records will be maintained</p>
              <p className="text-green-700">This action creates a permanent promotion record and updates the staff member's role.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading || !formData.new_role_id}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {submitting || loading ? "Processing..." : "Confirm Promotion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
