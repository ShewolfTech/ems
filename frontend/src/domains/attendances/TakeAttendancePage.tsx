import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getClassesList } from "@/domains/academics/classes/services.js";
import api from "@/utils/api.js";

export function TakeAttendancePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClass = searchParams.get("classId");

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(preselectedClass);
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [records, setRecords] = useState<Array<{ studentId: number; status: string }>>([]);

  // Load classes
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getClassesList();
        setClasses(res?.data || []);
      } catch (e) {
        console.error("Failed to load classes", e);
      }
    };
    load();
  }, []);

  // Load attendance when class selected
  useEffect(() => {
    if (!selectedClassId) {
      setAttendance(null);
      return;
    }
    setLoading(true);
    api.get(`/academics/classes/${selectedClassId}/attendance`)
      .then((res) => {
        const data = res?.data;
        setAttendance(data);
        if (data?.students) {
          setRecords(
            data.students.map((s: any) => ({
              studentId: s.student_id,
              status: s.status || "P",
            }))
          );
        }
      })
      .catch((err) => {
        console.error("Failed to load attendance", err);
        setAttendance(null);
      })
      .finally(() => setLoading(false));
  }, [selectedClassId]);

  const updateStatus = useCallback((studentId: number, status: string) => {
    setRecords((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
  }, []);

  const markAll = useCallback(
    (status: string) => {
      setRecords((prev) => prev.map((r) => ({ ...r, status })));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!attendance?.session_id) return;
    setSubmitting(true);
    try {
      await api.post("/academics/classes/attendance/mark", { sessionId: attendance.session_id, records });
      alert("Attendance saved successfully!");
      navigate("/attendances");
    } catch (e: any) {
      alert("Failed to save: " + (e.response?.data?.message || e.message));
    } finally {
      setSubmitting(false);
    }
  }, [attendance?.session_id, records, navigate]);

  const selectedClass = classes.find((c) => String(c.id) === selectedClassId);

  const presentCount = records.filter((r) => r.status === "P").length;
  const absentCount = records.filter((r) => r.status === "A").length;
  const lateCount = records.filter((r) => r.status === "L").length;
  const excusedCount = records.filter((r) => r.status === "E").length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Take Attendance</h1>
            <p className="text-gray-600 text-sm">
              {new Date().toLocaleDateString("en-UG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => navigate("/attendances")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            ← Back to Attendances
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Class Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={selectedClassId || ""}
            onChange={(e) => setSelectedClassId(e.target.value || null)}
          >
            <option value="">— Choose a class —</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.code ? `(${c.code})` : ""} {c.stream ? `— Stream ${c.stream}` : ""} — {c.grade_level_name || "No grade"} ({c.student_count || 0} students)
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Loading attendance...
          </div>
        )}

        {attendance && !loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-green-700">{presentCount}</div>
                <div className="text-sm text-green-600">Present</div>
              </div>
              <div className="bg-red-50 rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-red-700">{absentCount}</div>
                <div className="text-sm text-red-600">Absent</div>
              </div>
              <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-yellow-700">{lateCount}</div>
                <div className="text-sm text-yellow-600">Late</div>
              </div>
              <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-purple-700">{excusedCount}</div>
                <div className="text-sm text-purple-600">Excused</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-3">
              <button onClick={() => markAll("P")} className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium">
                ✓ All Present
              </button>
              <button onClick={() => markAll("A")} className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium">
                ✗ All Absent
              </button>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {attendance.students.map((student: any, idx: number) => {
                    const status = records.find((r) => r.studentId === student.student_id)?.status || "P";
                    const colors: Record<string, string> = {
                      P: "bg-green-100 text-green-800",
                      A: "bg-red-100 text-red-800",
                      L: "bg-yellow-100 text-yellow-800",
                      E: "bg-purple-100 text-purple-800",
                    };
                    return (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.admission_no || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-1">
                          {(["P", "A", "L", "E"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(student.student_id, s)}
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold transition-all ${
                                status === s
                                  ? s === "P"
                                    ? "bg-green-600 text-white"
                                    : s === "A"
                                    ? "bg-red-600 text-white"
                                    : s === "L"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-purple-600 text-white"
                                  : colors[s]
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Save */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TakeAttendancePage;
