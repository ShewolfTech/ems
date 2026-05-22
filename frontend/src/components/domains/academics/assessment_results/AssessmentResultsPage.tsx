import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";
import api from "@/utils/api.js";

export function AssessmentResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assessmentId = searchParams.get("assessmentId");
  const [students, setStudents] = useState<any[]>([]);
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [grades, setGrades] = useState<Record<number, { score: string; remarks: string }>>({});

  useEffect(() => {
    loadData();
  }, [assessmentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get assessment details
      const assessmentRes = await api.get(`/academics/assessments/${assessmentId}`);
      const assessmentData = assessmentRes.data?.data;
      setAssessment(assessmentData);

      // Get students in this class
      const classRes = await api.get(`/academics/classes/${assessmentData?.class_id}`);
      const classData = classRes.data?.data;
      const studentsList = classData?.students || [];
      setStudents(studentsList);

      // Get existing results
      const resultsRes = await api.get(`/academics/assessment-results/assessment/${assessmentId}`);
      const results = resultsRes.data?.data || [];

      // Pre-fill grades
      const gradeMap: Record<number, { score: string; remarks: string }> = {};
      results.forEach((r: any) => {
        const sid = r.student_id;
        if (sid) {
          gradeMap[sid] = {
            score: r.score?.toString() || '',
            remarks: r.remarks || '',
          };
        }
      });
      setGrades(gradeMap);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId: number, scoreStr: string) => {
    const maxScore = assessment?.max_score || 100;

    // Allow empty string (user clearing the field)
    if (scoreStr === '') {
      setGrades(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], score: '', error: false },
      }));
      return;
    }

    const num = parseFloat(scoreStr);
    if (isNaN(num)) return; // Ignore invalid input

    const hasError = num > maxScore;

    // Clamp the displayed value but keep user's input
    let displayValue = scoreStr;
    if (num > maxScore) {
      displayValue = maxScore.toString();
    }
    if (num < 0) {
      displayValue = '0';
    }

    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], score: displayValue, error: hasError },
    }));
  };

  const handleRemarksChange = (studentId: number, remarks: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const maxScore = assessment?.max_score || 100;

    // Check for any invalid scores
    const hasErrors = Object.values(grades).some(g => g.error);
    if (hasErrors) {
      setMessage({ text: `⚠️ Some scores exceed the maximum of ${maxScore}. Please correct them before saving.`, type: 'error' });
      setSaving(false);
      return;
    }

    const gradesToSave = students
      .filter(s => {
        const scoreStr = grades[s.student_id]?.score;
        return scoreStr !== undefined && scoreStr !== '';
      })
      .map(s => ({
        student_id: Number(s.student_id),
        score: parseFloat(grades[s.student_id].score),
        remarks: grades[s.student_id]?.remarks || null,
      }));

    if (gradesToSave.length === 0) {
      setMessage({ text: "Please enter at least one score", type: 'error' });
      setSaving(false);
      return;
    }

    try {
      const { data } = await api.post("/academics/assessment-results/bulk", {
        assessment_id: Number(assessmentId),
        grades: gradesToSave,
      });

      if (data.success) {
        setMessage({
          text: `✅ ${data.data.created} created, ${data.data.updated} updated${data.data.errors.length > 0 ? `, ${data.data.errors.length} errors` : ''}`,
          type: 'success',
        });
        loadData();
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Save failed", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getGradeColor = (score: number, maxScore: number) => {
    if (!score || !maxScore) return '';
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return 'bg-green-100 text-green-800';
    if (pct >= 70) return 'bg-blue-100 text-blue-800';
    if (pct >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getGradeLetter = (score: number, maxScore: number) => {
    if (!score || !maxScore) return '';
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    if (pct >= 50) return 'E';
    return 'F';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Record Grades</h1>
          </div>
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No students enrolled in this class.</p>
            <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Record Grades</h1>
              <p className="text-sm text-gray-500">
                {assessment?.title} — {assessment?.class_name} • {assessment?.subject_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Max Score: <span className="font-bold text-gray-800">{assessment?.max_score}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {students.length} students
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        {/* Grade Entry Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-320px)]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0 z-30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 sticky left-0 bg-gray-50 z-40 border-r border-gray-200">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-[4rem] bg-gray-50 z-40 border-r border-gray-200 min-w-[200px]">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, idx) => {
                  const score = parseFloat(grades[student.student_id]?.score || '');
                  const grade = getGradeLetter(score, assessment?.max_score);
                  const gradeColor = getGradeColor(score, assessment?.max_score);

                  return (
                    <tr key={student.student_id} className="hover:bg-gray-50 group">
                      <td className="px-4 py-3 text-sm text-gray-500 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200">{idx + 1}</td>
                      <td className="px-4 py-3 sticky left-[4rem] bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200 min-w-[200px]">
                        <div className="text-sm font-medium text-gray-900">
                          {student.student_name || `${student.first_name || ''} ${student.last_name || ''}`}
                        </div>
                        <div className="text-xs text-gray-500">{student.student_reg_no || student.admission_no || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={assessment?.max_score}
                            value={grades[student.student_id]?.score || ''}
                            onChange={(e) => handleScoreChange(student.student_id, e.target.value)}
                            className={`w-20 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:border-teal-500 ${
                              grades[student.student_id]?.error
                                ? 'border-red-500 bg-red-50 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-teal-500'
                            }`}
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-400">/ {assessment?.max_score}</span>
                          {grades[student.student_id]?.error && (
                            <span className="text-xs text-red-600 whitespace-nowrap">⚠️ Max is {assessment?.max_score}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {score > 0 ? (
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${gradeColor}`}>
                            {grade} ({Math.round((score / assessment?.max_score) * 100)}%)
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={grades[student.student_id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student.student_id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Optional remarks..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between sticky bottom-0 z-20">
            <div className="text-sm text-gray-500">
              {Object.keys(grades).filter(k => grades[parseInt(k)]?.score).length} of {students.length} students graded
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Grades"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentResultsPage;
