import React, { useState, useEffect } from "react";
import { Button } from "@/components/domains/aacommon/index.js";
import { X, User, Mail, Briefcase, Settings, ChevronDown, ChevronUp } from "lucide-react";
import type { StaffFormValues } from "@/domains/staffmgt/staff/types.js";
import { StaffDefaultValues } from "@/domains/staffmgt/staff/types.js";
import { saveStaff } from "@/domains/staffmgt/staff/services.js";

interface StaffFormProps {
  initialData?: Partial<StaffFormValues> & { id?: number | string };
  onClose: () => void;
  onSave?: (data: StaffFormValues & { id?: number | string }) => void;
}

export function StaffForm({ initialData, onClose, onSave }: StaffFormProps) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form data state - focus on essentials
  const [formData, setFormData] = useState<StaffFormValues>({
    ...StaffDefaultValues,
    ...initialData,
  });

  // Load metadata
  useEffect(() => {
    const loadMetadata = async () => {
      setLoading(true);
      try {
        const [deptRes, roleRes] = await Promise.all([
          fetch("/api/staffmgt/departments").then(r => r.json()).catch(() => ({ data: [] })),
          fetch("/api/staffmgt/roles").then(r => r.json()).catch(() => ({ data: [] })),
        ]);
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        setRoles(Array.isArray(roleRes.data) ? roleRes.data : []);
      } catch (error) {
        console.error("Error loading metadata:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMetadata();
  }, []);

  const handleChange = (field: keyof StaffFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        id: initialData?.id,
        department_id: formData.department_id ? Number(formData.department_id) : undefined,
        role_id: formData.role_id ? Number(formData.role_id) : undefined,
        hire_date: formData.hire_date ? new Date(formData.hire_date) : undefined,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth) : undefined,
      };
      
      if (onSave) {
        await onSave(payload);
      } else {
        await saveStaff(payload as any);
      }
      onClose();
    } catch (error: any) {
      console.error("Save failed:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, name: keyof StaffFormValues, type = "text", required = false) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={(formData[name] as any) || ""}
        onChange={(e) => handleChange(name, e.target.value)}
        placeholder={label}
        required={required}
        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
      />
    </div>
  );

  const renderSelect = (label: string, name: keyof StaffFormValues, options: any[], required = false) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={(formData[name] as any) || ""}
        onChange={(e) => handleChange(name, e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.id || opt.value} value={opt.id || opt.value}>
            {opt.name || opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {initialData?.id ? "Edit Staff Member" : "Add Staff Member"}
          </h2>
          <p className="text-teal-100 text-sm mt-1">
            {initialData?.id ? "Update staff information" : "Register a new staff member"}
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          {/* Essential Information Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-100 rounded-lg">
                <User className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Essential Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput("First Name", "first_name", "text", true)}
              {renderInput("Last Name", "last_name", "text", true)}
              {renderInput("Email Address", "email", "email", true)}
              {renderInput("Phone Number", "phone", "tel", true)}
              {renderInput("Hire Date", "hire_date", "date", true)}
              {renderSelect("Department", "department_id", departments, true)}
              {renderSelect("Role", "role_id", roles, true)}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={(formData.employment_type as any) || ""}
                  onChange={(e) => handleChange("employment_type", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select Employment Type</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Information - Collapsible */}
          <div className="border-t border-slate-200 pt-8">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all mb-6"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Additional Information</span>
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {showAdvanced && (
              <div className="space-y-6 pl-4 border-l-2 border-teal-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput("Date of Birth", "date_of_birth", "date")}
                  {renderInput("Employee Number", "employee_no")}
                  {renderInput("National ID", "national_id")}
                  {renderInput("Passport Number", "passport_number")}
                  {renderInput("Address", "address_line1")}
                  {renderInput("City", "city")}
                  {renderInput("Nationality", "nationality")}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={(formData.gender as any) || ""}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Account Information */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInput("Username", "username")}
                    {renderInput("Password", "password", "password")}
                    {renderInput("Tax ID", "tax_id")}
                    {renderInput("Bank Account", "bank_account_number")}
                  </div>
                </div>

                {/* Professional Details */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Professional Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInput("Experience (Years)", "experience_years", "number")}
                    {renderInput("Specialization", "specialization")}
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Qualifications</label>
                      <textarea
                        value={(formData.qualifications as any) || ""}
                        onChange={(e) => handleChange("qualifications", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                        placeholder="List qualifications and certifications"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="sticky bottom-0 z-40 px-8 py-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          variant="primary"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>{initialData?.id ? "Update Staff" : "Create Staff"}</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default StaffForm;
