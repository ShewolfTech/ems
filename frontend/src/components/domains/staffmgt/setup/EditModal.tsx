import React, { useState, useEffect } from "react";
import { Settings, X, Save, Loader2 } from "lucide-react";

interface EditModalProps {
  entityType: "departments" | "staff" | "roles" | "employment_types" | "education_levels";
  item: any;
  onSave: () => void;
  onClose: () => void;
}

interface FormState {
  [key: string]: any;
}

// Form fields for each entity type
const FORM_CONFIG: Record<string, { field: string; label: string; type?: string; required?: boolean }[]> = {
  departments: [
    { field: "name", label: "Department Name", required: true },
    { field: "code", label: "Code", required: true },
    { field: "manager_name", label: "Manager Name" },
    { field: "description", label: "Description", type: "textarea" },
    { field: "budget", label: "Budget" },
    { field: "is_active", label: "Is Active", type: "checkbox" },
  ],
  staff: [
    { field: "first_name", label: "First Name", required: true },
    { field: "last_name", label: "Last Name", required: true },
    { field: "email", label: "Email", required: true },
    { field: "phone", label: "Phone" },
    { field: "gender", label: "Gender", type: "select", required: false, 
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" }
      ] 
    },
    { field: "birth_date", label: "Birth Date", type: "date" },
    { field: "hire_date", label: "Hire Date", type: "date", required: true },
    { field: "department_id", label: "Department ID", type: "number" },
    { field: "role_id", label: "Role ID", type: "number" },
    { field: "employment_type", label: "Employment Type", type: "select", required: false,
      options: [
        { value: "full_time", label: "Full-time" },
        { value: "part_time", label: "Part-time" },
        { value: "contract", label: "Contract" },
        { value: "temporary", label: "Temporary" }
      ]
    },
    { field: "is_active", label: "Is Active", type: "checkbox" },
  ],
  roles: [
    { field: "name", label: "Role Name", required: true },
    { field: "code", label: "Code", required: true },
    { field: "description", label: "Description", type: "textarea" },
    { field: "grade", label: "Grade" },
    { field: "is_active", label: "Is Active", type: "checkbox" },
  ],
  employment_types: [
    { field: "title", label: "Title", required: true },
    { field: "code", label: "Code", required: true },
    { field: "description", label: "Description", type: "textarea" },
    { field: "is_active", label: "Is Active", type: "checkbox" },
  ],
  education_levels: [
    { field: "title", label: "Title", required: true },
    { field: "code", label: "Code", required: true },
    { field: "description", label: "Description", type: "textarea" },
    { field: "is_active", label: "Is Active", type: "checkbox" },
  ],
};

export function EditModal({ entityType, item, onSave, onClose }: EditModalProps) {
  const [formState, setFormState] = useState<FormState>({});
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  // Set initial form values based on item data
  useEffect(() => {
    if (item) {
      const initialState: FormState = {};
      FORM_CONFIG[entityType]?.forEach(field => {
        if (field.field in item) {
          initialState[field.field] = item[field.field];
        }
      });
      setFormState(initialState);

      // Set the modal title based on the entity being edited
      const entityLabels: Record<string, string> = {
        departments: "Department",
        staff: "Staff Member",
        roles: "Role",
        employment_types: "Employment Type",
        education_levels: "Education Level"
      };
      setTitle(`${entityLabels[entityType]} Details`);
    }
  }, [entityType, item]);

  const handleChange = (field: string, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Make the update request using appropriate service based on entity type
      let updateFunc;
      switch (entityType) {
        case "departments":
          const { updateDepartments } = await import("@/domains/staffmgt/departments/services");
          updateFunc = updateDepartments;
          break;
        case "staff":
          const { updateStaff } = await import("@/domains/staffmgt/staff/services");
          updateFunc = updateStaff;
          break;
        case "roles":
          const { updateRoles } = await import("@/domains/staffmgt/staffmgt_roles/services");
          updateFunc = updateRoles;
          break;
        case "employment_types":
          const { updateEmploymentTypes } = await import("@/domains/staffmgt/employment_types/services");
          updateFunc = updateEmploymentTypes;
          break;
        case "education_levels":
          const { updateEducationLevels } = await import("@/domains/staffmgt/education_levels/services");
          updateFunc = updateEducationLevels;
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      await updateFunc(item.id, formState);
      onSave();
    } catch (error: any) {
      console.error("Update failed:", error);
      alert(`Error: ${error.message || "Failed to update record"}`);
      setLoading(false);
    }
  };

  const fields = FORM_CONFIG[entityType] || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-teal-50">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {fields.map(({ field, label, type = "text", required, options }) => (
            <div key={field}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              {type === "textarea" ? (
                <textarea
                  value={formState[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              ) : type === "checkbox" ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={Boolean(formState[field])}
                    onChange={(e) => handleChange(field, e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 border-slate-300"
                  />
                  <span className="ml-2 text-sm text-slate-600">Is Active</span>
                </div>
              ) : type === "select" ? (
                <select
                  value={formState[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select {label}</option>
                  {options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={type === "date" ? "date" : type === "number" ? "number" : "text"}
                  value={formState[field] || ""}
                  onChange={(e) => handleChange(field, type === "number" ? Number(e.target.value) || null : e.target.value)}
                  className={`w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                    required && !formState[field] ? 'border-red-300' : ''
                  }`}
                  required={required}
                />
              )}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 z-10 p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update {entityType.charAt(0).toUpperCase() + entityType.slice(1).replace('_', '')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;