import React, { useEffect, useState } from "react";
import { loadClassTeachers, assignClassTeacher, removeClassTeacher } from "@/domains/academics/classes/controller.js";
import api from "@/utils/api.js";

interface ClassesDetailProps {
  item: any;
  onClose: () => void;
}

export function ClassesDetail({ item, onClose }: ClassesDetailProps) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ teacherId: "", subjectId: "", isHomeroom: false });
  const [editingSubject, setEditingSubject] = useState<number | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferStudentId, setTransferStudentId] = useState<number | null>(null);
  const [transferTargetClass, setTransferTargetClass] = useState<string>("");
  const [showBulkEnroll, setShowBulkEnroll] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [bulkEnrolling, setBulkEnrolling] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  // Use teachers from API response if available, otherwise load separately
  useEffect(() => {
    if (item?.teachers && item.teachers.length > 0) {
      setTeachers(item.teachers.map((t: any) => ({
        ...t,
        teacher_name: t.first_name && t.last_name ? `${t.first_name} ${t.last_name}` : "Unknown",
      })));
    } else if (item?.id) {
      setLoading(true);
      loadClassTeachers(item.id)
        .then((res) => setTeachers(res?.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [item?.id, item?.teachers]);

  // Load subjects and staff for dropdowns
  useEffect(() => {
    if (showAssign) {
      // Load subjects
      if (item?.availableSubjects && item.availableSubjects.length > 0) {
        setSubjects(item.availableSubjects);
      } else {
        api.get("/academics/subjects")
          .then(r => {
            const data = r.data?.data || r.data || [];
            setSubjects(data);
          })
          .catch(console.error);
      }
      // Load staff
      api.get("/staffmgt/staff")
        .then(r => {
          const data = r.data?.data || r.data || [];
          setStaff(data);
        })
        .catch(console.error);
    }
  }, [showAssign]);

  // Load all classes and available students for enrollment/transfer
  useEffect(() => {
    if (showBulkEnroll || showTransfer) {
      // Load all classes (for transfer dropdown)
      api.get("/academics/classes")
        .then(r => {
          const data = r.data?.data || [];
          setAllClasses(Array.isArray(data) ? data.filter((c: any) => c.id !== item?.id) : []);
        })
        .catch(() => setAllClasses([]));

      // Load available students for bulk enrollment
      if (showBulkEnroll) {
        api.get("/studentsmgt/students")
          .then(r => {
            const data = r.data?.data || r.data?.students || [];
            const enrolledIds = new Set((item?.students || []).map((s: any) => s.student_id || s.id));
            const available = Array.isArray(data) ? data.filter((s: any) => !enrolledIds.has(s.id)) : [];
            setAvailableStudents(available);
            setSelectedStudentIds(new Set());
          })
          .catch(() => setAvailableStudents([]));
      }
    }
  }, [showBulkEnroll, showTransfer, item?.id, item?.students]);

  // Update local students when item changes
  useEffect(() => {
    if (item?.students) {
      setStudents(item.students);
    }
  }, [item?.students]);

  const handleAssign = async () => {
    if (!assignForm.teacherId || !item?.id) return;
    setAssigning(true);
    try {
      await assignClassTeacher(item.id, {
        teacherId: Number(assignForm.teacherId),
        subjectId: assignForm.subjectId ? Number(assignForm.subjectId) : undefined,
        isPrimary: assignForm.isHomeroom,
      });
      setShowAssign(false);
      setAssignForm({ teacherId: "", subjectId: "", isHomeroom: false });
      const res = await loadClassTeachers(item.id);
      setTeachers(res?.data || []);
    } catch (e: any) {
      alert("Failed: " + (e.response?.data?.message || e.message));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!window.confirm("Remove this teacher from the class?")) return;
    try {
      await removeClassTeacher(item.id, id);
      const res = await loadClassTeachers(item.id);
      setTeachers(res?.data || []);
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  // Feature: Update teacher subject inline
  const handleUpdateSubject = async (teacherId: number, subjectId: string | null) => {
    if (!item?.id) return;
    try {
      await api.put(`/academics/classes/${item.id}/teachers/${teacherId}`, {
        subjectId: subjectId ? Number(subjectId) : null,
      });
      setEditingSubject(null);
      const res = await loadClassTeachers(item.id);
      setTeachers(res?.data || []);
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  // Feature: Transfer student to another class
  const handleTransferStudent = async () => {
    if (!transferStudentId || !transferTargetClass || !item?.id) return;
    if (!window.confirm("Transfer this student to the selected class?")) return;
    try {
      await api.post(`/academics/classes/${item.id}/students/${transferStudentId}/transfer`, {
        targetClassId: Number(transferTargetClass),
      });
      setShowTransfer(false);
      setTransferStudentId(null);
      setTransferTargetClass("");
      // Reload class data
      const res = await api.get(`/academics/classes/${item.id}`);
      setStudents(res?.data?.students || []);
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  // Feature: Bulk enroll students
  const toggleSelectStudent = (studentId: number) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === availableStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(availableStudents.map((s: any) => s.id)));
    }
  };

  const handleBulkEnroll = async () => {
    if (!item?.id || selectedStudentIds.size === 0) return;
    setBulkEnrolling(true);
    try {
      await api.post(`/academics/classes/${item.id}/students/bulk`, { studentIds: Array.from(selectedStudentIds) });
      setSelectedStudentIds(new Set());
      // Reload class data
      const res = await api.get(`/academics/classes/${item.id}`);
      setStudents(res?.data?.students || []);
      setShowBulkEnroll(false);
    } catch (e: any) {
      alert("Failed: " + e.message);
    } finally {
      setBulkEnrolling(false);
    }
  };

  if (!item) return null;

  const homeroomTeacher = teachers.find((t) => t.is_primary);
  const subjectTeachers = teachers.filter((t) => !t.is_primary);

  return (
    <div className="space-y-6">
      {/* Class Info Card */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</div>
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Code</div>
            <div className="text-sm text-gray-900">{item.code || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stream</div>
            <div className="text-sm text-gray-900">{item.stream || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</div>
            <div className="text-sm text-gray-900">{item.academic_year || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</div>
            <div className="text-sm text-gray-900">{item.grade_level_name || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Curriculum</div>
            <div className="text-sm text-gray-900">{item.curriculum_name || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Room</div>
            <div className="text-sm text-gray-900">{item.room || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</div>
            <div className="text-sm text-gray-900">{item.capacity || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Homeroom Teacher</div>
            <div className="text-sm text-gray-900">{homeroomTeacher?.teacher_name || "Unassigned"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Teachers</div>
            <div className="text-sm text-gray-900">{subjectTeachers.length > 0 ? subjectTeachers.map((t) => t.teacher_name).join(", ") : "None assigned"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
              item.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}>
              {item.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        {item.description && (
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</div>
            <div className="text-sm text-gray-900 mt-1">{item.description}</div>
          </div>
        )}
      </div>

      {/* Teachers & Subjects */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Teachers & Subjects ({teachers.length})
          </h3>
          <button
            onClick={() => setShowAssign(!showAssign)}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showAssign ? "Cancel" : "+ Assign Teacher"}
          </button>
        </div>

        {showAssign && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Teacher *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  value={assignForm.teacherId}
                  onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })}
                >
                  <option value="">Select teacher...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} {s.email ? `(${s.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="role"
                      checked={assignForm.isHomeroom}
                      onChange={() => setAssignForm({ ...assignForm, isHomeroom: true, subjectId: "" })}
                      className="form-radio h-4 w-4 text-purple-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Homeroom</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="role"
                      checked={!assignForm.isHomeroom}
                      onChange={() => setAssignForm({ ...assignForm, isHomeroom: false })}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Subject Teacher</span>
                  </label>
                </div>
              </div>
            </div>
            {!assignForm.isHomeroom && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject (Optional)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  value={assignForm.subjectId}
                  onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
                >
                  <option value="">All subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} {sub.code ? `(${sub.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleAssign}
                disabled={assigning || !assignForm.teacherId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-4 text-sm">Loading teachers...</div>
        ) : teachers.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
            No teachers assigned. Click "Assign Teacher" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {t.is_primary ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Homeroom
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Subject
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {t.teacher_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {editingSubject === t.id ? (
                        <select
                          className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                          value={t.subject_id || ""}
                          onChange={(e) => handleUpdateSubject(t.id, e.target.value || null)}
                          onBlur={() => setEditingSubject(null)}
                          autoFocus
                        >
                          <option value="">All subjects</option>
                          {subjects.map((sub) => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingSubject(t.id)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          title="Click to edit subject"
                        >
                          {t.subject_name || <span className="text-gray-400 italic">All subjects</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                      <button onClick={() => handleRemove(t.id)} className="text-red-600 hover:text-red-900 text-xs">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enrolled Students */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Enrolled Students ({students?.length || 0})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkEnroll(!showBulkEnroll)}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {showBulkEnroll ? "Cancel" : "+ Bulk Enroll"}
            </button>
          </div>
        </div>

        {/* Bulk Enrollment Panel */}
        {showBulkEnroll && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-gray-700">Select students to enroll</label>
              <div className="flex gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  {selectedStudentIds.size === availableStudents.length ? "Deselect All" : "Select All"}
                </button>
                {selectedStudentIds.size > 0 && (
                  <button
                    onClick={handleBulkEnroll}
                    disabled={bulkEnrolling}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {bulkEnrolling ? "Enrolling..." : `Enroll ${selectedStudentIds.size} Selected`}
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded bg-white">
              {availableStudents.length === 0 ? (
                <p className="p-3 text-sm text-gray-500">No available students to add</p>
              ) : (
                availableStudents.map((s: any) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2 p-2 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
                      selectedStudentIds.has(s.id) ? "bg-green-50" : ""
                    }`}
                    onClick={() => toggleSelectStudent(s.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.has(s.id)}
                      onChange={() => {}}
                      className="rounded border-gray-300 pointer-events-none"
                    />
                    <span className="text-sm">
                      {s.first_name} {s.last_name} ({s.admission_no || s.id})
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {students && students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date of Birth</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((s: any) => (
                  <tr key={s.student_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{s.admission_no || "—"}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {s.first_name} {s.last_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{s.gender || "—"}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setTransferStudentId(s.student_id);
                          setShowTransfer(true);
                        }}
                        className="text-orange-600 hover:text-orange-900 text-xs"
                        title="Transfer to another class"
                      >
                        Transfer
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm("Remove this student from class?")) return;
                          try {
                            await api.delete(`/academics/classes/${item.id}/students/${s.student_id}`);
                            setStudents(students.filter((st: any) => st.student_id !== s.student_id));
                          } catch (e: any) {
                            alert("Failed: " + e.message);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 text-xs"
                        title="Remove from class"
                      >
                        Remove
                      </button>
                      {/* Transfer dropdown inline */}
                      {showTransfer && transferStudentId === s.student_id && (
                        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                          <div className="text-xs text-gray-600 mb-1">Transfer to:</div>
                          <select
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                            value={transferTargetClass}
                            onChange={(e) => setTransferTargetClass(e.target.value)}
                          >
                            <option value="">Select class...</option>
                            {allClasses.map((c: any) => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.code})
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={handleTransferStudent}
                              disabled={!transferTargetClass}
                              className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => { setShowTransfer(false); setTransferStudentId(null); setTransferTargetClass(""); }}
                              className="text-xs text-gray-600 px-2 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
            No students enrolled in this class. Click "Bulk Enroll" to add students.
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassesDetail;
