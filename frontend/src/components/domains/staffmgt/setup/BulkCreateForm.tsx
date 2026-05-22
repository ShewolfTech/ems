import React, { useState, useEffect } from "react";
import { Settings, X, Plus, Minus, Loader2, Save } from "lucide-react";

interface BulkCreateFormProps {
  entityType: "departments" | "staff" | "roles" | "employment_types" | "education_levels";
  onSave: () => void;
  onClose: () => void;
}

type FormField = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

export function BulkCreateForm({ entityType, onSave, onClose }: BulkCreateFormProps) {
  const [rows, setRows] = useState<Array<Record<string, any>>>(
    initializeRows(entityType)
  );
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    // Define field config based on entity type
    let newFields: FormField[] = [];
    let newTitle = "";
    
    switch (entityType) {
      case "departments":
        newTitle = "Create New Departments";
        newFields = [
          { name: "name", label: "Department Name", required: true },
          { name: "code", label: "Code", required: true },
          { name: "manager_name", label: "Manager Name", required: false },
          { name: "description", label: "Description", type: "textarea", required: false },
          { name: "is_active", label: "Is Active", type: "select", required: false, options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" }
          ]}
        ];
        break;
      case "staff":
        newTitle = "Add New Staff Members";
        newFields = [
          { name: "first_name", label: "First Name", required: true },
          { name: "last_name", label: "Last Name", required: true },
          { name: "email", label: "Email", type: "text", required: true },
          { name: "phone", label: "Phone", type: "text", required: false },
          { name: "gender", label: "Gender", type: "select", required: false, options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" }
          ]},
          { name: "department_id", label: "Department ID", type: "number", required: false },
          { name: "role_id", label: "Role ID", type: "number", required: false },
          { name: "hire_date", label: "Hire Date", type: "text", required: true, placeholder: "YYYY-MM-DD" },
          { name: "employment_type", label: "Employment Type", type: "select", required: false, options: [
            { value: "full_time", label: "Full-time" },
            { value: "part_time", label: "Part-time" },
            { value: "contract", label: "Contract" },
            { value: "temp", label: "Temporary" }
          ]}
        ];
        break;
      case "roles":
        newTitle = "Create New Roles";
        newFields = [
          { name: "name", label: "Role Name", required: true },
          { name: "code", label: "Code", required: true },
          { name: "description", label: "Description", type: "textarea", required: false },
          { name: "grade", label: "Grade", type: "text", required: false },
          { name: "is_active", label: "Is Active", type: "select", required: false, options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" }
          ]}
        ];
        break;
      case "employment_types":
        newTitle = "Create New Employment Types";
        newFields = [
          { name: "title", label: "Title", required: true },
          { name: "code", label: "Code", required: true },
          { name: "description", label: "Description", type: "textarea", required: false },
          { name: "is_active", label: "Is Active", type: "select", required: false, options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" }
          ]}
        ];
        break;
      case "education_levels":
        newTitle = "Create New Education Levels";
        newFields = [
          { name: "title", label: "Title", required: true },
          { name: "code", label: "Code", required: true },
          { name: "description", label: "Description", type: "textarea", required: false },
          { name: "is_active", label: "Is Active", type: "select", required: false, options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" }
          ]}
        ];
        break;
      default:
        newTitle = "Create New Items";
    }
    
    setFields(newFields);
    setTitle(newTitle);
  }, [entityType]);

  function initializeRows(entityType: string): Array<Record<string, any>> {
    // Initialize with one empty row
    return [{}];
  }

  const addRow = () => {
    setRows([...rows, {}]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      const newRows = [...rows];
      newRows.splice(index, 1);
      setRows(newRows);
    }
  };

  const handleCellChange = (rowIndex: number, field: string, value: any) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
    setRows(newRows);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        for (const field of fields) {
          if (field.required && (!row[field.name] || row[field.name].toString().trim() === "")) {
            alert(`Field '${field.label}' in row ${i+1} is required.`);
            setLoading(false);
            return;
          }
        }
      }

      // Here we would make the actual service call
      // For now, let's just call the onSave callback after simulating the save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, you would call the appropriate service based on entity type
      // await someServiceMethod(rows);
      
      onSave();
    } catch (error: any) {
      alert(`Error: ${error.message || "Failed to save"}`);
      setLoading(false);
    }
  };

  const renderInput = (rowIndex: number, field: FormField) => {
    const value = rows[rowIndex][field.name] || "";
    const props = {
      className: "w-full px-3 py-2 border border-slate-300 rounded text-sm",
      placeholder: field.placeholder
    };

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => handleCellChange(rowIndex, field.name, e.target.value)}
          required={field.required}
          {...props}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      );
    } else if (field.type === "textarea") {
      return (
        <textarea
          value={value}
          onChange={(e) => handleCellChange(rowIndex, field.name, e.target.value)}
          required={field.required}
          rows={2}
          {...props}
          className={`${props.className} resize-none`}
        />
      );
    } else {
      return (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => handleCellChange(rowIndex, field.name, e.target.value === "" ? null : e.target.value)}
          required={field.required}
          {...props}
        />
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-teal-50">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-xs text-slate-500 uppercase">Actions</th>
                  {fields.map(field => (
                    <th key={field.name} className="px-3 py-2 text-left font-semibold text-xs text-slate-500 uppercase">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {rows.length > 1 && (
                          <button
                            onClick={() => removeRow(rowIndex)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                        {rowIndex === rows.length - 1 && (
                          <button
                            onClick={addRow}
                            className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    {fields.map(field => (
                      <td key={`${rowIndex}-${field.name}`} className="px-3 py-2 align-top">
                        {renderInput(rowIndex, field)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkCreateForm;