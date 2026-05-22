import React, { useState, useEffect } from 'react';
import { getApplicationsList } from '@/domains/admissions/applications/controller.js';
import { getExamsByApplication } from '@/domains/admissions/exams/controller.js';
import { getInterviewsList } from '@/domains/admissions/interviews/controller.js';
import { makeDecision } from '@/domains/admissions/decisions/controller.js';

export const DecisionsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [showExamsModal, setShowExamsModal] = useState(false);
  const [viewingExamsFor, setViewingExamsFor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
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
      const [appsRes, interviewsRes] = await Promise.all([
        getApplicationsList({ limit: 100 }),
        getInterviewsList({ limit: 100 }),
      ]);

      if (appsRes.success) {
        const applicationsList = appsRes.data?.data || [];
        const interviewsList = interviewsRes.success ? (interviewsRes.data || []) : [];

        // Merge interviews with applications
        const applicationsWithInterviews = applicationsList.map((app: any) => {
          const interview = interviewsList.find((i: any) => i.application_id === app.id);
          return {
            ...app,
            interview: interview ? {
              id: interview.id,
              scheduled_date: interview.scheduled_date,
              is_completed: interview.is_completed,
              interview_outcome: interview.interview_outcome,
              location: interview.location,
            } : null,
            // Check if decision has been made (from application_decisions table)
            decision_made: !!app.decision_type || !!app.decision_date,
            decision_type: app.decision_type || null,
          };
        });

        // Show all applications (including those with decisions)
        setApplications(applicationsWithInterviews);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter applications
  const filteredApplications = applications.filter((app: any) => {
    const matchesSearch = !searchTerm ||
      app.application_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${app.applicantFirstName} ${app.applicantLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter ||
      (statusFilter === 'pending' && !app.decision_made) ||
      (statusFilter === 'offered' && app.decision_type === 'offered') ||
      (statusFilter === 'rejected' && app.decision_type === 'rejected') ||
      (statusFilter === 'waitlisted' && app.decision_type === 'waitlisted');

    const matchesGrade = !gradeFilter || app.applying_for_grade === gradeFilter;

    return matchesSearch && matchesStatus && matchesGrade;
  });

  // Get unique grades for filter
  const uniqueGrades = [...new Set(applications.map((a: any) => a.applying_for_grade).filter(Boolean))];

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a: any) => !a.decision_made).length,
    offered: applications.filter((a: any) => a.decision_type === 'offered').length,
    rejected: applications.filter((a: any) => a.decision_type === 'rejected').length,
    waitlisted: applications.filter((a: any) => a.decision_type === 'waitlisted').length,
  };

  const handleViewExams = async (app: any) => {
    try {
      const examsRes = await getExamsByApplication(app.id);
      if (examsRes.success) {
        setExamResults(examsRes.data || []);
        setViewingExamsFor(app);
        setShowExamsModal(true);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const handleMakeDecision = async (app: any) => {
    setSelectedApplication(app);
    
    // Load exam results
    try {
      const examsRes = await getExamsByApplication(app.id);
      if (examsRes.success) setExamResults(examsRes.data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
    }

    setDecisionData({
      decision_type: 'offered',
      offer_details: {
        grade_offered: app.applying_for_grade,
        stream_offered: app.applying_for_stream || '',
        academic_year: app.academic_year,
        fees_category: 'regular',
      },
      rejection_reason: '',
      waitlist_position: 1,
    });
    setShowModal(true);
  };

  const handleSaveDecision = async () => {
    if (!selectedApplication) return;

    try {
      await makeDecision({
        application_id: selectedApplication.id,
        ...decisionData,
      });
      alert('✅ Decision recorded successfully!');
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to record decision'));
    }
  };

  const handleCancelDecision = async (app: any) => {
    if (!window.confirm(`Are you sure you want to cancel the decision for ${app.first_name} ${app.last_name}? This will reset the application to pending status.`)) return;

    try {
      // TODO: Add API call to cancel decision and reset application status
      alert('Decision cancelled. (API endpoint needed)');
      loadData();
    } catch (error: any) {
      alert('❌ Error: ' + (error.message || 'Failed to cancel decision'));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admission Decisions</h1>
        <p className="text-gray-600">Review applications and make admission decisions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Total Applications</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Pending Decision</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Offered</div>
          <div className="text-3xl font-bold text-green-600">{stats.offered}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Rejected</div>
          <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Waitlisted</div>
          <div className="text-3xl font-bold text-purple-600">{stats.waitlisted}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Application no, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="offered">Offered</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="">All Grades</option>
              {uniqueGrades.map((grade: string) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter(''); setGradeFilter(''); }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade Applied</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exams</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : filteredApplications.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No applications found matching your filters</td></tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{app.application_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {app.applicantFirstName} {app.applicantLastName}
                    </div>
                    <div className="text-sm text-gray-500">{app.applicantEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.applying_for_grade}</div>
                    {app.applying_for_stream && (
                      <div className="text-sm text-gray-500">{app.applying_for_stream}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.interview ? (
                      <div>
                        <div className="text-xs font-medium text-gray-900">
                          {app.interview.is_completed ? (
                            <span className="text-green-600">✓ Completed</span>
                          ) : (
                            <span className="text-purple-600">📅 Scheduled</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(app.interview.scheduled_date).toLocaleDateString()}
                        </div>
                        {app.interview.location && (
                          <div className="text-xs text-gray-500">
                            📍 {app.interview.location}
                          </div>
                        )}
                        {app.interview.is_completed && app.interview.interview_outcome && (
                          <div className={`text-xs mt-1 px-2 py-1 rounded inline-block ${
                            app.interview.interview_outcome === 'passed' ? 'bg-green-100 text-green-800' :
                            app.interview.interview_outcome === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.interview.interview_outcome.toUpperCase()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Not scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewExams(app)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      View Exams
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {app.decision_made ? (
                      <>
                        <button
                          onClick={() => handleMakeDecision(app)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCancelDecision(app)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleMakeDecision(app)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Make Decision
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.decision_made ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.decision_type === 'offered' ? 'bg-green-100 text-green-800' :
                        app.decision_type === 'rejected' ? 'bg-red-100 text-red-800' :
                        app.decision_type === 'waitlisted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.decision_type?.charAt(0).toUpperCase() + app.decision_type?.slice(1)}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Decision Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Make Admission Decision</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {/* Application Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="font-medium">{selectedApplication.applicantFirstName} {selectedApplication.applicantLastName}</div>
              <div className="text-sm text-gray-600">{selectedApplication.application_no}</div>
              <div className="text-sm text-gray-600">Applying for: {selectedApplication.applying_for_grade}</div>
            </div>

            {/* Exam Results */}
            {examResults.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Exam Results</h3>
                <div className="space-y-2">
                  {examResults.map((exam: any) => (
                    <div key={exam.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{exam.exam_name}</div>
                        <div className="text-sm text-gray-500">{exam.exam_date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{exam.marks_obtained}/{exam.total_marks} ({exam.percentage}%)</div>
                        <div className="text-sm font-bold text-green-600">Grade {exam.grade}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Form */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={decisionData.offer_details.stream_offered}
                      onChange={(e) => setDecisionData({ ...decisionData, offer_details: { ...decisionData.offer_details, stream_offered: e.target.value } })}
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
                onClick={handleSaveDecision}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Record Decision
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Exams Modal */}
      {showExamsModal && viewingExamsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Exam Results</h2>
                <p className="text-sm text-gray-500">{viewingExamsFor.applicantFirstName} {viewingExamsFor.applicantLastName} • {viewingExamsFor.application_no}</p>
              </div>
              <button onClick={() => setShowExamsModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            {examResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No exam results recorded</p>
                <p className="text-sm mt-2">Exam results will appear here once recorded.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {examResults
                      .filter((exam: any) => exam.exam_name || exam.session_name)
                      .map((exam: any) => (
                        <tr key={exam.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{exam.exam_name || exam.session_name}</div>
                            {exam.exam_venue && <div className="text-xs text-gray-500">📍 {exam.exam_venue}</div>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium">{exam.marks_obtained}/{exam.total_marks}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm">{Number(exam.percentage || 0).toFixed(1)}%</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              exam.grade === 'A' ? 'bg-green-100 text-green-800' :
                              exam.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                              exam.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              exam.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {exam.grade || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowExamsModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionsPage;
