import React, { useState } from "react";
import { useAcademicYears } from "@/domains/academics/academic_years/hooks/useAcademicYears.js";

interface TermsFormProps {
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function TermsForm({ initialData, onClose, onSave }: TermsFormProps) {
  const { data: years, loading: yearsLoading } = useAcademicYears({ autoFetch: true }) as any;
  const [termType, setTermType] = useState(initialData?.name || "Term 1");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.is_active = formData.get("is_active") === "on";
    data.academic_year_id = Number(data.academic_year_id);

    if (initialData?.id) {
      data.id = initialData.id;
    }

    onSave(data);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {initialData ? "Edit Term" : "New Term"}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year <span className="text-red-500">*</span>
          </label>
          <select
            name="academic_year_id"
            required
            defaultValue={initialData?.academic_year_id || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Academic Year</option>
            {yearsLoading ? (
              <option value="" disabled>Loading...</option>
            ) : years?.map((y: any) => (
              <option key={y.id} value={y.id}>
                {y.name}{y.code ? ` (${y.code})` : ""}{y.is_current ? " ★" : ""}
              </option>
            ))}
          </select>
          {years?.length === 0 && !yearsLoading && (
            <p className="text-xs text-red-500 mt-1">⚠️ Create an academic year first</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Term <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["Term 1", "Term 2", "Term 3"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setTermType(term)}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  termType === term
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {term}
              </button>
            ))}
          </div>
          <input type="hidden" name="name" value={termType} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input
            type="text"
            name="code"
            defaultValue={initialData?.code || ""}
            placeholder="e.g., 2026-term1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              required
              defaultValue={initialData?.start_date?.split("T")[0] || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="end_date"
              required
              defaultValue={initialData?.end_date?.split("T")[0] || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={initialData?.is_active !== false}
            id="term_is_active"
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="term_is_active" className="text-sm font-medium text-gray-700">Active Term</label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {initialData ? "Update Term" : "Create Term"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TermsForm;
