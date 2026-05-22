import React from "react";

interface AcademicYearsFormProps {
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function AcademicYearsForm({ initialData, onClose, onSave }: AcademicYearsFormProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.is_active = formData.get("is_active") === "on";
    data.is_current = formData.get("is_current") === "on";

    if (initialData?.id) {
      data.id = initialData.id;
    }

    onSave(data);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {initialData ? "Edit Academic Year" : "New Academic Year"}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year <span className="text-red-500">*</span>
          </label>
          <select
            name="name"
            required
            defaultValue={initialData?.name || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={`${y}`}>{y} ({y}-{y + 1})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input
            type="text"
            name="code"
            defaultValue={initialData?.code || ""}
            placeholder="e.g., AY-2026"
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

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={initialData?.is_active !== false}
              id="is_active"
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active Year</label>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
            <input
              type="checkbox"
              name="is_current"
              defaultChecked={!!initialData?.is_current}
              id="is_current"
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="is_current" className="text-sm font-medium text-gray-700">Current Year</label>
          </div>
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
            {initialData ? "Update Year" : "Create Year"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AcademicYearsForm;
