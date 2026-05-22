import React, { useState, useEffect, useMemo } from "react";
import { Save, Loader2, Users, CheckCircle, AlertCircle, Download, FileSpreadsheet } from "lucide-react";
import api from "@/utils/api.js";

interface StudentSubmission {
  student_id: number;
  student_name: string;
  admission_no: string;
  score: string;
  grade_letter: string;
  grade_point: string;
  remarks: string;
  submission_date: string;
}

interface BulkSubmissionEntryProps {
  onSubmissionsSaved?: () => void;
}

export function BulkSubmissionEntry({ onSubmissionsSaved }: BulkSubmissionEntryProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: number; failed: number } | null>(null);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [pendingSave, setPendingSave] = useState<any>(null);
  const [existingCount, setExistingCount] = useState(0);

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadClassStudents();
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedAssignmentId) {
      loadExistingSubmissions();
    }
  }, [selectedAssignmentId]);

  const loadDropdowns = async () => {
    setLoading(true);
    try {
      const [assignmentsRes, classesRes] = await Promise.all([
        api.get("/academics/assignments"),
        api.get("/academics/classes"),
      ]);
      setAssignments(assignmentsRes.data?.data || []);
      setClasses(classesRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async () => {
    if (!selectedClassId) return;
    try {
      const classRes = await api.get(`/academics/classes/${selectedClassId}`);
      const classData = classRes.data?.data;
      const studentsList = classData?.students || [];
      setStudents(studentsList);

      // Initialize submissions with empty values
      const initialSubmissions: StudentSubmission[] = studentsList.map((s: any) => ({
        student_id: s.student_id || s.id,
        student_name: `${s.first_name} ${s.last_name}`,
        admission_no: s.admission_no || "",
        score: "",
        grade_letter: "",
        grade_point: "",
        remarks: "",
        submission_date: new Date().toISOString().split('T')[0],
      }));

      setSubmissions(initialSubmissions);
    } catch (err) {
      console.error("Failed to load students", err);
    }
  };

  const loadExistingSubmissions = async () => {
    if (!selectedAssignmentId) return;
    try {
      const assignmentRes = await api.get(`/academics/assignments/${selectedAssignmentId}`);
      const assignmentData = assignmentRes.data?.data;
      const existingSubmissions = assignmentData?.submissions || [];
      setExistingCount(existingSubmissions.length);

      if (existingSubmissions.length > 0 && submissions.length > 0) {
        const updatedSubmissions = submissions.map(s => {
          const existing = existingSubmissions.find((es: any) => es.student_id === s.student_id);
          if (existing) {
            return {
              ...s,
              score: existing.score?.toString() || "",
              grade_letter: existing.grade_letter || "",
              grade_point: existing.grade_point?.toString() || "",
              remarks: existing.remarks || "",
              submission_date: existing.submission_date ? new Date(existing.submission_date).toISOString().split('T')[0] : s.submission_date,
            };
          }
          return s;
        });
        setSubmissions(updatedSubmissions);
      }
    } catch (err) {
      console.error("Failed to load existing submissions", err);
    }
  };

  const checkExistingBeforeSave = async () => {
    if (!selectedAssignmentId) return false;

    const validSubmissions = submissions.filter(s => s.score !== "" && !s._invalid);
    const studentIds = validSubmissions.map(s => s.student_id);

    if (studentIds.length === 0) return false;

    try {
      const response = await api.get(`/academics/assignments/${selectedAssignmentId}`);
      const assignmentData = response.data?.data;
      const existingSubmissions = assignmentData?.submissions || [];
      
      const existingStudentIds = existingSubmissions.map((es: any) => es.student_id);
      const overlap = studentIds.filter(id => existingStudentIds.includes(id));
      
      return overlap.length;
    } catch (err) {
      console.error("Failed to check existing submissions", err);
      return 0;
    }
  };

  const calculateGrade = (score: number, maxScore: number): { grade_letter: string; grade_point: number } => {
    const percentage = (score / maxScore) * 100;

    if (percentage >= 90) return { grade_letter: "A", grade_point: 5.0 };
    if (percentage >= 80) return { grade_letter: "B", grade_point: 4.0 };
    if (percentage >= 70) return { grade_letter: "C", grade_point: 3.0 };
    if (percentage >= 60) return { grade_letter: "D", grade_point: 2.0 };
    if (percentage >= 50) return { grade_letter: "E", grade_point: 1.0 };
    return { grade_letter: "F", grade_point: 0.0 };
  };

  const calculateRemarks = (percentage: number): string => {
    if (percentage >= 90) return "Outstanding";
    if (percentage >= 80) return "Excellent";
    if (percentage >= 70) return "Very Good";
    if (percentage >= 60) return "Good";
    if (percentage >= 50) return "Satisfactory";
    return "Needs Improvement";
  };

  const handleScoreChange = (index: number, value: string) => {
    const updatedSubmissions = [...submissions];
    const submission = { ...updatedSubmissions[index] };

    if (value === "" || value === "-") {
      submission.score = value;
      submission.grade_letter = "";
      submission.grade_point = "";
      submission.remarks = "";
      submission._invalid = false;
    } else {
      const score = parseFloat(value);
      if (!isNaN(score) && selectedAssignment) {
        // Validate against max_score
        if (score > selectedAssignment.max_score) {
          submission.score = value;
          submission._invalid = true;
          submission.grade_letter = "";
          submission.grade_point = "";
          submission.remarks = `Score exceeds max (${selectedAssignment.max_score})`;
        } else {
          submission.score = value;
          submission._invalid = false;

          // Always calculate grade for valid scores (including 0)
          const { grade_letter, grade_point } = calculateGrade(score, selectedAssignment.max_score);
          submission.grade_letter = grade_letter;
          submission.grade_point = grade_point.toFixed(1);

          if (autoCalculate) {
            submission.remarks = calculateRemarks((score / selectedAssignment.max_score) * 100);
          }
        }
      }
    }

    updatedSubmissions[index] = submission;
    setSubmissions(updatedSubmissions);
  };

  const handleFieldChange = (index: number, field: keyof StudentSubmission, value: any) => {
    const updatedSubmissions = [...submissions];
    updatedSubmissions[index] = { ...updatedSubmissions[index], [field]: value };
    setSubmissions(updatedSubmissions);
  };

  const handleSaveAll = async () => {
    if (!selectedAssignmentId) {
      alert("Please select an assignment first");
      return;
    }

    // Check for invalid scores (exceeding max_score)
    const invalidScores = submissions.filter(s => s._invalid);
    if (invalidScores.length > 0) {
      alert(`Please fix ${invalidScores.length} score(s) that exceed the maximum score of ${selectedAssignment.max_score}`);
      return;
    }

    const validSubmissions = submissions.filter(s => s.score !== "" && s.score !== null && !s._invalid);
    if (validSubmissions.length === 0) {
      alert("Please enter at least one valid score");
      return;
    }

    // Check for existing submissions and warn user
    const existingCount = await checkExistingBeforeSave();
    if (existingCount > 0) {
      setPendingSave(validSubmissions);
      setShowOverwriteWarning(true);
      return;
    }

    // No existing submissions, save directly
    await executeSave(validSubmissions);
  };

  const executeSave = async (validSubmissions: any[]) => {
    setShowOverwriteWarning(false);
    setPendingSave(null);
    setSaving(true);
    setSaveStatus(null);

    try {
      const payload = {
        assignment_id: Number(selectedAssignmentId),
        max_score: selectedAssignment.max_score,
        submissions: validSubmissions.map(s => ({
          student_id: Number(s.student_id),
          score: parseFloat(s.score),
          grade_letter: s.grade_letter || null,
          grade_point: s.grade_point ? parseFloat(s.grade_point) : null,
          remarks: s.remarks || null,
          submission_date: s.submission_date || new Date(),
        })),
      };

      const response = await api.post("/academics/assignments/bulk-submissions", payload);
      const { success, failed } = response.data?.data || { success: 0, failed: 0 };

      setSaveStatus({ success, failed });

      if (success > 0) {
        // Notify parent to refresh data
        if (onSubmissionsSaved) {
          onSubmissionsSaved();
        }
        setTimeout(() => setSaveStatus(null), 5000);
      }
    } catch (err: any) {
      console.error("Failed to save submissions", err);
      alert("Failed to save submissions: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleExportTemplate = () => {
    if (submissions.length === 0) return;

    const headers = ["Student Name", "Admission No", "Score", "Grade", "Grade Point", "Remarks", "Submission Date"];
    const rows = submissions.map(s => [
      s.student_name,
      s.admission_no,
      s.score || "0",
      s.grade_letter || "-",
      s.grade_point || "-",
      s.remarks || "-",
      s.submission_date || new Date().toISOString().split('T')[0]
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assignment_submissions_template_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedAssignment = assignments.find(a => String(a.id) === selectedAssignmentId);

  const stats = useMemo(() => {
    // Only consider valid, non-empty scores
    const scoredStudents = submissions.filter(s => s.score !== "" && !s._invalid);
    if (scoredStudents.length === 0) return null;

    const scores = scoredStudents.map(s => parseFloat(s.score)).filter(s => !isNaN(s));
    if (scores.length === 0 || !selectedAssignment) return null;

    // Calculate percentages properly
    const percentages = scores.map(s => (s / selectedAssignment.max_score) * 100);
    const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const max = Math.max(...percentages);
    const min = Math.min(...percentages);
    const passCount = percentages.filter(p => p >= 50).length;
    const passRate = (passCount / percentages.length) * 100;

    return {
      total: submissions.length,
      scored: scores.length,
      average: avg,
      highest: max,
      lowest: min,
      passRate,
    };
  }, [submissions, selectedAssignment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-3 text-slate-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          Select Assignment & Class
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Assignment *</label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select an assignment...</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title} - {a.class_name} ({a.subject_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Class (Auto-populated)</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={!selectedAssignmentId}
            >
              <option value="">Select class...</option>
              {selectedAssignmentId ? (
                classes.filter(c => String(c.id) === String(selectedAssignment?.class_id)).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))
              ) : (
                classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))
              )}
            </select>
          </div>
        </div>

        {selectedAssignment && (
          <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Max Score:</span>
                <span className="ml-2 font-semibold text-slate-900">{selectedAssignment.max_score}</span>
              </div>
              <div>
                <span className="text-slate-600">Due Date:</span>
                <span className="ml-2 font-semibold text-slate-900">
                  {selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toLocaleDateString() : "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Term:</span>
                <span className="ml-2 font-semibold text-slate-900">{selectedAssignment.term_name || "-"}</span>
              </div>
              <div>
                <span className="text-slate-600">Submissions:</span>
                <span className="ml-2 font-semibold text-slate-900">
                  {selectedAssignment.submissions_count || 0}/{selectedAssignment.total_students || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Students Graded</p>
            <p className="text-2xl font-bold text-slate-900">{stats.scored}/{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Average</p>
            <p className="text-2xl font-bold text-blue-600">{stats.average.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Highest</p>
            <p className="text-2xl font-bold text-green-600">{stats.highest.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Lowest</p>
            <p className="text-2xl font-bold text-red-600">{stats.lowest.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Pass Rate</p>
            <p className="text-2xl font-bold text-teal-600">{stats.passRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Action Bar */}
      {submissions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoCalculate}
                onChange={(e) => setAutoCalculate(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-slate-700">Auto-calculate grades & remarks</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportTemplate}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save All Submissions
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Save Status */}
      {saveStatus && (
        <div className={`rounded-xl shadow-sm border p-4 flex items-center gap-3 ${
          saveStatus.success > 0
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {saveStatus.success > 0 ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">
            Successfully saved {saveStatus.success} submission(s)
            {saveStatus.failed > 0 && `, ${saveStatus.failed} failed`}
          </span>
        </div>
      )}

      {/* Submissions Table */}
      {submissions.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sticky left-[3rem] bg-slate-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px]">Student Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Admission No</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Score *</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade Point</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[180px]">Remarks</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Submission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submissions.map((submission, idx) => (
                  <tr key={submission.student_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-medium sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-12">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 sticky left-[3rem] bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {submission.student_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{submission.admission_no || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={submission.score}
                        onChange={(e) => handleScoreChange(idx, e.target.value)}
                        className={`w-24 px-3 py-1.5 border rounded-lg text-center focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                          submission._invalid
                            ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                            : 'border-slate-300'
                        }`}
                        min="0"
                        max={selectedAssignment?.max_score || 100}
                        placeholder="0"
                      />
                      {submission._invalid && (
                        <div className="text-[10px] text-red-600 mt-0.5 font-medium">
                          Max: {selectedAssignment?.max_score}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="text"
                        value={submission.grade_letter}
                        onChange={(e) => handleFieldChange(idx, "grade_letter", e.target.value.toUpperCase())}
                        className="w-16 px-3 py-1.5 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        maxLength={2}
                        placeholder="A"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={submission.grade_point}
                        onChange={(e) => handleFieldChange(idx, "grade_point", e.target.value)}
                        className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="0.0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={submission.remarks}
                        onChange={(e) => handleFieldChange(idx, "remarks", e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Optional remarks..."
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="date"
                        value={submission.submission_date}
                        onChange={(e) => handleFieldChange(idx, "submission_date", e.target.value)}
                        className="w-36 px-3 py-1.5 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        selectedClassId && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Students Found</h3>
            <p className="text-slate-600">This class doesn't have any enrolled students yet.</p>
          </div>
        )
      )}

      {!selectedAssignmentId && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Select an Assignment</h3>
          <p className="text-slate-600">Choose an assignment and class above to start entering submission grades.</p>
        </div>
      )}

      {/* Overwrite Warning Dialog */}
      {showOverwriteWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <h3 className="text-xl font-bold text-slate-900">Existing Submissions Found</h3>
            </div>
            <p className="text-slate-700 mb-4">
              There are <strong className="text-amber-600">{existingCount}</strong> existing submission(s) that will be updated.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Original data will be preserved using soft delete. Only the latest scores will be visible in the active view.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowOverwriteWarning(false);
                  setPendingSave(null);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pendingSave) {
                    executeSave(pendingSave);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all font-medium"
              >
                Yes, Update Submissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkSubmissionEntry;
