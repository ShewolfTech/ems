import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, BookOpen, User, Award, Clock, CheckCircle, MessageSquare, FileText, Users, BarChart3 } from "lucide-react";
import api from "@/utils/api.js";

export function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (id) loadAssignmentDetails();
  }, [id]);

  const loadAssignmentDetails = async () => {
    setLoading(true);
    try {
      const assignmentRes = await api.get(`/academics/assignments/${id}`);
      const assignmentData = assignmentRes.data?.data;
      setAssignment(assignmentData);

      const assignmentSubmissions = assignmentData?.submissions || [];
      setSubmissions(assignmentSubmissions);

      // Load class students
      if (assignmentData?.class_id) {
        const classRes = await api.get(`/academics/classes/${assignmentData.class_id}`);
        const classData = classRes.data?.data;
        setStudents(classData?.students || []);
      }

      // Calculate statistics
      if (assignmentSubmissions.length > 0 && assignmentData?.max_score) {
        const scores = assignmentSubmissions
          .map((r: any) => r.score)
          .filter((s: any) => s !== null && s !== undefined);

        if (scores.length > 0) {
          const total = scores.reduce((sum: number, s: number) => sum + s, 0);
          const average = total / scores.length;
          const highest = Math.max(...scores);
          const lowest = Math.min(...scores);
          const passCount = scores.filter((s: number) => (s / assignmentData.max_score) * 100 >= 50).length;
          const passRate = (passCount / scores.length) * 100;

          // Grade distribution
          const gradeDist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
          assignmentSubmissions.forEach((r: any) => {
            if (r.grade_letter) {
              const grade = r.grade_letter.toUpperCase();
              if (gradeDist[grade] !== undefined) {
                gradeDist[grade]++;
              }
            }
          });

          setStats({
            total: scores.length,
            totalStudents: students.length || assignmentSubmissions.length,
            average,
            highest,
            lowest,
            passRate,
            gradeDistribution: gradeDist,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load assignment details", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-100 text-green-800",
      B: "bg-cyan-100 text-cyan-800",
      C: "bg-teal-100 text-teal-800",
      D: "bg-orange-100 text-orange-800",
      F: "bg-red-100 text-red-800",
    };
    return colors[grade] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-4 text-lg font-semibold text-slate-600">Loading assignment...</span>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Assignment Not Found</h2>
        <p className="text-slate-600 mb-6">The assignment you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => navigate("/academics/assignments")}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Assignments
        </button>
      </div>
    );
  }

  const isOverdue = assignment.due_date && assignment.is_active && new Date(assignment.due_date) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-teal-600" />
              {assignment.title || "Untitled Assignment"}
            </h1>
            <p className="text-slate-600 mt-1">
              {assignment.class_name || "No Class"} • {assignment.subject_name || "No Subject"} • {assignment.term_name || "No Term"}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Submissions</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}/{stats.totalStudents}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Average</p>
              <p className="text-2xl font-bold text-teal-600">{((stats.average / assignment.max_score) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Highest</p>
              <p className="text-2xl font-bold text-green-600">{stats.highest}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Lowest</p>
              <p className="text-2xl font-bold text-red-600">{stats.lowest}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Pass Rate</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.passRate.toFixed(1)}%</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  Assignment Details
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 mb-1">Class</span>
                  <span className="text-base text-slate-900">{assignment.class_name || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 mb-1">Subject</span>
                  <span className="text-base text-slate-900">{assignment.subject_name || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 mb-1">Term</span>
                  <span className="text-base text-slate-900">{assignment.term_name || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 mb-1">Teacher</span>
                  <span className="text-base text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {assignment.teacher_name || "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 mb-1">Due Date</span>
                  <span className={`text-base font-semibold flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                    <Calendar className="w-4 h-4" />
                    {formatDate(assignment.due_date)}
                  </span>
                  {isOverdue && (
                    <span className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Overdue
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 mb-1">Max Score</span>
                    <span className="text-lg font-bold text-teal-600 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      {assignment.max_score ?? "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 mb-1">Weight</span>
                    <span className="text-lg font-semibold text-slate-900">{assignment.weight ?? "1.0"}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 mb-1">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold w-fit ${
                    assignment.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                    {assignment.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {assignment.description && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Description</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{assignment.description}</p>
                </div>
              </div>
            )}

            {/* Grade Distribution */}
            {stats && stats.gradeDistribution && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-slate-500" />
                    Grade Distribution
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-end gap-3 h-32">
                    {Object.entries(stats.gradeDistribution).map(([grade, count]) => {
                      const maxCount = Math.max(...Object.values(stats.gradeDistribution), 1);
                      const height = (count / maxCount) * 100;
                      return (
                        <div key={grade} className="flex-1 flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-700 mb-2">{count}</span>
                          <div
                            className={`w-full rounded-t-lg ${getGradeColor(grade)}`}
                            style={{ height: `${Math.max(height, 4)}%`, minHeight: count > 0 ? '12px' : '4px' }}
                          />
                          <span className="text-lg font-bold text-slate-800 mt-2">{grade}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Submissions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  Student Submissions
                </h3>
                <span className="text-sm text-slate-600">
                  {submissions.length} / {stats?.totalStudents || students.length} students
                </span>
              </div>
              {submissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {submissions.map((sub: any, idx: number) => (
                        <tr key={sub.id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-600 font-medium">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-slate-900">
                              {sub.first_name} {sub.last_name}
                            </div>
                            <div className="text-xs text-slate-500">{sub.admission_no || "—"}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {sub.score !== null && sub.score !== undefined ? (
                              <span className="text-sm font-semibold text-slate-900">
                                {sub.score}/{assignment.max_score}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {sub.grade_letter ? (
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getGradeColor(sub.grade_letter)}`}>
                                {sub.grade_letter}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-slate-600">
                            {sub.submission_date ? formatDate(sub.submission_date) : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {sub.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No Submissions Yet</h3>
                  <p className="text-slate-600 mb-6">Students haven't submitted this assignment yet, or grades haven't been entered.</p>
                  <button
                    onClick={() => navigate("/academics/assignments")}
                    className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all font-medium"
                  >
                    Back to Assignments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentDetailPage;
