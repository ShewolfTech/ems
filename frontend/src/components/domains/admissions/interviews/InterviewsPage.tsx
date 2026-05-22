import React, { useState, useEffect } from 'react';
import { getInterviewsList, saveInterview, completeInterview, removeInterview, getPendingInterviews } from './controller.js';

interface Interview {
  id?: number;
  application_id?: number;
  interview_type: string;
  scheduled_date: string;
  scheduled_end_time?: string;
  location?: string;
  interviewer_ids?: number[];
  interview_notes?: string;
  interview_score?: number;
  interview_outcome?: string;
  outcome_notes?: string;
  is_completed?: boolean;
}

export const InterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
  });

  // Search state for application combobox
  const [searchApplicant, setSearchApplicant] = useState('');
  const [showApplicantDropdown, setShowApplicantDropdown] = useState(false);

  const [formData, setFormData] = useState<Interview>({
    application_id: undefined,
    interview_type: 'general',
    scheduled_date: '',
    scheduled_end_time: '',
    location: '',
    interviewer_ids: [],
    interview_notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading interviews, pending applications and staff...');

      const [interviewsRes, pendingRes, staffRes] = await Promise.all([
        getInterviewsList(filters),
        getPendingInterviews(),
        (await import('@/domains/profiles/staff/controller.js')).getStaffList({ active_only: true }),
      ]);

      console.log('📥 Interviews response:', interviewsRes);
      console.log('📥 Pending interviews response:', pendingRes);
      console.log('📥 Staff response:', staffRes);

      if (interviewsRes.success) setInterviews(interviewsRes.data || []);

      // Build list of applications that already have pending interviews (to exclude them)
      const interviewApplicationIds = new Set(
        (interviewsRes.success ? interviewsRes.data || [] : [])
          .filter((i: any) => !i.is_completed)
          .map((i: any) => i.application_id)
      );

      // Filter pending interviews to only those not already scheduled
      const unscheduledApplications = (pendingRes.success ? pendingRes.data || [] : [])
        .filter((pending: any) => !interviewApplicationIds.has(pending.application_id));

      if (pendingRes.success) {
        setPendingApplications(unscheduledApplications);
      }
      if (staffRes.success) {
        setStaffList(staffRes.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate interview
    const existingInterview = interviews.find(
      (i) => i.application_id === formData.application_id && !i.is_completed
    );
    
    if (existingInterview && !selectedInterview) {
      alert('⚠️ An interview is already scheduled for this application!\n\nPlease complete or cancel the existing interview first.');
      return;
    }
    
    console.log('📤 Form data before submit:', formData);
    
    // Validate scheduled_date
    if (!formData.scheduled_date) {
      alert('⚠️ Please select a scheduled date and time');
      return;
    }
    
    // Convert to ISO format
    const scheduledDateTime = new Date(formData.scheduled_date).toISOString();
    
    console.log('📤 Sending interview data:', {
      ...formData,
      scheduled_date: scheduledDateTime,
    });

    try {
      await saveInterview({
        ...formData,
        id: selectedInterview?.id,  // Include ID when editing
        scheduled_date: scheduledDateTime,
      });
      alert('✅ Interview scheduled successfully!');
      setShowForm(false);
      setSelectedInterview(null);
      setFormData({
        application_id: undefined,
        interview_type: 'general',
        scheduled_date: '',
        scheduled_end_time: '',
        location: '',
        interviewer_ids: [],
        interview_notes: '',
      });
      loadData();
    } catch (error: any) {
      console.error('❌ Error scheduling interview:', error);
      console.error('❌ Error response:', error?.response?.data);
      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to schedule interview'));
    }
  };

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingInterview, setCompletingInterview] = useState<any>(null);
  const [completeData, setCompleteData] = useState({
    outcome: 'passed',
    score: 75,
    notes: '',
  });

  const handleCompleteClick = (interview: any) => {
    setCompletingInterview(interview);
    setCompleteData({ outcome: 'passed', score: 75, notes: '' });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async () => {
    if (!completingInterview) return;

    try {
      await completeInterview(completingInterview.id, {
        outcome: completeData.outcome,
        score: completeData.score,
        notes: completeData.notes,
        outcome_notes: '',
      });
      alert('✅ Interview completed!');
      setShowCompleteModal(false);
      setCompletingInterview(null);
      loadData();
    } catch (error: any) {
      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to complete interview'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return;
    try {
      await removeInterview(id);
      alert('Interview cancelled');
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || 'Failed to cancel interview'));
    }
  };

  const getStatusBadge = (interview: any) => {
    if (interview.is_completed) {
      const outcomeColors: any = {
        passed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${outcomeColors[interview.interview_outcome] || 'bg-gray-100 text-gray-800'}`}>
          {interview.interview_outcome?.toUpperCase() || 'COMPLETED'}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        SCHEDULED
      </span>
    );
  };

  // Filter pending applications based on search
  const filteredPendingApplications = pendingApplications.filter((app: any) => {
    if (!searchApplicant) return true;
    const search = searchApplicant.toLowerCase();
    const applicantName = `${app.first_name} ${app.last_name}`.toLowerCase();
    return (
      applicantName.includes(search) ||
      app.application_no?.toLowerCase().includes(search) ||
      app.applicant_email?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Interviews</h1>
          <p className="text-gray-600">Schedule and track admission interviews</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setSelectedInterview(null);
            setFormData({
              application_id: undefined,
              interview_type: 'general',
              scheduled_date: '',
              scheduled_end_time: '',
              location: '',
              interviewer_ids: [],
              interview_notes: '',
            });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Schedule Interview
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Interviews List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : interviews.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No interviews scheduled</td></tr>
            ) : (
              interviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {interview.first_name} {interview.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{interview.application_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{interview.interview_type?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(interview.scheduled_date).toLocaleDateString()}
                    </div>
                    {interview.scheduled_end_time && (
                      <div className="text-sm text-gray-500">
                        {new Date(interview.scheduled_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {interview.location || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(interview)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {!interview.is_completed && (
                      <button
                        onClick={() => handleCompleteClick(interview)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedInterview(interview);
                        // Populate form with existing interview data
                        setFormData({
                          application_id: interview.application_id,
                          interview_type: interview.interview_type || 'general',
                          scheduled_date: interview.scheduled_date ? interview.scheduled_date.split('T')[0] : '',
                          scheduled_end_time: interview.scheduled_end_time || '',
                          location: interview.location || '',
                          interviewer_ids: interview.interviewer_ids || [],
                          interview_notes: interview.interview_notes || '',
                        });
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(interview.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule/Edit Interview Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedInterview ? 'Edit Interview' : 'Schedule New Interview'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application / Applicant *
                </label>

                {selectedInterview ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                    {(() => {
                      const app = pendingApplications.find((a: any) => a.application_id === formData.application_id);
                      return app ? `${app.first_name} ${app.last_name} - ${app.application_no}` : 'Unknown';
                    })()}
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search applicant name, application number, or email..."
                      value={(() => {
                        if (formData.application_id) {
                          const app = pendingApplications.find((a: any) => a.application_id === formData.application_id);
                          return app ? `${app.first_name} ${app.last_name} - ${app.application_no}` : '';
                        }
                        return searchApplicant;
                      })()}
                      onChange={(e) => {
                        setSearchApplicant(e.target.value);
                        setShowApplicantDropdown(true);
                        // Clear selection if user starts typing
                        if (e.target.value && formData.application_id) {
                          setFormData({ ...formData, application_id: undefined });
                        }
                      }}
                      onFocus={() => setShowApplicantDropdown(true)}
                    />
                    {formData.application_id && (
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-sm"
                        onClick={() => {
                          setFormData({ ...formData, application_id: undefined });
                          setSearchApplicant('');
                        }}
                      >
                        ✕
                      </button>
                    )}

                    {/* Dropdown */}
                    {showApplicantDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredPendingApplications.length > 0 ? (
                          filteredPendingApplications.map((app: any) => (
                            <div
                              key={app.application_id}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setFormData({ ...formData, application_id: app.application_id });
                                setSearchApplicant(`${app.first_name} ${app.last_name} - ${app.application_no}`);
                                setShowApplicantDropdown(false);
                              }}
                            >
                              <div className="font-medium text-sm text-gray-900">
                                {app.first_name} {app.last_name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <span className="font-mono">{app.application_no}</span>
                                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                                  {app.interview_type?.replace('_', ' ')}
                                </span>
                              </div>
                              {app.applicant_email && (
                                <div className="text-xs text-gray-400">{app.applicant_email}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            {pendingApplications.length === 0
                              ? '🎉 No applications pending interview'
                              : 'No matching applications found'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Click outside to close */}
                    {showApplicantDropdown && (
                      <div
                        className="fixed inset-0 z-0"
                        onClick={() => setShowApplicantDropdown(false)}
                      />
                    )}
                  </div>
                )}

                {pendingApplications.length === 0 && !selectedInterview && (
                  <p className="text-xs text-green-600 mt-2">
                    ✅ All applications with interview requirements have interviews scheduled!
                  </p>
                )}

                {selectedInterview && (
                  <p className="text-xs text-gray-500 mt-1">
                    ℹ️ Application cannot be changed when editing an existing interview
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Type *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.interview_type}
                    onChange={(e) => setFormData({ ...formData, interview_type: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="entrance_exam">Entrance Exam</option>
                    <option value="student_interview">Student Interview</option>
                    <option value="parent_interview">Parent Interview</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Room 101, Main Campus"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interviewers (Who will conduct the interview?) *
                </label>
                <select
                  multiple
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  value={(formData.interviewer_ids || []).map(String)}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    interviewer_ids: Array.from(e.target.selectedOptions, option => parseInt(option.value))
                  })}
                >
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.first_name} {staff.last_name} {staff.email ? `(${staff.email})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  💡 Hold Ctrl/Cmd to select multiple interviewers
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.scheduled_end_time || ''}
                    onChange={(e) => setFormData({ ...formData, scheduled_end_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.interview_notes}
                  onChange={(e) => setFormData({ ...formData, interview_notes: e.target.value })}
                  placeholder="Notes about the interview preparation..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedInterview ? 'Update' : 'Schedule'} Interview
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Interview Modal */}
      {showCompleteModal && completingInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Complete Interview</h2>
              <button onClick={() => setShowCompleteModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium">{completingInterview.first_name} {completingInterview.last_name}</p>
              <p className="text-xs text-gray-500">{completingInterview.application_no} • {completingInterview.interview_type?.replace(/_/g, ' ')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={completeData.outcome}
                  onChange={(e) => setCompleteData({ ...completeData, outcome: e.target.value })}
                >
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={completeData.score}
                  onChange={(e) => setCompleteData({ ...completeData, score: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={completeData.notes}
                  onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
                  placeholder="Interview notes, observations, recommendations..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCompleteSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Complete Interview
              </button>
              <button
                onClick={() => setShowCompleteModal(false)}
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

export default InterviewsPage;
