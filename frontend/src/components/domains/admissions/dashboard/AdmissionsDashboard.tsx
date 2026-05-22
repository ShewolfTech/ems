import React, { useState, useEffect } from 'react';
import { getPipelineStats } from '@/domains/admissions/decisions/controller.js';
import { getDashboardStats } from '@/domains/admissions/applications/controller.js';
import { getInterviewsList } from '@/components/domains/admissions/interviews/controller.js';
import { getApplicationsList } from '@/domains/admissions/applications/controller.js';
import { getEnrollmentsList, getEnrollmentStatistics } from '@/domains/admissions/enrollments/controller.js';
import { getEntranceExams } from '@/domains/admissions/exams/controller.js';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardFilters {
  startDate: string;
  endDate: string;
}

interface PipelineStats {
  total_applications: number;
  enrolled: number;
  rejected: number;
  conversion_rate: string;
  by_status: any[];
}

const COLORS = ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#6B7280', '#14B8A6'];

export const AdmissionsDashboard: React.FC = () => {
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentStats, setEnrollmentStats] = useState<any>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: '',
    endDate: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const filterParams: any = {};
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;

      const [
        statsRes,
        dashboardRes,
        interviewsRes,
        appsRes,
        enrollmentsRes,
        enrollmentStatsRes,
        examsRes,
      ] = await Promise.all([
        getPipelineStats(filterParams),
        getDashboardStats(),
        getInterviewsList({ status: 'pending', ...filterParams }),
        getApplicationsList({ limit: 10, ...filterParams }),
        getEnrollmentsList({ limit: 10 }),
        getEnrollmentStatistics(),
        getEntranceExams({ limit: 10 }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (dashboardRes.success) setDashboardData(dashboardRes.data);
      if (interviewsRes.success) setInterviews(interviewsRes.data || []);
      if (appsRes.success) setRecentApplications(appsRes.data?.data || []);
      if (enrollmentsRes.success) setEnrollments(enrollmentsRes.data || []);
      if (enrollmentStatsRes.success) setEnrollmentStats(enrollmentStatsRes.data);
      if (examsRes.success) setExamResults(examsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadData();
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '' });
    setTimeout(() => loadData(), 0);
  };

  const getStatusColor = (code: string) => {
    const colors: any = {
      APPLIED: 'bg-blue-500',
      UNDER_REVIEW: 'bg-yellow-500',
      INTERVIEW_SCHEDULED: 'bg-purple-500',
      INTERVIEWED: 'bg-gray-500',
      OFFERED: 'bg-green-500',
      WAITLISTED: 'bg-pink-500',
      REJECTED: 'bg-red-500',
      ENROLLED: 'bg-emerald-500',
    };
    return colors[code] || 'bg-gray-400';
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      APPLIED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-800',
      INTERVIEWED: 'bg-gray-100 text-gray-800',
      OFFERED: 'bg-green-100 text-green-800',
      WAITLISTED: 'bg-pink-100 text-pink-800',
      REJECTED: 'bg-red-100 text-red-800',
      ENROLLED: 'bg-emerald-100 text-emerald-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getExamGradeColor = (grade: string) => {
    const colors: any = {
      A: 'text-green-600',
      B: 'text-blue-600',
      C: 'text-yellow-600',
      D: 'text-orange-600',
      F: 'text-red-600',
    };
    return colors[grade] || 'text-gray-600';
  };

  // Prepare chart data
  const monthlyData = (dashboardData?.applications_by_month || []).map((d: any) => ({
    month: new Date(d.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    applications: Number(d.count),
  }));

  const gradeData = (dashboardData?.applications_by_grade || []).map((d: any) => ({
    grade: d.grade,
    count: Number(d.count),
  }));

  const genderData = (dashboardData?.gender_by_grade || []).reduce((acc: any, d: any) => {
    const grade = d.grade;
    if (!acc[grade]) acc[grade] = { grade, male: 0, female: 0 };
    if (d.gender?.toLowerCase() === 'male') acc[grade].male = Number(d.count);
    else if (d.gender?.toLowerCase() === 'female') acc[grade].female = Number(d.count);
    return acc;
  }, {});
  const genderChartData = Object.values(genderData);

  const funnel = dashboardData?.funnel || {};
  const funnelData = [
    { stage: 'Enquiries', value: funnel.enquiries || 0, color: '#3B82F6' },
    { stage: 'Applications', value: funnel.applications || 0, color: '#8B5CF6' },
    { stage: 'Enrolled', value: funnel.enrolled || 0, color: '#10B981' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admissions Dashboard</h1>
          <p className="text-gray-600">Track applications from submission to enrollment</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={applyFilters}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
          >
            Clear
          </button>
          <button
            onClick={loadData}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Total Applications</div>
          <div className="text-3xl font-bold text-gray-900">{stats?.total_applications || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Enrolled</div>
          <div className="text-3xl font-bold text-green-600">{stats?.enrolled || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Rejected</div>
          <div className="text-3xl font-bold text-red-600">{stats?.rejected || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Pending Confirmation</div>
          <div className="text-3xl font-bold text-yellow-600">{enrollmentStats?.pending_confirmation || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Conversion Rate</div>
          <div className="text-3xl font-bold text-blue-600">{stats?.conversion_rate || 0}%</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Applications Trend (6 Months)</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 text-center py-8">No data available</div>
          )}
        </div>

        {/* Applications by Grade */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Applications by Grade</h2>
          {gradeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 text-center py-8">No data available</div>
          )}
        </div>
      </div>

      {/* Gender & Funnel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution by Grade */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Gender Distribution by Grade</h2>
          {genderChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={genderChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="male" fill="#3B82F6" name="Male" />
                <Bar dataKey="female" fill="#EC4899" name="Female" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 text-center py-8">No data available</div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Conversion Funnel</h2>
          {funnelData.some((d: any) => d.value > 0) ? (
            <div className="space-y-4">
              {funnelData.map((stage: any, i: number) => (
                <div key={stage.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{stage.stage}</span>
                    <span className="font-bold">{stage.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full transition-all"
                      style={{
                        width: `${funnelData[0].value > 0 ? (stage.value / funnelData[0].value) * 100 : 0}%`,
                        backgroundColor: stage.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {funnelData[0].value > 0 && (
                <div className="text-sm text-gray-500 mt-4 text-center">
                  Overall conversion: {((funnelData[2].value / funnelData[0].value) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">No data available</div>
          )}
        </div>
      </div>

      {/* Pipeline Funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Application Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats?.by_status.map((status: any) => (
            <div key={status.status_code} className="text-center">
              <div className={`${getStatusColor(status.status_code)} w-full h-2 rounded mb-2`}></div>
              <div className="text-xs text-gray-600 mb-1">{status.status.replace(/_/g, ' ')}</div>
              <div className="text-2xl font-bold text-gray-900">{status.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link to="/admissions/applications" className="bg-white rounded-lg shadow p-4 text-center hover:bg-gray-50 transition-colors">
          <div className="text-2xl mb-2">📋</div>
          <div className="text-sm font-medium text-gray-700">Applications</div>
        </Link>
        <Link to="/admissions/interviews" className="bg-white rounded-lg shadow p-4 text-center hover:bg-gray-50 transition-colors">
          <div className="text-2xl mb-2">🎤</div>
          <div className="text-sm font-medium text-gray-700">Interviews</div>
        </Link>
        <Link to="/admissions/decisions" className="bg-white rounded-lg shadow p-4 text-center hover:bg-gray-50 transition-colors">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-sm font-medium text-gray-700">Decisions</div>
        </Link>
        <Link to="/admissions/enrollments" className="bg-white rounded-lg shadow p-4 text-center hover:bg-gray-50 transition-colors">
          <div className="text-2xl mb-2">🎓</div>
          <div className="text-sm font-medium text-gray-700">Enrollments</div>
        </Link>
        <Link to="/admissions/entrance_exams" className="bg-white rounded-lg shadow p-4 text-center hover:bg-gray-50 transition-colors">
          <div className="text-2xl mb-2">📝</div>
          <div className="text-sm font-medium text-gray-700">Exams</div>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Applications</h2>
            <Link to="/admissions/applications" className="text-sm text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No applications yet</div>
          ) : (
            <div className="space-y-3">
              {recentApplications.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{app.application_no}</div>
                    <div className="text-xs text-gray-600">{app.first_name} {app.last_name}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(app.status_code)}`}>
                    {app.status?.replace(/_/g, ' ') || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Upcoming Interviews</h2>
            <Link to="/admissions/interviews" className="text-sm text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
          {interviews.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No upcoming interviews</div>
          ) : (
            <div className="space-y-3">
              {interviews.slice(0, 5).map((interview: any) => (
                <div key={interview.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{interview.first_name} {interview.last_name}</div>
                    <div className="text-xs text-gray-600">{interview.interview_type?.replace(/_/g, ' ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">
                      {new Date(interview.scheduled_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">{interview.location || '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrollment Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Enrollment Status</h2>
            <Link to="/admissions/enrollments" className="text-sm text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
          {enrollmentStats ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Confirmation</span>
                <span className="text-2xl font-bold text-yellow-600">{enrollmentStats.pending_confirmation || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Confirmed Students</span>
                <span className="text-2xl font-bold text-green-600">{enrollmentStats.completed || 0}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-2xl font-bold text-gray-900">{enrollmentStats.total || 0}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">No enrollment data</div>
          )}
        </div>

        {/* Recent Exam Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Exam Results</h2>
            <Link to="/admissions/entrance_exams" className="text-sm text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
          {examResults.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No exam results yet</div>
          ) : (
            <div className="space-y-3">
              {examResults.slice(0, 5).map((exam: any) => (
                <div key={exam.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{exam.first_name} {exam.last_name}</div>
                    <div className="text-xs text-gray-600">{exam.exam_name || exam.session_name || 'Entrance Exam'}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getExamGradeColor(exam.grade)}`}>
                      {exam.grade || '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {exam.marks_obtained}/{exam.total_marks} ({Number(exam.percentage || 0).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdmissionsDashboard;
