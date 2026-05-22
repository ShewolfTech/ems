import React, { useState, useEffect, useMemo } from "react";
import { BarChart3, TrendingUp, Users, Award, TrendingDown, Minus, Filter, Clock, CheckCircle } from "lucide-react";
import api from "@/utils/api.js";

interface AssignmentAnalyticsProps {
  assignments?: any[];
  loading?: boolean;
  refreshKey?: number;
}

export function AssignmentAnalytics({ assignments = [], loading: assignmentsLoading, refreshKey = 0 }: AssignmentAnalyticsProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadAnalytics();
    }
  }, [selectedClass, selectedTerm, refreshKey]);

  const loadDropdowns = async () => {
    try {
      const [classesRes, termsRes] = await Promise.all([
        api.get("/academics/classes"),
        api.get("/academics/terms"),
      ]);
      setClasses(classesRes.data?.data || []);
      setTerms(termsRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const params: any = { class_id: selectedClass };
      if (selectedTerm) params.term_id = selectedTerm;

      const { data } = await api.get("/academics/assignments/analytics", { params });
      setAnalytics(data.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = useMemo(() => {
    let filtered = assignments;
    if (selectedClass) {
      filtered = filtered.filter((a: any) => String(a.class_id) === String(selectedClass));
    }
    if (selectedTerm) {
      filtered = filtered.filter((a: any) => String(a.term_id) === String(selectedTerm));
    }
    return filtered;
  }, [assignments, selectedClass, selectedTerm]);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 80) return "bg-blue-100 text-blue-800 border-blue-200";
    if (percentage >= 70) return "bg-cyan-100 text-cyan-800 border-cyan-200";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (percentage >= 50) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  if (assignmentsLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Term (Optional)</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All terms</option>
              {terms.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {analytics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 opacity-80" />
                {getTrendIcon(analytics.trend || 'stable')}
              </div>
              <p className="text-sm opacity-90">Total Assignments</p>
              <p className="text-3xl font-bold">{analytics.totalAssignments}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90">Students Tracked</p>
              <p className="text-3xl font-bold">{analytics.totalStudents}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90">Submission Rate</p>
              <p className="text-3xl font-bold">{analytics.submissionRate?.toFixed(1) || 'N/A'}%</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90">Average Score</p>
              <p className="text-3xl font-bold">{analytics.averageScore?.toFixed(1) || 'N/A'}%</p>
            </div>
          </div>

          {/* Overdue & Upcoming */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-red-600" />
                <h3 className="font-bold text-slate-900">Overdue Assignments</h3>
              </div>
              <p className="text-3xl font-bold text-red-600">{analytics.overdueCount || 0}</p>
              <p className="text-xs text-slate-600 mt-1">Past due date</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-slate-900">Upcoming Assignments</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">{analytics.upcomingCount || 0}</p>
              <p className="text-xs text-slate-600 mt-1">Due date ahead</p>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Grade Distribution</h3>
            <div className="flex items-end gap-4 h-48">
              {analytics.gradeDistribution?.map((grade: any) => {
                const maxCount = Math.max(...analytics.gradeDistribution.map((g: any) => g.count), 1);
                const height = (grade.count / maxCount) * 100;
                return (
                  <div key={grade.grade} className="flex-1 flex flex-col items-center">
                    <span className="text-sm font-bold text-slate-700 mb-2">{grade.count}</span>
                    <div
                      className={`w-full rounded-t-lg border-b-0 ${getGradeColor(grade.percentage)}`}
                      style={{ height: `${Math.max(height, 4)}%`, minHeight: grade.count > 0 ? '12px' : '4px' }}
                    />
                    <span className="text-lg font-bold text-slate-800 mt-2">{grade.grade}</span>
                    <span className="text-xs text-slate-500">{grade.percentage.toFixed(0)}%+</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission Status Distribution */}
          {analytics.statusDistribution && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Submission Status</h3>
              <div className="space-y-4">
                {analytics.statusDistribution.map((status: any) => (
                  <div key={status.status} className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-700 w-32 capitalize">
                      {status.status.replace('_', ' ')}
                    </span>
                    <div className="flex-1 bg-slate-200 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full rounded-full flex items-center justify-end pr-2 ${
                          status.status === 'submitted' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${status.percentage}%` }}
                      >
                        <span className="text-xs font-bold text-white">{status.count}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 w-16 text-right">
                      {status.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Submission Rate Trend</h3>
            <div className="flex items-end gap-3 h-48">
              {analytics.trendData?.map((item: any, idx: number) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-700 mb-1">{item.submissionRate.toFixed(0)}%</span>
                  <div
                    className={`w-full rounded-t-lg ${
                      item.submissionRate >= 70 ? 'bg-green-500' :
                      item.submissionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${item.submissionRate}%`, minHeight: '8px' }}
                  />
                  <span className="text-xs text-slate-600 mt-1 truncate w-full text-center" title={item.title}>
                    {item.title.substring(0, 10)}
                  </span>
                  {item.isOverdue && (
                    <span className="text-[9px] text-red-600 font-semibold mt-0.5">Overdue</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Subject Performance */}
          {analytics.subjectPerformance && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Subject Performance</h3>
              <div className="space-y-3">
                {analytics.subjectPerformance.map((subject: any) => (
                  <div key={subject.subject_id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-900">{subject.subject_name}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(subject.average)}`}>
                        {subject.average.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          subject.average >= 70 ? 'bg-green-500' :
                          subject.average >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${subject.average}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-600">
                      <span>{subject.totalSubmissions} submission(s)</span>
                      <span>{subject.totalStudents} student(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Assignments List with Submission Count */}
      {filteredAssignments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Assignments Overview</h3>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Updates after entering submissions
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment: any) => {
              const isOverdue = new Date(assignment.due_date) < new Date();
              return (
                <div key={assignment.id} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 flex-1">{assignment.title}</h4>
                    {isOverdue && (
                      <span className="text-xs px-2 py-1 rounded-full font-semibold bg-red-100 text-red-700">
                        Overdue
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>{assignment.class_name} • {assignment.subject_name}</p>
                    <p>{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No date'}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs">Max Score: {assignment.max_score}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        assignment.submissions_count > 0
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {assignment.submissions_count || 0}/{assignment.total_students || 0} submissions
                      </span>
                    </div>
                    {assignment.submission_rate !== undefined && (
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full ${
                            assignment.submission_rate >= 70 ? 'bg-green-500' :
                            assignment.submission_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${assignment.submission_rate}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Select a Class</h3>
          <p className="text-slate-600">Choose a class above to view assignment analytics and submission insights.</p>
        </div>
      )}
    </div>
  );
}

export default AssignmentAnalytics;
