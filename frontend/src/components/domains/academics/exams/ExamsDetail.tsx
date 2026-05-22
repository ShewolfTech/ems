import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Award, BarChart3, TrendingUp, Download, MessageSquare } from "lucide-react";
import api from "@/utils/api.js";

export function ExamsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (id) loadExamDetails();
  }, [id]);

  const loadExamDetails = async () => {
    setLoading(true);
    try {
      const [examRes, resultsRes] = await Promise.all([
        api.get(`/academics/exams/${id}`),
        api.get("/academics/exam-results", { params: { exam_id: id } }),
      ]);

      const examData = examRes.data?.data;
      setExam(examData);
      
      const examResults = resultsRes.data?.data || [];
      setResults(examResults);

      // Load class students
      if (examData?.class_id) {
        const classRes = await api.get(`/academics/classes/${examData.class_id}`);
        const classData = classRes.data?.data;
        setStudents(classData?.students || []);
      }

      // Calculate statistics
      if (examResults.length > 0 && examData?.max_score) {
        const scores = examResults
          .map((r: any) => r.score)
          .filter((s: any) => s !== null && s !== undefined);
        
        if (scores.length > 0) {
          const total = scores.reduce((sum: number, s: number) => sum + s, 0);
          const average = total / scores.length;
          const highest = Math.max(...scores);
          const lowest = Math.min(...scores);
          const passCount = scores.filter((s: number) => (s / examData.max_score) * 100 >= 50).length;
          const passRate = (passCount / scores.length) * 100;

          // Grade distribution
          const gradeDist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
          examResults.forEach((r: any) => {
            if (r.grade_letter) {
              const grade = r.grade_letter.toUpperCase();
              if (gradeDist[grade] !== undefined) {
                gradeDist[grade]++;
              }
            }
          });

          setStats({
            total: scores.length,
            average,
            highest,
            lowest,
            passRate,
            gradeDistribution: gradeDist,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load exam details", err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 80) return "bg-blue-100 text-blue-800 border-blue-200";
    if (percentage >= 70) return "bg-cyan-100 text-cyan-800 border-cyan-200";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (percentage >= 50) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const exportResults = () => {
    if (!exam || results.length === 0) return;
    
    const headers = ["Student Name", "Admission No", "Score", "Grade", "Grade Point", "Remarks"];
    const rows = results.map(r => {
      const student = students.find((s: any) => s.student_id === r.student_id || s.id === r.student_id);
      return [
        student ? `${student.first_name} ${student.last_name}` : "Unknown",
        student?.admission_no || "-",
        r.score || "0",
        r.grade_letter || "-",
        r.grade_point || "-",
        r.remarks || "-"
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam.title}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Exam Not Found</h3>
            <button
              onClick={() => navigate("/academics/exams")}
              className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/academics/exams")}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{exam.title}</h1>
              <p className="text-slate-600 mt-1">
                {exam.class_name} • {exam.subject_name} • {exam.term_name}
              </p>
            </div>
          </div>
          <button
            onClick={exportResults}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 shadow-md"
          >
            <Download className="w-4 h-4" />
            Export Results
          </button>
        </div>

        {/* Exam Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Date</p>
            <p className="text-lg font-bold text-slate-900">
              {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "-"}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Time</p>
            <p className="text-lg font-bold text-slate-900">
              {exam.start_time && exam.end_time ? (() => {
                const [sh, sm] = exam.start_time.split(":").map(Number);
                const [eh, em] = exam.end_time.split(":").map(Number);
                const diffMins = (eh * 60 + em) - (sh * 60 + sm);
                const hrs = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                const durationStr = mins === 0 ? `${hrs}h` : hrs === 0 ? `${mins}m` : `${hrs}h ${mins}m`;
                return `${exam.start_time.substring(0, 5)} → ${exam.end_time.substring(0, 5)} (${durationStr})`;
              })() : "-"}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Max Score</p>
            <p className="text-lg font-bold text-violet-600">{exam.max_score}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Conductors</p>
            <p className="text-lg font-bold text-slate-900">{exam.conductors?.length || 0}</p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-md p-6 text-white">
                <Users className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Students Scored</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
                <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Average</p>
                <p className="text-3xl font-bold">{((stats.average / exam.max_score) * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-md p-6 text-white">
                <Award className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Highest</p>
                <p className="text-3xl font-bold">{stats.highest}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md p-6 text-white">
                <BarChart3 className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Lowest</p>
                <p className="text-3xl font-bold">{stats.lowest}</p>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-green-600 rounded-xl shadow-md p-6 text-white">
                <Award className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Pass Rate</p>
                <p className="text-3xl font-bold">{stats.passRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Grade Distribution</h3>
              <div className="flex items-end gap-4 h-40">
                {Object.entries(stats.gradeDistribution).map(([grade, count]) => {
                  const maxCount = Math.max(...Object.values(stats.gradeDistribution), 1);
                  const height = (count as number / maxCount) * 100;
                  const percentage = stats.total > 0 ? ((count as number) / stats.total) * 100 : 0;
                  return (
                    <div key={grade} className="flex-1 flex flex-col items-center">
                      <span className="text-sm font-bold text-slate-700 mb-2">{count as number}</span>
                      <div
                        className={`w-full rounded-t-lg border-b-0 ${getGradeColor(percentage)}`}
                        style={{ height: `${Math.max(height, 4)}%`, minHeight: (count as number) > 0 ? '12px' : '4px' }}
                      />
                      <span className="text-xl font-bold text-slate-800 mt-2">{grade}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Teacher Comments */}
        {exam.teacher_comments && Object.keys(exam.teacher_comments).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-600" />
              Teacher Comments
            </h3>
            <div className="space-y-3">
              {Object.entries(exam.teacher_comments).map(([key, value]) => (
                <div key={key} className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-violet-600 mb-1 uppercase tracking-wide">{key}</div>
                  <div className="text-sm text-slate-700">{value as string}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conductors */}
        {exam.conductors && exam.conductors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Invigilation Staff</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {exam.conductors.map((conductor: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {conductor.name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{conductor.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{conductor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Student Results</h3>
          </div>
          {results.length > 0 ? (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase sticky left-0 bg-slate-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-12">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase sticky left-[3rem] bg-slate-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px]">Student Name</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Grade</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Grade Point</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Percentage</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results.map((result, idx) => {
                    const student = students.find((s: any) => s.student_id === result.student_id || s.id === result.student_id);
                    const percentage = exam.max_score ? (result.score / exam.max_score) * 100 : 0;

                    return (
                      <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-600 font-medium sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-12">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 sticky left-[3rem] bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          {student ? `${student.first_name} ${student.last_name}` : "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-900">
                          {result.score}/{exam.max_score}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getGradeColor(percentage)}`}>
                            {result.grade_letter || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700">{result.grade_point || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${
                            percentage >= 70 ? 'text-green-600' : 
                            percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{result.remarks || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Results Yet</h3>
              <p className="text-slate-600 mb-4">Results haven't been entered for this exam.</p>
              <button
                onClick={() => navigate("/academics/exams")}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Go to Bulk Results Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExamsDetail;
