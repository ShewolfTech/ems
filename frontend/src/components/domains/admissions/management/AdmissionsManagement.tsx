import React, { useState, useEffect } from 'react';
import { getApplicationsList } from '@/domains/admissions/applications/controller.js';
import { getInterviewsList, completeInterview } from '@/components/domains/admissions/interviews/controller.js';
import { makeDecision, createEnrollment, getPipelineStats } from '@/domains/admissions/decisions/controller.js';

interface Application {
  id: number;
  application_no: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
  applicantPhone: string;
  applying_for_grade: string;
  applying_for_stream: string;
  statusName: string;
  statusColor: string;
  has_interview: boolean;
  interview_completed: boolean;
  decision_made: boolean;
  [key: string]: any; // Allow additional properties
}

export const AdmissionsManagement: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'decisions' | 'enrollments'>('pipeline');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
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
  const [enrollmentData, setEnrollmentData] = useState({
    grade_id: '',
    stream_id: '',
    academic_year: new Date().getFullYear().toString(),
    fees_category: 'regular',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsRes, interviewsRes, statsRes] = await Promise.all([
        getApplicationsList({ limit: 100 }),
        getInterviewsList({ limit: 100 }),
        getPipelineStats(),
      ]);

      if (appsRes.success) setApplications(appsRes.data?.data || []);
      if (interviewsRes.success) setInterviews(interviewsRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMakeDecision = async () => {
    if (!selectedApplication) return;

    try {
      await makeDecision({
        application_id: selectedApplication.id,
        ...decisionData,
      });
      alert('✅ Decision recorded successfully!');
      setShowDecisionModal(false);
      loadData();
    } catch (error: any) {
      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to record decision'));
    }
  };

  const handleCreateEnrollment = async () => {
    if (!selectedApplication) return;

    try {
      await createEnrollment({
        application_id: selectedApplication.id,
        ...enrollmentData,
      });
      alert('✅ Enrollment created! Student record will be generated.');
      setShowEnrollmentModal(false);
      loadData();
    } catch (error: any) {
      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to create enrollment'));
    }
  };

  const openDecisionModal = (app: Application) => {
    setSelectedApplication(app);
    setDecisionData({
      decision_type: 'offered',
      offer_details: {
        grade_offered: app.applying_for_grade,
        stream_offered: app.applying_for_stream || '',
        academic_year: app.academic_year || new Date().getFullYear().toString(),
        fees_category: 'regular',
      },
      rejection_reason: '',
      waitlist_position: 1,
    });
    setShowDecisionModal(true);
  };

  const openEnrollmentModal = (app: Application) => {
    setSelectedApplication(app);
    setEnrollmentData({
      grade_id: '',
      stream_id: '',
      academic_year: new Date().getFullYear().toString(),
      fees_category: 'regular',
    });
    setShowEnrollmentModal(true);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admissions Management</h1>
        <p className="text-gray-600">Complete admissions pipeline from application to enrollment</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Total Applications</div>
          <div className="text-3xl font-bold text-blue-600">{stats?.total || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Pending Review</div>
          <div className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Interviews</div>
          <div className="text-3xl font-bold text-purple-600">{stats?.interview_scheduled || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Offers Made</div>
          <div className="text-3xl font-bold text-green-600">{stats?.offered || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Enrolled</div>
          <div className="text-3xl font-bold text-emerald-600">{stats?.enrolled || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pipeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Pipeline
            </button>
            <button
              onClick={() => setActiveTab('decisions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'decisions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ✅ Decisions
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrollments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎓 Enrollments
            </button>
          </nav>
        </div>
      </div>

      {/* Pipeline View */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['APPLIED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'OFFERED'].map((statusCode) => {
            const statusApps = applications.filter(app => app.statusName?.toUpperCase() === statusCode);
            return (
              <div key={statusCode} className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">{statusCode.replace(/_/g, ' ')}</h3>
                  <span className="bg-white px-2 py-1 rounded text-sm font-medium">{statusApps.length}</span>
                </div>
                <div className="space-y-2">
                  {statusApps.map(app => (
                    <div key={app.id} className="bg-white p-3 rounded shadow-sm">
                      <div className="font-medium text-sm">{app.applicantFirstName} {app.applicantLastName}</div>
                      <div className="text-xs text-gray-500">{app.application_no}</div>
                      <div className="text-xs text-gray-500 mt-1">{app.applying_for_grade}</div>
                      <button
                        onClick={() => openDecisionModal(app)}
                        className="mt-2 w-full text-xs bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                      >
                        Make Decision
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decisions View */}
      {activeTab === 'decisions' && (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.filter(app => !app.decision_made).map(app => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{app.application_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.applicantFirstName} {app.applicantLastName}</div>
                    <div className="text-sm text-gray-500">{app.applicantEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.has_interview ? (
                      <span className={`text-xs px-2 py-1 rounded ${app.interview_completed ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                        {app.interview_completed ? 'Completed' : 'Scheduled'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Not scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.statusName)}`}>
                      {app.statusName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openDecisionModal(app)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Make Decision
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enrollments View */}
      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Decision</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.filter(app => app.statusName?.toUpperCase() === 'OFFERED').map(app => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{app.application_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.applicantFirstName} {app.applicantLastName}</div>
                    <div className="text-sm text-gray-500">{app.applying_for_grade}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Offered
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEnrollmentModal(app)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Create Enrollment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Make Admission Decision</h2>
            {selectedApplication && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="font-medium">{selectedApplication.applicantFirstName} {selectedApplication.applicantLastName}</div>
                <div className="text-sm text-gray-600">{selectedApplication.application_no}</div>
                <div className="text-sm text-gray-600">{selectedApplication.applying_for_grade}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={decisionData.decision_type}
                  onChange={(e) => setDecisionData({ ...decisionData, decision_type: e.target.value })}
                >
                  <option value="offered">Offered</option>
                  <option value="waitlisted">Waitlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {decisionData.decision_type === 'offered' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade Offered</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={decisionData.offer_details.grade_offered}
                      onChange={(e) => setDecisionData({ ...decisionData, offer_details: { ...decisionData.offer_details, grade_offered: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fees Category</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={decisionData.offer_details.fees_category}
                      onChange={(e) => setDecisionData({ ...decisionData, offer_details: { ...decisionData.offer_details, fees_category: e.target.value } })}
                    >
                      <option value="regular">Regular</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="sponsored">Sponsored</option>
                    </select>
                  </div>
                </>
              )}

              {decisionData.decision_type === 'waitlisted' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waitlist Position</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={decisionData.waitlist_position}
                    onChange={(e) => setDecisionData({ ...decisionData, waitlist_position: parseInt(e.target.value) })}
                  />
                </div>
              )}

              {decisionData.decision_type === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={decisionData.rejection_reason}
                    onChange={(e) => setDecisionData({ ...decisionData, rejection_reason: e.target.value })}
                    placeholder="Reason for rejection..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleMakeDecision}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Record Decision
              </button>
              <button
                onClick={() => setShowDecisionModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create Enrollment</h2>
            {selectedApplication && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="font-medium">{selectedApplication.applicantFirstName} {selectedApplication.applicantLastName}</div>
                <div className="text-sm text-gray-600">{selectedApplication.application_no}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={enrollmentData.academic_year}
                  onChange={(e) => setEnrollmentData({ ...enrollmentData, academic_year: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fees Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={enrollmentData.fees_category}
                  onChange={(e) => setEnrollmentData({ ...enrollmentData, fees_category: e.target.value })}
                >
                  <option value="regular">Regular</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="sponsored">Sponsored</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateEnrollment}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Enrollment
              </button>
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionsManagement;
