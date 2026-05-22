import React, { useState, useEffect, useMemo } from "react";
import { Save, Loader2, CheckCircle, AlertCircle, Download, Calculator, FileSpreadsheet } from "lucide-react";
import api from "@/utils/api.js";

interface StudentGrade {
  student_id: number;
  student_name: string;
  admission_no: string;
  score: string;
  grade_letter: string;
  grade_point: string;
  remarks: string;
  is_final?: boolean;
}

interface BulkGradingEntryProps {
  entityType: "assessments" | "exams" | "assignments";
  onSaved?: () => void;
}

export function BulkGradingEntry({ entityType, onSaved }: BulkGradingEntryProps) {
  const [entities, setEntities] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: number; failed: number } | null>(null);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [pendingSave, setPendingSave] = useState<any>(null);
  const [existingCount, setExistingCount] = useState(0);
  const [maxScore, setMaxScore] = useState(100);

  const entityLabels = {
    assessments: "Assessment",
    exams: "Exam",
    assignments: "Assignment",
  };

  const entityEndpoints = {
    assessments: {
      list: "/academics/assessments",
      detail: (id: string) => `/academics/assessments/${id}`,
      bulk: "/academics/assessment-results/bulk",
      results: (id: string) => `/academics/assessment-results?assessment_id=${id}`,
    },
    exams: {
      list: "/academics/exams",
      detail: (id: string) => `/academics/exams/${id}`,
      bulk: "/academics/exams/bulk-results",
      results: (id: string) => `/academics/exam-results?exam_id=${id}`,
    },
    assignments: {
      list: "/academics/assignments",
      detail: (id: string) => `/academics/assignments/${id}`,
      bulk: "/academics/assignments/bulk-submissions",
      results: (id: string) => `/academics/assignments/${id}`,
    },
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadClassStudents();
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedEntityId) {
      loadExistingGrades();
    }
  }, [selectedEntityId]);

  const loadDropdowns = async () => {
    setLoading(true);
    try {
      const [entitiesRes, classesRes] = await Promise.all([
        api.get(entityEndpoints[entityType].list),
        api.get("/academics/classes"),
      ]);
      setEntities(entitiesRes.data?.data || []);
      setClasses(classesRes.data?.data || []);
    } catch (err: any) {
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

      const initialGrades: StudentGrade[] = studentsList.map((s: any) => ({
        student_id: s.student_id || s.id,
        student_name: `${s.first_name} ${s.last_name}`,
        admission_no: s.admission_no || "",
        score: "",
        grade_letter: "",
        grade_point: "",
        remarks: "",
        is_final: false,
      }));

      setGrades(initialGrades);
      setExistingCount(0);
    } catch (err: any) {
      console.error("Failed to load students", err);
    }
  };

  const loadExistingGrades = async () => {
    if (!selectedEntityId) return;
    try {
      const entityRes = await api.get(entityEndpoints[entityType].detail(selectedEntityId));
      const entityData = entityRes.data?.data;
      setMaxScore(entityData?.max_score || 100);

      let existingGrades: any[] = [];
      
      if (entityType === "assignments") {
        existingGrades = entityData?.submissions || [];
      } else {
        const resultsRes = await api.get(entityEndpoints[entityType].results(selectedEntityId));
        existingGrades = resultsRes.data?.data || [];
      }

      setExistingCount(existingGrades.length);

      if (existingGrades.length > 0 && grades.length > 0) {
        const updatedGrades = grades.map(g => {
          const existing = existingGrades.find((eg: any) => eg.student_id === g.student_id);
          if (existing) {
            return {
              ...g,
              score: existing.score?.toString() || "",
              grade_letter: existing.grade_letter || "",
              grade_point: existing.grade_point?.toString() || "",
              remarks: existing.remarks || "",
              is_final: existing.is_final || false,
            };
          }
          return g;
        });
        setGrades(updatedGrades);
      }
    } catch (err: any) {
      console.error("Failed to load existing grades", err);
    }
  };

  const calculateGrade = (score: number, maxScore: number): { grade_letter: string; grade_point: number } => {
    const percentage = (score / maxScore) * 100;

    if (percentage >= 97) return { grade_letter: "A+", grade_point: 5.0 };
    if (percentage >= 93) return { grade_letter: "A", grade_point: 5.0 };
    if (percentage >= 90) return { grade_letter: "A-", grade_point: 4.7 };
    if (percentage >= 87) return { grade_letter: "B+", grade_point: 4.3 };
    if (percentage >= 83) return { grade_letter: "B", grade_point: 4.0 };
    if (percentage >= 80) return { grade_letter: "B-", grade_point: 3.7 };
    if (percentage >= 77) return { grade_letter: "C+", grade_point: 3.3 };
    if (percentage >= 73) return { grade_letter: "C", grade_point: 3.0 };
    if (percentage >= 70) return { grade_letter: "C-", grade_point: 2.7 };
    if (percentage >= 67) return { grade_letter: "D+", grade_point: 2.3 };
    if (percentage >= 63) return { grade_letter: "D", grade_point: 2.0 };
    if (percentage >= 60) return { grade_letter: "D-", grade_point: 1.7 };
    return { grade_letter: "F", grade_point: 0.0 };
  };

  const getRemarks = (grade_letter: string): string => {
    const remarksMap: Record<string, string> = {
      "A+": "Excellent",
      "A": "Excellent",
      "A-": "Very Good",
      "B+": "Very Good",
      "B": "Good",
      "B-": "Good",
      "C+": "Satisfactory",
      "C": "Satisfactory",
      "C-": "Satisfactory",
      "D+": "Needs Improvement",
      "D": "Needs Improvement",
      "D-": "Needs Improvement",
      "F": "Fail",
    };
    return remarksMap[grade_letter] || "";
  };

  const handleScoreChange = (index: number, score: string) => {
    const numScore = parseFloat(score);
    let grade_letter = "";
    let grade_point = "";
    let remarks = "";

    if (!isNaN(numScore) && autoCalculate) {
      const grade = calculateGrade(numScore, maxScore);
      grade_letter = grade.grade_letter;
      grade_point = grade.grade_point.toString();
      remarks = getRemarks(grade_letter);
    }

    const updatedGrades = [...grades];
    updatedGrades[index] = {
      ...updatedGrades[index],
      score,
      grade_letter,
      grade_point,
      remarks,
    };
    setGrades(updatedGrades);
  };

  const checkExistingBeforeSave = async (): Promise<number> => {
    if (!selectedEntityId) return 0;

    const validGrades = grades.filter(g => g.score !== "");
    const studentIds = validGrades.map(g => g.student_id);

    if (studentIds.length === 0) return 0;

    try {
      let existingGrades: any[] = [];
      
      if (entityType === "assignments") {
        const res = await api.get(entityEndpoints[entityType].detail(selectedEntityId));
        existingGrades = res.data?.data?.submissions || [];
      } else {
        const res = await api.get(entityEndpoints[entityType].results(selectedEntityId));
        existingGrades = res.data?.data || [];
      }

      const existingStudentIds = existingGrades.map((eg: any) => eg.student_id);
      const overlap = studentIds.filter(id => existingStudentIds.includes(id));

      return overlap.length;
    } catch (err) {
      console.error("Failed to check existing grades", err);
      return 0;
    }
  };

  const handleSave = async () => {
    const existingOverlap = await checkExistingBeforeSave();
    
    if (existingOverlap > 0) {
      setPendingSave(null);
      setShowOverwriteWarning(true);
      return;
    }

    await performSave();
  };

  const performSave = async () => {
    if (!selectedEntityId) return;

    const validGrades = grades.filter(g => g.score !== "" && !isNaN(parseFloat(g.score)));
    
    if (validGrades.length === 0) {
      alert("Please enter at least one score");
      return;
    }

    // Validate scores
    const invalidScores = validGrades.filter(g => parseFloat(g.score) > maxScore || parseFloat(g.score) < 0);
    if (invalidScores.length > 0) {
      alert(`${invalidScores.length} score(s) exceed the maximum score of ${maxScore} or are negative`);
      return;
    }

    setSaving(true);
    setSaveResult(null);

    try {
      let payload: any;

      if (entityType === "assessments") {
        payload = {
          assessment_id: parseInt(selectedEntityId),
          grades: validGrades.map(g => ({
            student_id: g.student_id,
            score: parseFloat(g.score),
            remarks: g.remarks || null,
          })),
        };
      } else if (entityType === "exams") {
        payload = {
          exam_id: parseInt(selectedEntityId),
          max_score: maxScore,
          results: validGrades.map(g => ({
            student_id: g.student_id,
            score: parseFloat(g.score),
            grade_letter: g.grade_letter || null,
            grade_point: g.grade_point ? parseFloat(g.grade_point) : null,
            remarks: g.remarks || null,
            is_final: g.is_final || false,
          })),
        };
      } else {
        payload = {
          assignment_id: parseInt(selectedEntityId),
          max_score: maxScore,
          submissions: validGrades.map(g => ({
            student_id: g.student_id,
            score: parseFloat(g.score),
            grade_letter: g.grade_letter || null,
            grade_point: g.grade_point ? parseFloat(g.grade_point) : null,
            remarks: g.remarks || null,
            submission_date: new Date().toISOString(),
          })),
        };
      }

      const response = await api.post(entityEndpoints[entityType].bulk, payload);
      const result = response.data?.data;

      setSaveResult({
        success: result?.success || result?.created || validGrades.length,
        failed: result?.failed || 0,
      });

      setGrades(prev => prev.map(g => ({
        ...g,
        score: g.score,
      })));

      if (onSaved) {
        onSaved();
      }
    } catch (err: any) {
      console.error("Failed to save grades", err);
      alert(err.response?.data?.message || err.message || "Failed to save grades");
    } finally {
      setSaving(false);
      setShowOverwriteWarning(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Student ID", "Student Name", "Admission No", "Score", "Grade Letter", "Grade Point", "Remarks"];
    const rows = grades.map(g => [
      g.student_id,
      g.student_name,
      g.admission_no,
      g.score,
      g.grade_letter,
      g.grade_point,
      g.remarks,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entityLabels[entityType]}_${selectedEntityId}_grades.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const validScores = grades
      .filter(g => g.score !== "" && !isNaN(parseFloat(g.score)))
      .map(g => parseFloat(g.score));

    if (validScores.length === 0) {
      return { count: 0, average: 0, highest: 0, lowest: 0, passRate: 0 };
    }

    const sum = validScores.reduce((a, b) => a + b, 0);
    const average = sum / validScores.length;
    const highest = Math.max(...validScores);
    const lowest = Math.min(...validScores);
    const passThreshold = maxScore * 0.5;
    const passCount = validScores.filter(s => s >= passThreshold).length;
    const passRate = (passCount / validScores.length) * 100;

    return {
      count: validScores.length,
      average: average.toFixed(2),
      highest,
      lowest,
      passRate: passRate.toFixed(1),
    };
  }, [grades, maxScore]);

  const selectedEntity = entities.find(e => e.id.toString() === selectedEntityId);

  if (loading && entities.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Bulk {entityLabels[entityType]} Grading</h4>
            <p className="text-sm text-blue-800 mt-1">
              Select a {entityLabels[entityType].toLowerCase()} and class, then enter scores for all students at once.
              Grades will be calculated automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Selection Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {entityLabels[entityType]} *
          </label>
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select {entityLabels[entityType].toLowerCase()}...</option>
            {entities.map(entity => (
              <option key={entity.id} value={entity.id}>
                {entity.title || entity.name}
                {entity.exam_date ? ` - ${new Date(entity.exam_date).toLocaleDateString()}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Class *
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select class...</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.code ? `(${cls.code})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Max Score Display */}
      {selectedEntity && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-700">Max Score: </span>
              <span className="text-lg font-bold text-teal-600">{maxScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoCalculate"
                checked={autoCalculate}
                onChange={(e) => setAutoCalculate(e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="autoCalculate" className="text-sm text-slate-700 flex items-center gap-1">
                <Calculator className="w-4 h-4" />
                Auto-calculate grades
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      {stats.count > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Scored</p>
            <p className="text-2xl font-bold text-slate-900">{stats.count}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Average</p>
            <p className="text-2xl font-bold text-blue-600">{stats.average}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Highest</p>
            <p className="text-2xl font-bold text-green-600">{stats.highest}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Lowest</p>
            <p className="text-2xl font-bold text-red-600">{stats.lowest}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Pass Rate</p>
            <p className="text-2xl font-bold text-teal-600">{stats.passRate}%</p>
          </div>
        </div>
      )}

      {/* Grading Table */}
      {grades.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Admission No</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Score *</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Grade Point</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Remarks</th>
                  {entityType === "exams" && (
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Final</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((grade, idx) => (
                  <tr key={grade.student_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{grade.student_name}</td>
                    <td className="px-4 py-3 text-slate-600">{grade.admission_no}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={grade.score}
                        onChange={(e) => handleScoreChange(idx, e.target.value)}
                        placeholder="0"
                        min="0"
                        max={maxScore}
                        className="w-24 mx-auto block px-3 py-1.5 border border-slate-300 rounded text-center focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        grade.grade_letter.startsWith("A") ? "bg-green-100 text-green-700" :
                        grade.grade_letter.startsWith("B") ? "bg-blue-100 text-blue-700" :
                        grade.grade_letter.startsWith("C") ? "bg-yellow-100 text-yellow-700" :
                        grade.grade_letter.startsWith("D") ? "bg-orange-100 text-orange-700" :
                        grade.grade_letter === "F" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {grade.grade_letter || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm">
                      {grade.grade_point || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={grade.remarks}
                        onChange={(e) => {
                          const updated = [...grades];
                          updated[idx] = { ...updated[idx], remarks: e.target.value };
                          setGrades(updated);
                        }}
                        placeholder="Remarks"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {entityType === "exams" && (
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={grade.is_final || false}
                          onChange={(e) => {
                            const updated = [...grades];
                            updated[idx] = { ...updated[idx], is_final: e.target.checked };
                            setGrades(updated);
                          }}
                          className="rounded border-slate-300"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Status */}
      {saveResult && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          saveResult.failed === 0 
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-yellow-50 border-yellow-200 text-yellow-800"
        }`}>
          <CheckCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Save Complete</p>
            <p className="text-sm">
              {saveResult.success} succeeded, {saveResult.failed} failed
            </p>
          </div>
        </div>
      )}

      {/* Existing Count */}
      {existingCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">
            {existingCount} existing record(s) will be updated
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={exportCSV}
          disabled={grades.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>

        <button
          onClick={handleSave}
          disabled={saving || !selectedEntityId || grades.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : `Save ${grades.filter(g => g.score !== "").length} Grades`}
        </button>
      </div>

      {/* Overwrite Warning Modal */}
      {showOverwriteWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                Overwrite Warning
              </h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">
                {existingCount} record(s) already exist. Existing grades will be replaced with new values.
              </p>
              <p className="text-sm text-slate-600 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowOverwriteWarning(false)}
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={performSave}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Yes, Overwrite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {grades.length === 0 && selectedClassId && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h4 className="font-semibold text-slate-900 mb-2">No Students Found</h4>
          <p className="text-slate-600">
            This class has no enrolled students. Add students to the class first.
          </p>
        </div>
      )}
    </div>
  );
}

export default BulkGradingEntry;
