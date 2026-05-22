import React, { useState, useEffect, useMemo } from "react";
import { Save, Loader2, Users, CheckCircle, AlertCircle, Download, Award } from "lucide-react";
import api from "@/utils/api.js";

interface StudentResult {
  student_id: number;
  student_name: string;
  admission_no: string;
  score: string;
  grade_letter: string;
  grade_point: string;
  remarks: string;
  is_final: boolean;
}

interface BulkExamResultsEntryProps {
  onResultsSaved?: () => void;
}

export function BulkExamResultsEntry({ onResultsSaved }: BulkExamResultsEntryProps) {
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
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
    if (selectedExamId) {
      loadExistingResults();
    }
  }, [selectedExamId]);

  const loadDropdowns = async () => {
    setLoading(true);
    try {
      const [examsRes, classesRes] = await Promise.all([
        api.get("/academics/exams"),
        api.get("/academics/classes"),
      ]);
      setExams(examsRes.data?.data || []);
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
      
      // Initialize results with empty values
      const initialResults: StudentResult[] = studentsList.map((s: any) => ({
        student_id: s.student_id || s.id,
        student_name: `${s.first_name} ${s.last_name}`,
        admission_no: s.admission_no || "",
        score: "",
        grade_letter: "",
        grade_point: "",
        remarks: "",
        is_final: false,
      }));
      
      setResults(initialResults);
    } catch (err) {
      console.error("Failed to load students", err);
    }
  };

  const loadExistingResults = async () => {
    if (!selectedExamId) return;
    try {
      const resultsRes = await api.get("/academics/exam-results", {
        params: { exam_id: selectedExamId }
      });
      const existingResults = resultsRes.data?.data || [];
      setExistingCount(existingResults.length);
      
      if (existingResults.length > 0 && results.length > 0) {
        const updatedResults = results.map(r => {
          const existing = existingResults.find((er: any) => er.student_id === r.student_id);
          if (existing) {
            return {
              ...r,
              score: existing.score?.toString() || "",
              grade_letter: existing.grade_letter || "",
              grade_point: existing.grade_point?.toString() || "",
              remarks: existing.remarks || "",
              is_final: existing.is_final || false,
            };
          }
          return r;
        });
        setResults(updatedResults);
      }
    } catch (err) {
      console.error("Failed to load existing results", err);
    }
  };

  const checkExistingBeforeSave = async () => {
    if (!selectedExamId) return false;
    
    const validResults = results.filter(r => r.score !== "" && !r._invalid);
    const studentIds = validResults.map(r => r.student_id);
    
    if (studentIds.length === 0) return false;
    
    try {
      const response = await api.get("/academics/exam-results", {
        params: { 
          exam_id: selectedExamId,
          student_ids: studentIds.join(",")
        }
      });
      
      const existingResults = response.data?.data || [];
      return existingResults.length;
    } catch (err) {
      console.error("Failed to check existing results", err);
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
    const updatedResults = [...results];
    const result = { ...updatedResults[index] };

    if (value === "" || value === "-") {
      result.score = value;
      result.grade_letter = "";
      result.grade_point = "";
      result.remarks = "";
      result._invalid = false;
    } else {
      const score = parseFloat(value);
      if (!isNaN(score) && selectedExam) {
        // Validate against max_score
        if (score > selectedExam.max_score) {
          result.score = value;
          result._invalid = true;
          result.grade_letter = "";
          result.grade_point = "";
          result.remarks = `Score exceeds max (${selectedExam.max_score})`;
        } else {
          result.score = value;
          result._invalid = false;
          
          // Always calculate grade for valid scores (including 0)
          const { grade_letter, grade_point } = calculateGrade(score, selectedExam.max_score);
          result.grade_letter = grade_letter;
          result.grade_point = grade_point.toFixed(1);

          if (autoCalculate) {
            result.remarks = calculateRemarks((score / selectedExam.max_score) * 100);
          }
        }
      }
    }

    updatedResults[index] = result;
    setResults(updatedResults);
  };

  const handleFieldChange = (index: number, field: keyof StudentResult, value: any) => {
    const updatedResults = [...results];
    updatedResults[index] = { ...updatedResults[index], [field]: value };
    setResults(updatedResults);
  };

  const handleSaveAll = async () => {
    if (!selectedExamId) {
      alert("Please select an exam first");
      return;
    }

    // Check for invalid scores (exceeding max_score)
    const invalidScores = results.filter(r => r._invalid);
    if (invalidScores.length > 0) {
      alert(`Please fix ${invalidScores.length} score(s) that exceed the maximum score of ${selectedExam.max_score}`);
      return;
    }

    const validResults = results.filter(r => r.score !== "" && r.score !== null && !r._invalid);
    if (validResults.length === 0) {
      alert("Please enter at least one valid score");
      return;
    }

    // Check for existing results and warn user
    const existingCount = await checkExistingBeforeSave();
    if (existingCount > 0) {
      setPendingSave(validResults);
      setShowOverwriteWarning(true);
      return;
    }

    // No existing results, save directly
    await executeSave(validResults);
  };

  const executeSave = async (validResults: any[]) => {
    setShowOverwriteWarning(false);
    setPendingSave(null);
    setSaving(true);
    setSaveStatus(null);

    try {
      const payload = {
        exam_id: Number(selectedExamId),
        max_score: selectedExam.max_score,
        results: validResults.map(r => ({
          student_id: Number(r.student_id),
          score: parseFloat(r.score),
          grade_letter: r.grade_letter || null,
          grade_point: r.grade_point ? parseFloat(r.grade_point) : null,
          remarks: r.remarks || null,
          is_final: r.is_final,
        })),
      };

      const response = await api.post("/academics/exams/bulk-results", payload);
      const { success, failed } = response.data?.data || { success: 0, failed: 0 };
      
      setSaveStatus({ success, failed });

      if (success > 0) {
        // Notify parent to refresh data
        if (onResultsSaved) {
          onResultsSaved();
        }
        setTimeout(() => setSaveStatus(null), 5000);
      }
    } catch (err: any) {
      console.error("Failed to save results", err);
      alert("Failed to save results: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleExportTemplate = () => {
    if (results.length === 0) return;
    
    const headers = ["Student Name", "Admission No", "Score", "Grade", "Grade Point", "Remarks"];
    const rows = results.map(r => [
      r.student_name,
      r.admission_no,
      r.score || "0",
      r.grade_letter || "-",
      r.grade_point || "-",
      r.remarks || "-"
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam_results_template_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedExam = exams.find(e => String(e.id) === selectedExamId);

  const stats = useMemo(() => {
    // Only consider valid, non-empty scores
    const scoredStudents = results.filter(r => r.score !== "" && !r._invalid);
    if (scoredStudents.length === 0) return null;

    const scores = scoredStudents.map(r => parseFloat(r.score)).filter(s => !isNaN(s));
    if (scores.length === 0 || !selectedExam) return null;

    // Calculate percentages properly
    const percentages = scores.map(s => (s / selectedExam.max_score) * 100);
    const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const max = Math.max(...percentages);
    const min = Math.min(...percentages);
    const passCount = percentages.filter(p => p >= 50).length;
    const passRate = (passCount / percentages.length) * 100;

    return {
      total: results.length,
      scored: scores.length,
      average: avg,
      highest: max,
      lowest: min,
      passRate,
    };
  }, [results, selectedExam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        <span className="ml-3 text-slate-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-600" />
          Select Exam & Class
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Exam *</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Select an exam...</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title} - {e.class_name} ({e.subject_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Class (Auto-populated)</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              disabled={!selectedExamId}
            >
              <option value="">Select class...</option>
              {selectedExamId ? (
                classes.filter(c => String(c.id) === String(selectedExam?.class_id)).map(c => (
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

        {selectedExam && (
          <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Max Score:</span>
                <span className="ml-2 font-semibold text-slate-900">{selectedExam.max_score}</span>
              </div>
              <div>
                <span className="text-slate-600">Date:</span>
                <span className="ml-2 font-semibold text-slate-900">
                  {selectedExam.exam_date ? new Date(selectedExam.exam_date).toLocaleDateString() : "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Time:</span>
                <span className="ml-2 font-semibold text-slate-900">
                  {selectedExam.start_time && selectedExam.end_time ? (() => {
                    const [sh, sm] = selectedExam.start_time.split(":").map(Number);
                    const [eh, em] = selectedExam.end_time.split(":").map(Number);
                    const diffMins = (eh * 60 + em) - (sh * 60 + sm);
                    const hrs = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    const durationStr = mins === 0 ? `${hrs}h` : hrs === 0 ? `${mins}m` : `${hrs}h ${mins}m`;
                    return `${selectedExam.start_time.substring(0, 5)} → ${selectedExam.end_time.substring(0, 5)} (${durationStr})`;
                  })() : "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Term:</span>
                <span className="ml-2 font-semibold text-slate-900">{selectedExam.term_name || "-"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Students Scored</p>
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
            <p className="text-2xl font-bold text-violet-600">{stats.passRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Action Bar */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoCalculate}
                onChange={(e) => setAutoCalculate(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded"
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
                  Save All Results
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
            Successfully saved {saveStatus.success} result(s)
            {saveStatus.failed > 0 && `, ${saveStatus.failed} failed`}
          </span>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 ? (
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
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.map((result, idx) => (
                  <tr key={result.student_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-medium sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-12">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 sticky left-[3rem] bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {result.student_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{result.admission_no || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={result.score}
                        onChange={(e) => handleScoreChange(idx, e.target.value)}
                        className={`w-24 px-3 py-1.5 border rounded-lg text-center focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                          result._invalid
                            ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                            : 'border-slate-300'
                        }`}
                        min="0"
                        max={selectedExam?.max_score || 100}
                        placeholder="0"
                      />
                      {result._invalid && (
                        <div className="text-[10px] text-red-600 mt-0.5 font-medium">
                          Max: {selectedExam?.max_score}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="text"
                        value={result.grade_letter}
                        onChange={(e) => handleFieldChange(idx, "grade_letter", e.target.value.toUpperCase())}
                        className="w-16 px-3 py-1.5 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        maxLength={2}
                        placeholder="A"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={result.grade_point}
                        onChange={(e) => handleFieldChange(idx, "grade_point", e.target.value)}
                        className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="0.0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={result.remarks}
                        onChange={(e) => handleFieldChange(idx, "remarks", e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Optional remarks..."
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={result.is_final}
                        onChange={(e) => handleFieldChange(idx, "is_final", e.target.checked)}
                        className="w-5 h-5 text-violet-600 rounded"
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

      {!selectedExamId && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Select an Exam</h3>
          <p className="text-slate-600">Choose an exam from the dropdown above to start entering results.</p>
        </div>
      )}

      {/* Overwrite Warning Modal */}
      {showOverwriteWarning && pendingSave && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Existing Results Found
              </h2>
              <p className="text-amber-100 mt-1">{selectedExam?.title}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700 font-medium">Records to Update</p>
                  <p className="text-3xl font-bold text-amber-800">{existingCount}</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <p className="text-sm text-teal-700 font-medium">New Records</p>
                  <p className="text-3xl font-bold text-teal-800">{pendingSave.length - existingCount}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">
                  <strong>Warning:</strong> <strong>{existingCount}</strong> result(s) already exist and will be replaced.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  ✓ Old records are preserved in the system for audit purposes.
                  <br />
                  ✓ You can view change history if needed.
                  <br />
                  ✓ New records will be created with updated scores.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={() => { setShowOverwriteWarning(false); setPendingSave(null); }}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-white transition-colors font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => executeSave(pendingSave)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 font-medium shadow-md"
              >
                Save Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkExamResultsEntry;
