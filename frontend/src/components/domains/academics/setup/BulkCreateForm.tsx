import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Calendar, Clock, BookOpen, Settings, Users, Loader2, CheckCircle } from "lucide-react";
import api from "@/utils/api.js";

interface BulkCreateFormProps {
  entityType: "years" | "terms" | "subjects" | "grades" | "curricula" | "streams" | "classes";
  onSave: () => void;
  onClose: () => void;
}

const entityConfig = {
  years: {
    title: "Bulk Create Academic Years",
    subtitle: "Create multiple academic years at once",
    icon: Calendar,
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
    title: "Bulk Create Terms",
    subtitle: "Create multiple terms at once",
    icon: Clock,
    endpoint: "/academics/terms",
    dropdowns: ["academicYears"],
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
    title: "Bulk Create Subjects",
    subtitle: "Create multiple subjects at once",
    icon: BookOpen,
    endpoint: "/academics/subjects",
    dropdowns: ["curricula", "gradeLevels"],
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
    title: "Bulk Create Grade Levels",
    subtitle: "Create multiple grade levels at once",
    icon: Settings,
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
    title: "Bulk Create Curricula",
    subtitle: "Create multiple curricula at once",
    icon: BookOpen,
    endpoint: "/academics/curricula",
    fields: [
      { key: "name", label: "Name *", type: "text", placeholder: "e.g., National Curriculum", required: true },
      { key: "code", label: "Code *", type: "text", placeholder: "e.g., NC", required: true },
      { key: "description", label: "Description", type: "text" },
      { key: "is_active", label: "Active", type: "checkbox", default: true },
    ]
  },
  streams: {
    title: "Bulk Create Streams",
    subtitle: "Create multiple streams at once",
    icon: Users,
    endpoint: "/academics/streams",
    fields: [
      { key: "name", label: "Name *", type: "text", placeholder: "e.g., Stream A", required: true },
      { key: "code", label: "Code *", type: "text", placeholder: "e.g., A", required: true },
      { key: "description", label: "Description", type: "text" },
      { key: "is_active", label: "Active", type: "checkbox", default: true },
    ]
  },
  classes: {
    title: "Bulk Create Classes",
    subtitle: "Create multiple classes at once",
    icon: Users,
    endpoint: "/academics/classes",
    dropdowns: ["gradeLevels", "curricula"],
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

export function BulkCreateForm({ entityType, onSave, onClose }: BulkCreateFormProps) {
  const config = entityConfig[entityType];
  const Icon = config.icon;
  
  const [dropdownData, setDropdownData] = useState<any>({});
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([{}]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    loadDropdowns();
  }, [entityType]);

  const loadDropdowns = async () => {
    if (!config.dropdowns || config.dropdowns.length === 0) return;
    setDropdownLoading(true);
    try {
      const data: any = {};
      const requests = config.dropdowns.map(d => {
        if (d === "academicYears") return api.get("/academics/academic-years").then(r => ({ key: "academic_year_id", data: r.data?.data || [] }));
        if (d === "curricula") return api.get("/academics/curricula").then(r => ({ key: "curriculum_id", data: r.data?.data || [] }));
        if (d === "gradeLevels") return api.get("/academics/grade-levels").then(r => ({ key: "grade_level_id", data: r.data?.data || [] }));
        return Promise.resolve({ key: d, data: [] });
      });

      const results = await Promise.all(requests);
      results.forEach(r => data[r.key] = r.data);
      setDropdownData(data);
    } catch (err: any) {
      console.error("Failed to load dropdowns", err);
      setError("Failed to load dropdown data. Please try again.");
    } finally {
      setDropdownLoading(false);
    }
  };

  const addRow = () => {
    setRows([...rows, {}]);
  };

  const removeRow = (idx: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: string, value: any) => {
    const updated = [...rows];
    updated[idx] = { ...updated[idx], [field]: value };
    setRows(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessCount(0);

    const validRows = rows.filter(r => {
      // Check required fields
      return config.fields.some(f => f.required && !r[f.key]);
    });

    if (validRows.length > 0) {
      setError("Please fill in all required fields (*)");
      setSaving(false);
      return;
    }

    try {
      let count = 0;
      for (const row of rows) {
        // Filter out empty fields and checkboxes
        const data: any = {};
        config.fields.forEach(field => {
          if (field.type === "checkbox") {
            data[field.key] = row[field.key] ?? field.default ?? false;
          } else if (row[field.key] !== undefined && row[field.key] !== "") {
            data[field.key] = field.type === "number" ? Number(row[field.key]) : row[field.key];
          }
        });

        await api.post(config.endpoint, data);
        count++;
      }
      setSuccessCount(count);
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to create ${entityType}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Icon className="w-6 h-6 text-teal-600" />
              {config.title}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{config.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {successCount > 0 && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Successfully created {successCount} {entityType}!
              </div>
            )}

            {/* Rows */}
            {rows.map((row, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-slate-700">{entityType === "years" ? "Year" : "Entry"} #{idx + 1}</h4>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.fields.map(field => (
                    <div key={field.key}>
                      {field.type === "checkbox" ? (
                        <label className="flex items-center gap-2 mt-6">
                          <input
                            type="checkbox"
                            checked={row[field.key] ?? field.default ?? false}
                            onChange={(e) => updateRow(idx, field.key, e.target.checked)}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm font-medium text-slate-700">{field.label}</span>
                        </label>
                      ) : field.type === "dropdown" ? (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                          <select
                            value={row[field.key] || ""}
                            onChange={(e) => updateRow(idx, field.key, e.target.value ? Number(e.target.value) : "")}
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
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {field.label}
                          </label>
                          <input
                            type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                            value={row[field.key] || ""}
                            onChange={(e) => updateRow(idx, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Add Row Button */}
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50"
            >
              <Plus className="w-4 h-4" />
              Add Another {entityType === "years" ? "Year" : entityType.slice(0, -1)}
            </button>
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
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {saving ? "Creating..." : `Create ${rows.length} ${config.title.split(" ")[2] || "Items"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkCreateForm;
