import React, { useState, useEffect } from "react";
import { X, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/utils/api.js";

interface EditModalProps {
  entityType: "years" | "terms" | "subjects" | "grades" | "curricula" | "streams" | "classes";
  item: any;
  onSave: () => void;
  onClose: () => void;
}

const entityConfig = {
  years: {
    title: "Edit Academic Year",
    endpoint: "/academics/academic-years",
    fields: [
      { key: "name", label: "Name *", type: "text", placeholder: "e.g., 2028 Academic Year", required: true },
      { key: "code", label: "Code *", type: "text", placeholder: "e.g., AY2028", required: true },
      { key: "start_date", label: "Start Date *", type: "date", required: true },
      { key: "end_date", label: "End Date *", type: "date", required: true },
      { key: "is_current", label: "Current Year", type: "checkbox" },
      { key: "is_active", label: "Active", type: "checkbox", default: true },
    ]
  },
  terms: {
    title: "Edit Term",
    endpoint: "/academics/terms",
    dropdowns: ["academic_year_id"],
    fields: [
      { key: "name", label: "Name *", type: "text", placeholder: "e.g., Term 1", required: true },
      { key: "code", label: "Code *", type: "text", placeholder: "e.g., T1", required: true },
      { key: "academic_year_id", label: "Academic Year *", type: "dropdown", required: true },
      { key: "start_date", label: "Start Date *", type: "date", required: true },
      { key: "end_date", label: "End Date *", type: "date", required: true },
      { key: "is_active", label: "Active", type: "checkbox", default: true },
    ]
  },
  subjects: {
    title: "Edit Subject",
    endpoint: "/academics/subjects",
    dropdowns: ["curriculum_id", "grade_level_id"],
    fields: [
      { key: "name", label: "Name *", type: "text", placeholder: "e.g., Mathematics", required: true },
      { key: "code", label: "Code *", type: "text", placeholder: "e.g., MTH", required: true },
      { key: "curriculum_id", label: "Curriculum", type: "dropdown" },
      { key: "grade_level_id", label: "Grade Level", type: "dropdown" },
      { key: "description", label: "Description", type: "text" },
      { key: "is_core", label: "Core Subject", type: "checkbox" },
      { key: "is_active", label: "Active", type: "checkbox", default: true },
    ]
  },
  grades: {
    title: "Edit Class Level",
    endpoint: "/academics/grade-levels",
    fields: [
      { key: "name", label: "Name *", type: "text", placeholder: "e.g., Primary 1", required: true },
      { key: "code", label: "Code *", type: "text", placeholder: "e.g., P1", required: true },
      { key: "education_level", label: "Education Level", type: "text", placeholder: "e.g., Primary" },
      { key: "order_no", label: "Order Number", type: "number", placeholder: "e.g., 1" },
      { key: "is_active", label: "Active", type: "checkbox", default: true },
    ]
  },
  curricula: {
    title: "Edit Curriculum",
    endpoint: "/academics/curricula",
    fields: [
      { key: "name", label: "Name *", type: "text", placeholder: "e.g., National Curriculum", required: true },
      { key: "code", label: "Code *", type: "text", placeholder: "e.g., NC", required: true },
      { key: "description", label: "Description", type: "text" },
      { key: "is_active", label: "Active", type: "checkbox", default: true },
    ]
  },
  streams: {
    title: "Edit Stream",
    endpoint: "/academics/streams",
    fields: [
      { key: "name", label: "Name *", type: "text", placeholder: "e.g., Stream A", required: true },
      { key: "code", label: "Code *", type: "text", placeholder: "e.g., A", required: true },
      { key: "description", label: "Description", type: "text" },
      { key: "is_active", label: "Active", type: "checkbox", default: true },
    ]
  },
  classes: {
    title: "Edit Class",
    endpoint: "/academics/classes",
    dropdowns: ["grade_level_id", "curriculum_id"],
    fields: [
      { key: "name", label: "Name *", type: "text", placeholder: "e.g., Primary 1 A", required: true },
      { key: "code", label: "Code *", type: "text", placeholder: "e.g., P1A", required: true },
      { key: "grade_level_id", label: "Grade Level *", type: "dropdown", required: true },
      { key: "curriculum_id", label: "Curriculum", type: "dropdown" },
      { key: "capacity", label: "Capacity", type: "number", placeholder: "e.g., 45" },
      { key: "is_active", label: "Active", type: "checkbox", default: true },
    ]
  },
};

export function EditModal({ entityType, item, onSave, onClose }: EditModalProps) {
  const config = entityConfig[entityType];
  const [formData, setFormData] = useState<any>({});
  const [dropdownData, setDropdownData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Initialize form data from item
    const initialData: any = { ...item };
    // Convert date strings to YYYY-MM-DD for date inputs
    if (initialData.start_date) initialData.start_date = initialData.start_date.split('T')[0];
    if (initialData.end_date) initialData.end_date = initialData.end_date.split('T')[0];
    setFormData(initialData);
    loadDropdowns();
  }, [entityType, item]);

  const loadDropdowns = async () => {
    if (!config.dropdowns || config.dropdowns.length === 0) return;
    try {
      const data: any = {};
      const requests = config.dropdowns.map(d => {
        if (d === "academic_year_id") return api.get("/academics/academic-years").then(r => ({ key: "academic_year_id", data: r.data?.data || [] }));
        if (d === "curriculum_id") return api.get("/academics/curricula").then(r => ({ key: "curriculum_id", data: r.data?.data || [] }));
        if (d === "grade_level_id") return api.get("/academics/grade-levels").then(r => ({ key: "grade_level_id", data: r.data?.data || [] }));
        return Promise.resolve({ key: d, data: [] });
      });

      const results = await Promise.all(requests);
      results.forEach(r => data[r.key] = r.data);
      setDropdownData(data);
    } catch (err: any) {
      console.error("Failed to load dropdowns", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Validate required fields
    const missingFields = config.fields.filter(f => f.required && !formData[f.key]);
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.map(f => f.label.replace(' *', '')).join(', ')}`);
      setSaving(false);
      return;
    }

    try {
      const data: any = { id: item.id };
      config.fields.forEach(field => {
        if (field.type === "checkbox") {
          data[field.key] = formData[field.key] ?? field.default ?? false;
        } else if (formData[field.key] !== undefined && formData[field.key] !== "") {
          data[field.key] = field.type === "number" ? Number(formData[field.key]) : formData[field.key];
        }
      });

      await api.put(`${config.endpoint}/${item.id}`, data);
      setSuccess(true);
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to update ${entityType}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{config.title}</h2>
            <p className="text-sm text-slate-600 mt-1">Update {formData.name || "this record"}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.fields.map(field => (
                <div key={field.key}>
                  {field.type === "checkbox" ? (
                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={formData[field.key] ?? field.default ?? false}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">{field.label}</span>
                    </label>
                  ) : field.type === "dropdown" ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                      <select
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value ? Number(e.target.value) : "" })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        required={field.required}
                      >
                        <option value="">Select...</option>
                        {(dropdownData[field.key] || []).map((item: any) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                      <input
                        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
