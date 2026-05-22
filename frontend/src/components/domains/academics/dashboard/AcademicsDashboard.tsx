import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api.js";
import {
  TrendingUp, TrendingDown, Users, BookOpen, Award, Calendar,
  Clock, FileText, Star, Target, BarChart3, Activity,
  ChevronRight, GraduationCap, School, CheckCircle, AlertTriangle,
  XCircle, PieChart, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";

export function AcademicsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [classRankings, setClassRankings] = useState<any[]>([]);
  const [attendanceOverview, setAttendanceOverview] = useState<any>(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      loadDashboard();
    }
  }, [selectedClass, selectedTerm]);

  const loadDropdowns = async () => {
    try {
      const [classesRes, termsRes] = await Promise.all([
        api.get("/academics/classes"),
        api.get("/academics/terms"),
      ]);
      const classesData = classesRes.data?.data || [];
      setClasses(classesData);
      setTerms(termsRes.data?.data || []);
      if (classesData.length > 0 && !selectedClass) {
        setSelectedClass(classesData[0].id);
      }
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedClass) params.class_id = selectedClass;
      if (selectedTerm) params.term_id = selectedTerm;

      const [assignmentsRes, examsRes, classesRes] = await Promise.all([
        api.get("/academics/assignments", { params }).catch(() => ({ data: { data: [] } })),
        api.get("/academics/exams", { params }).catch(() => ({ data: { data: [] } })),
        api.get("/academics/classes").catch(() => ({ data: { data: [] } })),
      ]);

      // Calculate overview stats
      const assignments = assignmentsRes.data?.data || [];
      const exams = examsRes.data?.data || [];
      const allClasses = classesRes.data?.data || [];

      const totalAssignments = assignments.length;
      const totalExams = exams.length;
      const totalClasses = allClasses.length;
      const gradedAssignments = assignments.filter((a: any) => a.submissions_count > 0).length;
      const gradedExams = exams.filter((e: any) => e.resultsCount > 0).length;

      setOverview({
        total_classes: totalClasses,
        total_assignments: totalAssignments,
        total_exams: totalExams,
        graded_assignments: gradedAssignments,
        graded_exams: gradedExams,
        overall_completion: totalAssignments + totalExams > 0
          ? ((gradedAssignments + gradedExams) / (totalAssignments + totalExams)) * 100
          : 0,
      });

      // Recent activity (latest assignments and exams)
      const recentAssignments = assignments.slice(0, 5).map((a: any) => ({
        type: 'assignment',
        title: a.title,
        class: a.class_name,
        date: a.due_date,
        status: a.is_active ? 'Active' : 'Inactive',
      }));

      const recentExams = exams.slice(0, 5).map((e: any) => ({
        type: 'exam',
        title: e.title,
        class: e.class_name,
        date: e.exam_date,
        status: e.is_active ? 'Active' : 'Inactive',
      }));

      setRecentActivity([...recentAssignments, ...recentExams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10));

      // Upcoming deadlines (assignments due in next 7 days)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = assignments.filter((a: any) => {
        const dueDate = new Date(a.due_date);
        return dueDate >= now && dueDate <= nextWeek;
      }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

      setUpcomingDeadlines(upcoming);

      // Subject performance from exams
      const examSubjects: Record<string, any> = {};
      exams.forEach((exam: any) => {
        if (!examSubjects[exam.subject_id]) {
          examSubjects[exam.subject_id] = {
            subject_name: exam.subject_name,
            total_exams: 0,
            total_results: 0,
            total_score: 0,
          };
        }
        examSubjects[exam.subject_id].total_exams++;
        examSubjects[exam.subject_id].total_results += exam.resultsCount || 0;
      });

      setSubjectPerformance(Object.values(examSubjects));

    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number, threshold: number = 70) => {
    if (value >= threshold) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (value >= threshold - 20) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <ArrowDownRight className="w-4 h-4 text-red-600" />;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 60) return "text-teal-600 bg-teal-50";
    if (percentage >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const daysUntil = (dateStr: string) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-4 text-lg font-semibold text-slate-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-teal-600" />
              Academics Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Comprehensive overview of academic performance and analytics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Terms</option>
              {terms.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-teal-600" />
            </div>
            {getTrendIcon(overview?.overall_completion || 0)}
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Overall Completion</h3>
          <p className="text-3xl font-bold text-slate-900">{overview?.overall_completion?.toFixed(1) || 0}%</p>
          <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
              style={{ width: `${overview?.overall_completion || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            {getTrendIcon(overview?.graded_assignments || 0, 5)}
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Assignments Graded</h3>
          <p className="text-3xl font-bold text-slate-900">{overview?.graded_assignments || 0}/{overview?.total_assignments || 0}</p>
          <p className="text-xs text-slate-500 mt-1">
            {overview?.total_assignments ? Math.round((overview.graded_assignments / overview.total_assignments) * 100) : 0}% completion rate
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            {getTrendIcon(overview?.graded_exams || 0, 5)}
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Exams Graded</h3>
          <p className="text-3xl font-bold text-slate-900">{overview?.graded_exams || 0}/{overview?.total_exams || 0}</p>
          <p className="text-xs text-slate-500 mt-1">
            {overview?.total_exams ? Math.round((overview.graded_exams / overview.total_exams) * 100) : 0}% completion rate
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <School className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-600 mb-1">Total Classes</h3>
          <p className="text-3xl font-bold text-slate-900">{overview?.total_classes || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Active classes this term</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Upcoming Deadlines
            </h3>
            <span className="text-xs text-slate-500">Next 7 days</span>
          </div>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 5).map((deadline: any, idx: number) => {
                const days = daysUntil(deadline.due_date);
                return (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 text-sm">{deadline.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        days <= 2 ? 'bg-red-100 text-red-700' : days <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{deadline.class_name} • {formatDate(deadline.due_date)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600 text-sm">No upcoming deadlines</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h3>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'assignment' ? 'bg-teal-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'assignment' ? (
                      <FileText className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Award className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.class} • {formatDate(activity.date)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activity.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600 text-sm">No recent activity</p>
            </div>
          )}
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              Subject Overview
            </h3>
          </div>
          {subjectPerformance.length > 0 ? (
            <div className="space-y-3">
              {subjectPerformance.slice(0, 5).map((subject: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900">{subject.subject_name}</span>
                    <span className="text-xs text-slate-500">{subject.total_exams} exam(s)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full"
                      style={{ width: `${Math.min((subject.total_results / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{subject.total_results} result(s) recorded</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600 text-sm">No subject data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "Assignments", icon: FileText, route: "/academics/assignments", bg: "bg-teal-100", text: "text-teal-600", hover: "hover:bg-teal-200" },
              { label: "Exams", icon: Award, route: "/academics/exams", bg: "bg-purple-100", text: "text-purple-600", hover: "hover:bg-purple-200" },
              { label: "Grade Book", icon: Star, route: "/academics/gradebook", bg: "bg-cyan-100", text: "text-cyan-600", hover: "hover:bg-cyan-200" },
              { label: "Student Reports", icon: GraduationCap, route: "/academics/student-report", bg: "bg-blue-100", text: "text-blue-600", hover: "hover:bg-blue-200" },
              { label: "Classes", icon: School, route: "/academics/classes", bg: "bg-green-100", text: "text-green-600", hover: "hover:bg-green-200" },
              { label: "Analytics", icon: PieChart, route: "/academics/assignments", bg: "bg-orange-100", text: "text-orange-600", hover: "hover:bg-orange-200" },
            ].map((action: any, idx: number) => (
              <button
                key={idx}
                onClick={() => navigate(action.route)}
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 hover:border-slate-300 transition-all group"
              >
                <div className={`p-3 rounded-lg ${action.bg} ${action.hover} transition-colors`}>
                  <action.icon className={`w-6 h-6 ${action.text}`} />
                </div>
                <span className="text-sm font-semibold text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-teal-100 mb-1">Academic Year</h4>
              <p className="text-2xl font-bold">2026</p>
            </div>
            <div className="text-center">
              <h4 className="text-sm font-semibold text-teal-100 mb-1">Current Term</h4>
              <p className="text-2xl font-bold">{terms.find((t: any) => t.id == selectedTerm)?.name || "All Terms"}</p>
            </div>
            <div className="text-center">
              <h4 className="text-sm font-semibold text-teal-100 mb-1">Last Updated</h4>
              <p className="text-2xl font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademicsDashboard;
