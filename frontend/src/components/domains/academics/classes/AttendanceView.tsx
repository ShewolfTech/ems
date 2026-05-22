import React, { useState, useCallback } from "react";

interface AttendanceProps {
  attendance: any;
  loading: boolean;
  onMarkAttendance: (records: Array<{ studentId: number; status: string; remark?: string }>) => void;
  submitting: boolean;
}

export function AttendanceView({ attendance, loading, onMarkAttendance, submitting }: AttendanceProps) {
  const [records, setRecords] = useState<Array<{ studentId: number; status: string; remark?: string }>>(
    attendance?.students?.map((s: any) => ({
      studentId: s.student_id,
      status: s.status || "P",
      remark: s.remark || undefined,
    })) || []
  );

  const updateStatus = useCallback((studentId: number, status: string) => {
    setRecords((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
  }, []);

  const handleSave = () => {
    onMarkAttendance(records);
  };

  const markAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: "P" })));
  };

  const markAllAbsent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: "A" })));
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Loading attendance...</div>;
  }

  if (!attendance || !attendance.students || attendance.students.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-lg text-gray-500">No students enrolled in this class</p>
        <p className="text-sm text-gray-400 mt-1">Enroll students first to take attendance</p>
      </div>
    );
  }

  const presentCount = records.filter((r) => r.status === "P").length;
  const absentCount = records.filter((r) => r.status === "A").length;
  const lateCount = records.filter((r) => r.status === "L").length;
  const excusedCount = records.filter((r) => r.status === "E").length;

  return (
    <div>
      {/* Attendance Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Daily Attendance</h3>
          <p className="text-sm text-gray-500">
            {attendance.date ? new Date(attendance.date + "T00:00:00").toLocaleDateString("en-UG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }) : "Today"}
            {attendance.status === "completed" && " ✓ Completed"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllPresent}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            All Present
          </button>
          <button
            onClick={markAllAbsent}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{presentCount}</div>
          <div className="text-xs text-green-600">Present</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{absentCount}</div>
          <div className="text-xs text-red-600">Absent</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-700">{lateCount}</div>
          <div className="text-xs text-yellow-600">Late</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-700">{excusedCount}</div>
          <div className="text-xs text-purple-600">Excused</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">P</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">A</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">L</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">E</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {attendance.students.map((student: any, idx: number) => {
              const record = records.find((r) => r.studentId === student.student_id);
              return (
                <tr key={student.student_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.admission_no || "—"}</td>
                  {(["P", "A", "L", "E"] as const).map((status) => {
                    const isActive = record?.status === status;
                    const colors: Record<string, string> = {
                      P: isActive ? "bg-green-600 text-white" : "bg-green-100 text-green-700 hover:bg-green-200",
                      A: isActive ? "bg-red-600 text-white" : "bg-red-100 text-red-700 hover:bg-red-200",
                      L: isActive ? "bg-yellow-500 text-white" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                      E: isActive ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700 hover:bg-purple-200",
                    };
                    return (
                      <td key={status} className="px-4 py-3 text-center">
                        <button
                          onClick={() => updateStatus(student.student_id, status)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${colors[status]}`}
                        >
                          {status}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
}

export default AttendanceView;
