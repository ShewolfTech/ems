import React, { useState, useEffect } from 'react';
import {
  getApplicationsList,
  getAdmissionStatistics,
  getAdmissionStatuses,
  removeApplication
} from '@/domains/admissions/applications/controller.js';
import { getExamsByApplication, createExamResult } from '@/domains/admissions/exams/controller.js';
import { makeDecision } from '@/domains/admissions/decisions/controller.js';
import { getPendingInterviews } from '@/domains/admissions/interviews/controller.js';

const StatCard = ({ title, value, color = 'blue', subtitle }: { title: string; value: number | string; color?: string; subtitle?: string }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
    pink: 'bg-pink-500',
    teal: 'bg-teal-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} rounded-full p-3 mr-4`}>
          <div className="w-6 h-6 bg-white rounded-full opacity-20"></div>
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, color }: { status: string; color?: string }) => {
  const statusClasses: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    interview_scheduled: 'bg-purple-100 text-purple-800',
    interviewed: 'bg-gray-100 text-gray-800',
    offered: 'bg-green-100 text-green-800',
    waitlisted: 'bg-pink-100 text-pink-800',
    rejected: 'bg-red-100 text-red-800',
    enrolled: 'bg-emerald-100 text-emerald-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  const baseClass = color
    ? `text-white px-2 py-1 rounded-full text-xs font-medium`
    : statusClasses[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';

  return (
    <span className={baseClass} style={color ? { backgroundColor: color } : {}}>
      {status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
};

export const ApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [pendingInterviews, setPendingInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 100,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 100,
  });
  const [showExamModal, setShowExamModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [examData, setExamData] = useState({
    exam_name: 'Mathematics',
    exam_date: new Date().toISOString().split('T')[0],
    total_marks: 100,
    marks_obtained: 0,
    grade: '',
    remarks: '',
  });
  const [decisionData, setDecisionData] = useState({
    decision_type: 'offered',
    offer_details: {
      grade_offered: '',
      stream_offered: '',
      academic_year: new Date().getFullYear().toString(),
      fees_category: 'regular',
    },
    rejection_reason: '',
    waitlist_position: 1,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsRes, statsRes, statusesRes, pendingRes] = await Promise.all([
        getApplicationsList(filters),
        getAdmissionStatistics(),
        getAdmissionStatuses(),
        getPendingInterviews(),
      ]);

      if (appsRes.success) {
        setApplications(appsRes.data?.data || []);
        setPagination({
          page: appsRes.data?.pagination?.page || 1,
          total: appsRes.data?.pagination?.total || 0,
          totalPages: appsRes.data?.pagination?.totalPages || 0,
          limit: appsRes.data?.pagination?.limit || 100,
        });
      }
      if (statsRes.success) setStatistics(statsRes.data);
      if (statusesRes.success) setStatuses(statusesRes.data || []);
      if (pendingRes.success) setPendingInterviews(pendingRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.status]);

  const handleView = (application: any) => {
    // Navigate to application detail or open modal
    alert(`View Application: ${application.application_no}\n\nApplicant: ${application.applicantFirstName} ${application.applicantLastName}\nGrade: ${application.applying_for_grade}\nStatus: ${application.statusName || 'N/A'}`);
  };

  const handleEdit = (application: any) => {
    // Navigate to edit page
    window.location.href = `/admissions/applications/edit/${application.id}`;
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      await removeApplication(id);
      alert('Application deleted successfully');
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || 'Failed to delete application'));
    }
  };

  const getPendingInterviewForApplication = (applicationId: number) => {
    return pendingInterviews.find((interview: any) => interview.application_id === applicationId);
  };

  const hasPendingInterview = (applicationId: number) => {
    return pendingInterviews.some((interview: any) => interview.application_id === applicationId);
  };

  return (
    <div className="p-6">
      {/* Remove the duplicate header - it's already shown in dashboard */}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <StatCard
          title="Total Applications"
          value={statistics?.total || 0}
          color="blue"
          subtitle="All applications"
        />
        <StatCard
          title="Pending Review"
          value={statistics?.pending || 0}
          color="yellow"
          subtitle="Awaiting review"
        />
        <StatCard
          title="Interviews Scheduled"
          value={statistics?.interview_scheduled || 0}
          color="purple"
          subtitle="Interviews pending"
        />
        <StatCard
          title="Pending Interviews"
          value={pendingInterviews.length || 0}
          color="orange"
          subtitle="Needs scheduling"
        />
        <StatCard
          title="Offers Made"
          value={statistics?.offered || 0}
          color="green"
          subtitle="Awaiting response"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search by applicant name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">No applications found</td></tr>
            ) : (
              applications.map((app) => {
                const pendingInterview = getPendingInterviewForApplication(app.id);
                const hasInterview = hasPendingInterview(app.id);

                return (
                <tr key={app.id} className={`hover:bg-gray-50 ${hasInterview ? 'bg-orange-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{app.application_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {app.applicantFirstName} {app.applicantLastName}
                    </div>
                    {app.applicantEmail && (
                      <div className="text-sm text-gray-500">{app.applicantEmail}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.applicantPhone && (
                      <div className="text-sm text-gray-900">{app.applicantPhone}</div>
                    )}
                    {app.applicantEmail && (
                      <div className="text-sm text-gray-500">{app.applicantEmail}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.applying_for_grade}</div>
                    {app.applying_for_stream && (
                      <div className="text-sm text-gray-500">{app.applying_for_stream}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {pendingInterview ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          ⏳ Pending
                        </span>
                        {pendingInterview.interview_type && (
                          <div className="text-xs text-gray-500 capitalize">
                            {pendingInterview.interview_type?.replace('_', ' ')}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            window.location.href = `/admissions/interviews`;
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Schedule →
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={app.statusName} color={app.statusColor} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.submission_date ? new Date(app.submission_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleView(app)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(app)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setFilters({ ...filters, page: pageNum })}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsList;
