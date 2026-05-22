import React, { useState, useEffect } from "react";
import { getGradeLevelsList } from "@/domains/academics/grade_levels/services.js";
import { getCurriculaList } from "@/domains/academics/curricula/services.js";
import { loadClassTeachers, assignClassTeacher, removeClassTeacher } from "@/domains/academics/classes/controller.js";
import api from "@/utils/api.js";

export function ClassesForm({ initialData, onCancel: onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const [gradeLevels, setGradeLevels] = useState<any[]>([]);
  const [curricula, setCurricula] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [bulkAdding, setBulkAdding] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferStudentId, setTransferStudentId] = useState<number | null>(null);
  const [transferTargetClass, setTransferTargetClass] = useState<string>("");
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [editingTeacherSubject, setEditingTeacherSubject] = useState<number | null>(null);
  const [addTeacherForm, setAddTeacherForm] = useState({ teacherId: "", subjectId: "", isHomeroom: false });
  const [assigningTeacher, setAssigningTeacher] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    stream: "",
    academic_year: "",
    grade_level_id: "",
    curriculum_id: "",
    teacher_id: "",
    room: "",
    capacity: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [glRes, cuRes] = await Promise.all([
          getGradeLevelsList(),
          getCurriculaList(),
        ]);
        setGradeLevels(glRes?.data || []);
        setCurricula(cuRes?.data || []);
      } catch (e) {
        console.error("Failed to load dropdowns", e);
      }
    };
    loadDropdowns();
  }, []);

  // Load teachers when editing existing class
  useEffect(() => {
    if (initialData?.id) {
      setLoadingTeachers(true);
      loadClassTeachers(initialData.id)
        .then((res) => setTeachers(res?.data || []))
        .catch(console.error)
        .finally(() => setLoadingTeachers(false));
    }
  }, [initialData?.id]);

  // Load students when editing existing class
  useEffect(() => {
    if (initialData?.id) {
      setLoadingStudents(true);
      api.get(`/academics/classes/${initialData.id}`)
        .then(r => r.data)
        .then(res => setStudents(res?.data?.students || []))
        .catch(console.error)
        .finally(() => setLoadingStudents(false));
    }
  }, [initialData?.id]);

  // Load staff and subjects for dropdowns
  useEffect(() => {
    if (showAddTeacher) {
      Promise.all([
        api.get("/staffmgt/staff").then(r => r.data?.data || r.data || []).catch(e => { console.error("Staff error:", e); return []; }),
        api.get("/academics/subjects").then(r => r.data?.data || r.data || []).catch(e => { console.error("Subjects error:", e); return []; }),
      ]).then(([staffData, subjData]) => {
        console.log("Staff loaded:", staffData);
        console.log("Subjects loaded:", subjData);
        setStaff(staffData);
        setSubjects(subjData);
      }).catch(console.error);
    }
  }, [showAddTeacher]);

  // Load available students to add
  useEffect(() => {
    if (showAddStudent && initialData?.id) {
      api.get("/studentsmgt/students")
        .then(r => {
          const data = r.data?.data || r.data?.students || [];
          setAllStudents(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("Failed to load students", err);
          setAllStudents([]);
        });
      // Load all classes for transfer
      api.get("/academics/classes")
        .then(r => {
          const data = r.data?.data || [];
          setAllClasses(Array.isArray(data) ? data.filter((c: any) => c.id !== initialData.id) : []);
        })
        .catch(() => setAllClasses([]));
    }
  }, [showAddStudent, initialData?.id]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        stream: initialData.stream || "",
        academic_year: initialData.academic_year || "",
        grade_level_id: initialData.grade_level_id || "",
        curriculum_id: initialData.curriculum_id || "",
        teacher_id: initialData.teacher_id || "",
        room: initialData.room || "",
        capacity: initialData.capacity || "",
        description: initialData.description || "",
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        ...formData,
        grade_level_id: formData.grade_level_id ? Number(formData.grade_level_id) : null,
        curriculum_id: formData.curriculum_id ? Number(formData.curriculum_id) : null,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        teacher_id: formData.teacher_id ? Number(formData.teacher_id) : null,
      };
      if (initialData?.id) payload.id = initialData.id;
      await onSave(payload);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTeacher = async () => {
    if (!addTeacherForm.teacherId || !initialData?.id) return;
    setAssigningTeacher(true);
    try {
      await assignClassTeacher(initialData.id, {
        teacherId: Number(addTeacherForm.teacherId),
        subjectId: addTeacherForm.subjectId ? Number(addTeacherForm.subjectId) : undefined,
        isPrimary: addTeacherForm.isHomeroom,
      });
      setShowAddTeacher(false);
      setAddTeacherForm({ teacherId: "", subjectId: "", isHomeroom: false });
      const res = await loadClassTeachers(initialData.id);
      setTeachers(res?.data || []);
    } catch (e: any) {
      alert("Failed: " + e.message);
    } finally {
      setAssigningTeacher(false);
    }
  };

  const handleRemoveTeacher = async (teacherId: number) => {
    if (!window.confirm("Remove this teacher?")) return;
    try {
      await removeClassTeacher(initialData.id, teacherId);
      const res = await loadClassTeachers(initialData.id);
      setTeachers(res?.data || []);
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  const handleAddStudent = async (studentId: number) => {
    if (!initialData?.id) return;
    try {
      await api.post(`/academics/classes/${initialData.id}/students`, { studentId });
      const res = await api.get(`/academics/classes/${initialData.id}`);
      setStudents(res?.data?.students || []);
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  // Feature 1: Bulk enroll students
  const handleBulkEnrollStudents = async () => {
    if (!initialData?.id || selectedStudentIds.size === 0) return;
    setBulkAdding(true);
    try {
      await api.post(`/academics/classes/${initialData.id}/students/bulk`, { studentIds: Array.from(selectedStudentIds) });
      setSelectedStudentIds(new Set());
      const res = await api.get(`/academics/classes/${initialData.id}`);
      setStudents(res?.data?.students || []);
      setShowAddStudent(false);
    } catch (e: any) {
      alert("Failed: " + e.message);
    } finally {
      setBulkAdding(false);
    }
  };

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

  // Feature 3: Transfer student to another class
  const handleTransferStudent = async () => {
    if (!transferStudentId || !transferTargetClass || !initialData?.id) return;
    if (!window.confirm("Transfer this student to the selected class?")) return;
    try {
      await api.post(`/academics/classes/${initialData.id}/students/${transferStudentId}/transfer`, {
        targetClassId: Number(transferTargetClass),
      });
      setShowTransfer(false);
      setTransferStudentId(null);
      setTransferTargetClass("");
      const res = await api.get(`/academics/classes/${initialData.id}`);
      setStudents(res?.data?.students || []);
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  // Feature 2: Edit teacher subject inline
  const handleUpdateTeacherSubject = async (teacherId: number, subjectId: string | null) => {
    if (!initialData?.id) return;
    try {
      await api.put(`/academics/classes/${initialData.id}/teachers/${teacherId}`, {
        subjectId: subjectId ? Number(subjectId) : null,
      });
      setEditingTeacherSubject(null);
      const res = await loadClassTeachers(initialData.id);
      setTeachers(res?.data || []);
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!initialData?.id || !window.confirm("Remove this student from class?")) return;
    try {
      await api.delete(`/academics/classes/${initialData.id}/students/${studentId}`);
      setStudents(students.filter((s: any) => s.student_id !== studentId));
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  // Filter out already enrolled students
  const enrolledStudentIds = new Set(students.map((s: any) => s.student_id));
  const availableStudents = Array.isArray(allStudents) ? allStudents.filter((s: any) => !enrolledStudentIds.has(s.id)) : [];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">
          {initialData?.name || (initialData?.id ? "Edit Class" : "New Class")}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Primary 1, Grade 7"
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="e.g. P1A, G7B"
            />
          </div>

          {/* Stream */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={formData.stream}
              onChange={(e) => handleChange("stream", e.target.value)}
              placeholder="e.g. A, B, Blue, Green"
            />
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={formData.academic_year}
              onChange={(e) => handleChange("academic_year", e.target.value)}
              placeholder="e.g. 2025, 2026"
            />
          </div>

          {/* Grade Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level *</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={formData.grade_level_id}
              onChange={(e) => handleChange("grade_level_id", e.target.value)}
            >
              <option value="">Select grade level...</option>
              {gradeLevels.map((gl) => (
                <option key={gl.id} value={gl.id}>
                  {gl.name} {gl.code ? `(${gl.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Curriculum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Curriculum</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={formData.curriculum_id}
              onChange={(e) => handleChange("curriculum_id", e.target.value)}
            >
              <option value="">Select curriculum...</option>
              {curricula.map((cu) => (
                <option key={cu.id} value={cu.id}>
                  {cu.name} {cu.code ? `(${cu.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={formData.room}
              onChange={(e) => handleChange("room", e.target.value)}
              placeholder="e.g. Room 101, Block B"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={formData.capacity}
              onChange={(e) => handleChange("capacity", e.target.value)}
              placeholder="e.g. 45"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Optional notes about this class..."
            />
          </div>

          {/* Active Toggle */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Teachers Section (only when editing) */}
        {initialData?.id && (
          <div className="border-t border-gray-200 pt-6 mt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-gray-800">Teachers & Subjects</h4>
              <button
                type="button"
                onClick={() => setShowAddTeacher(!showAddTeacher)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showAddTeacher ? "Cancel" : "+ Assign Teacher"}
              </button>
            </div>

            {showAddTeacher && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Teacher *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                      value={addTeacherForm.teacherId}
                      onChange={(e) => setAddTeacherForm({ ...addTeacherForm, teacherId: e.target.value })}
                    >
                      <option value="">Select teacher...</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name}
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
                          checked={addTeacherForm.isHomeroom}
                          onChange={() => setAddTeacherForm({ ...addTeacherForm, isHomeroom: true, subjectId: "" })}
                          className="form-radio h-4 w-4 text-purple-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Homeroom</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="role"
                          checked={!addTeacherForm.isHomeroom}
                          onChange={() => setAddTeacherForm({ ...addTeacherForm, isHomeroom: false })}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Subject</span>
                      </label>
                    </div>
                  </div>
                </div>
                {!addTeacherForm.isHomeroom && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Subject (Optional)</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                      value={addTeacherForm.subjectId}
                      onChange={(e) => setAddTeacherForm({ ...addTeacherForm, subjectId: e.target.value })}
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
                    onClick={handleAddTeacher}
                    disabled={assigningTeacher || !addTeacherForm.teacherId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    {assigningTeacher ? "Adding..." : "Add Teacher"}
                  </button>
                </div>
              </div>
            )}

            {loadingTeachers ? (
              <p className="text-sm text-gray-500">Loading teachers...</p>
            ) : teachers.length === 0 ? (
              <p className="text-sm text-gray-500">No teachers assigned</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {teachers.map((t: any) => (
                      <tr key={t.id}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {t.is_primary ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Homeroom
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Subject
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{t.teacher_name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {editingTeacherSubject === t.id ? (
                            <select
                              className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                              value={t.subject_id || ""}
                              onChange={(e) => handleUpdateTeacherSubject(t.id, e.target.value || null)}
                              onBlur={() => setEditingTeacherSubject(null)}
                              autoFocus
                            >
                              <option value="">All subjects</option>
                              {subjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => setEditingTeacherSubject(t.id)}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                              title="Click to edit subject"
                            >
                              {t.subject_name || "All subjects"}
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <button
                            onClick={() => handleRemoveTeacher(t.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
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
        )}

        {/* Students Section (only when editing) */}
        {initialData?.id && (
          <div className="border-t border-gray-200 pt-6 mt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-gray-800">Enrolled Students ({students.length})</h4>
              <button
                type="button"
                onClick={() => setShowAddStudent(!showAddStudent)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showAddStudent ? "Cancel" : "+ Add Students"}
              </button>
            </div>

            {showAddStudent && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-700">Select students to enroll</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {selectedStudentIds.size === availableStudents.length ? "Deselect All" : "Select All"}
                    </button>
                    {selectedStudentIds.size > 0 && (
                      <button
                        type="button"
                        onClick={handleBulkEnrollStudents}
                        disabled={bulkAdding}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {bulkAdding ? "Enrolling..." : `Enroll ${selectedStudentIds.size} Selected`}
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
                          selectedStudentIds.has(s.id) ? "bg-blue-50" : ""
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

            {loadingStudents ? (
              <p className="text-sm text-gray-500">Loading students...</p>
            ) : students.length === 0 ? (
              <p className="text-sm text-gray-500">No students enrolled</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adm No</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {students.map((s: any) => (
                      <tr key={s.student_id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{s.admission_no || "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{s.first_name} {s.last_name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{s.gender || "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setTransferStudentId(s.student_id);
                                setShowTransfer(true);
                              }}
                              className="text-orange-600 hover:text-orange-800 text-xs"
                              title="Transfer to another class"
                            >
                              Transfer
                            </button>
                            <button
                              onClick={() => handleRemoveStudent(s.student_id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                              title="Remove from class"
                            >
                              Remove
                            </button>
                          </div>
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
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : initialData?.id ? "Update Class" : "Create Class"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClassesForm;
