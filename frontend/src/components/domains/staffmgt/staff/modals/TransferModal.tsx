import React, { useState, useEffect } from "react";
import { X, Building2, MapPin, Calendar, AlertCircle } from "lucide-react";
import { getDepartments } from "@/domains/staffmgt/staff/services.js";

interface TransferModalProps {
  staff: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function TransferModal({ staff, isOpen, onClose, onSubmit, loading = false }: TransferModalProps) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    new_department_id: "",
    transfer_date: new Date().toISOString().split("T")[0],
    remarks: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments:", error);
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
        new_department_id: "",
        transfer_date: new Date().toISOString().split("T")[0],
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
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Transfer Staff Member</h2>
              <p className="text-blue-100 text-sm mt-1">Move {staff.first_name} {staff.last_name} to a new department</p>
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
            <h3 className="font-bold text-slate-700 mb-4">Current Information</h3>
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
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Department</p>
                <p className="text-lg font-bold text-slate-800">{staff.department_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Role</p>
                <p className="text-lg font-bold text-slate-800">{staff.role_name}</p>
              </div>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">New Department *</label>
              <select
                value={formData.new_department_id}
                onChange={(e) => setFormData(prev => ({ ...prev, new_department_id: e.target.value }))}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Transfer Date *</label>
              <input
                type="date"
                value={formData.transfer_date}
                onChange={(e) => setFormData(prev => ({ ...prev, transfer_date: e.target.value }))}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Remarks/Notes</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
                placeholder="Add any additional notes about this transfer..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
              />
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-amber-900">Transfer records will be maintained</p>
              <p className="text-amber-700">This action will create a permanent transfer record in the system.</p>
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
              disabled={submitting || loading || !formData.new_department_id}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {submitting || loading ? "Processing..." : "Confirm Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
