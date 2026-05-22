import React, { useState, useEffect, useMemo } from "react";
import { BarChart3, TrendingUp, Users, Award, TrendingDown, Minus, Filter, RefreshCw } from "lucide-react";
import api from "@/utils/api.js";

interface ExamAnalyticsProps {
  exams?: any[];
  loading?: boolean;
  refreshKey?: number;
}

export function ExamAnalytics({ exams = [], loading: examsLoading, refreshKey = 0 }: ExamAnalyticsProps) {
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

      const { data } = await api.get("/academics/exams/analytics", { params });
      setAnalytics(data.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = useMemo(() => {
    let filtered = exams;
    if (selectedClass) {
      filtered = filtered.filter((e: any) => String(e.class_id) === String(selectedClass));
    }
    if (selectedTerm) {
      filtered = filtered.filter((e: any) => String(e.term_id) === String(selectedTerm));
    }
    return filtered;
  }, [exams, selectedClass, selectedTerm]);

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

  if (examsLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 opacity-80" />
                {getTrendIcon(analytics.trend || 'stable')}
              </div>
              <p className="text-sm opacity-90">Total Exams</p>
              <p className="text-3xl font-bold">{analytics.totalExams}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90">Students Assessed</p>
              <p className="text-3xl font-bold">{analytics.totalStudents}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90">Class Average</p>
              <p className="text-3xl font-bold">{analytics.averageScore?.toFixed(1) || 'N/A'}%</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90">Pass Rate</p>
              <p className="text-3xl font-bold">{analytics.passRate?.toFixed(1) || 'N/A'}%</p>
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

          {/* Performance Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Trend</h3>
            <div className="flex items-end gap-3 h-48">
              {analytics.trendData?.map((item: any, idx: number) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-700 mb-1">{item.average.toFixed(0)}%</span>
                  <div
                    className={`w-full rounded-t-lg ${
                      item.average >= 70 ? 'bg-green-500' :
                      item.average >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${item.average}%`, minHeight: '8px' }}
                  />
                  <span className="text-xs text-slate-600 mt-1 truncate w-full text-center" title={item.title}>
                    {item.title.substring(0, 10)}
                  </span>
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
                      <span>{subject.totalExams} exam(s)</span>
                      <span>{subject.totalStudents} student(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Exams List with Results Count */}
      {filteredExams.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Exams Overview</h3>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Updates after saving results
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExams.map((exam: any) => (
              <div key={exam.id} className="p-4 border border-slate-200 rounded-lg hover:border-teal-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 flex-1">{exam.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    exam.resultsCount > 0 
                      ? 'bg-teal-100 text-teal-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {exam.resultsCount || 0} result{(exam.resultsCount || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>{exam.class_name} • {exam.subject_name}</p>
                  <p>{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'No date'}</p>
                  <p className="text-xs">Max Score: {exam.max_score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Select a Class</h3>
          <p className="text-slate-600">Choose a class above to view exam analytics and performance insights.</p>
        </div>
      )}
    </div>
  );
}

export default ExamAnalytics;
