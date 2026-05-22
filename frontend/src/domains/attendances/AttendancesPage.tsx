import React from "react";
import { useNavigate } from "react-router-dom";

export function AttendancesPage() {
  const navigate = useNavigate();
  
  const links = [
    { label: "Take Attendance", path: "/attendances/take-attendance", desc: "Mark daily attendance for a class", icon: "✓" },
    { label: "Attendance Records", path: "/attendances/attendance_records", desc: "View historical attendance records", icon: "📋" },
    { label: "Attendance Sessions", path: "/attendances/attendance_sessions", desc: "Manage attendance sessions", icon: "📅" },
    { label: "Attendance Policies", path: "/attendances/attendance_policies", desc: "Configure attendance rules", icon: "⚙️" },
    { label: "Attendance Summary", path: "/attendances/report_attendance_summary", desc: "View attendance statistics", icon: "📊" },
    { label: "Leave Types", path: "/attendances/leave_types", desc: "Manage leave categories", icon: "🏖️" },
    { label: "Leaves", path: "/attendances/leaves", desc: "Track staff leave requests", icon: "📝" },
  ];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Attendances</h1>
          <p className="text-gray-600 text-sm">Manage class attendance, leaves, and reports</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
            >
              <div className="text-2xl mb-2">{link.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800">{link.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AttendancesPage;
