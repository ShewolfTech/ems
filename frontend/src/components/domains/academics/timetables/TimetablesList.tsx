import React from "react";

interface TimetablesListProps {
  data?: any[];
  loading?: boolean;
  onSelect?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => Promise<void>;
}

export function TimetablesList({ data, loading, onSelect, onEdit, onDelete }: TimetablesListProps) {
  if (loading) return <div className="text-center py-8 text-gray-500">Loading timetables...</div>;
  if (!data || data.length === 0) return <div className="text-center py-8 text-gray-500">No timetables found. Click "+ New Timetable" to create one.</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((item: any) => (
            <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect?.(item)}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{item.class_name || "—"}</div>
                {item.class_code && <div className="text-xs text-gray-500">{item.class_code}</div>}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{item.term_name || "—"}</div>
                {item.term_code && <div className="text-xs text-gray-500">{item.term_code}</div>}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{item.name || "—"}</td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                }`}>
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 text-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onSelect?.(item)}
                  className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                >
                  View Grid
                </button>
                <button
                  onClick={() => onEdit?.(item)}
                  className="text-orange-600 hover:text-orange-900 text-xs font-medium"
                >
                  Edit
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete?.(item.id)}
                    className="text-red-600 hover:text-red-900 text-xs font-medium"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimetablesList;
