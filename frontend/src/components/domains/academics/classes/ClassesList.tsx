import React from "react";
import { useNavigate } from "react-router-dom";

interface ClassesListProps {
  data?: any[];
  loading?: boolean;
  onSelect?: (item: any) => void;
  onAttendance?: (item: any) => void;
  onDelete?: (id: string) => Promise<void>;
}

export function ClassesList({ data = [], loading = false, onSelect, onAttendance, onDelete, onEdit }: ClassesListProps) {
  const navigate = useNavigate();

  const handleAttendance = (item: any) => {
    if (onAttendance) {
      onAttendance(item);
    } else {
      navigate(`/attendances/take-attendance?classId=${item.id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Loading classes...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-lg text-gray-500">No classes found</p>
        <p className="text-sm text-gray-400 mt-1">Click "New Class" to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Horizontal scroll wrapper with sticky first column */}
      <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-40 w-64">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Curriculum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Teacher</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Students</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-30 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50 cursor-pointer group" onClick={() => onSelect?.(cls)}>
                  <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50 z-20 max-w-xs">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{cls.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {cls.code || "—"}
                          </span>
                          {cls.stream && (
                            <span className="text-xs text-gray-500">Stream {cls.stream}</span>
                          )}
                        </div>
                        {cls.room && (
                          <div className="text-xs text-gray-400 mt-1">📍 {cls.room}</div>
                        )}
                        {cls.capacity && (
                          <div className="text-xs text-gray-400">Capacity: {cls.capacity}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{cls.grade_level_name || "—"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cls.curriculum_name || "—"}</div>
                    {cls.academic_year && (
                      <div className="text-xs text-gray-400">{cls.academic_year}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{cls.teacher_name || "Unassigned"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${
                      (cls.student_count || 0) > 0
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {cls.student_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cls.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {cls.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center sticky right-0 bg-white group-hover:bg-gray-50 z-20" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onSelect?.(cls)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        title="View details"
                      >
                        View
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(cls.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                          title="Delete class"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClassesList;
