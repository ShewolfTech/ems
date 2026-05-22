import React, { useState, useEffect } from 'react';
import { getEnrollmentsList, confirmEnrollment, removeEnrollment, getEnrollmentStatistics } from '../controller.js';

export const EnrollmentsPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [statistics, setStatistics] = useState<any>(null);
  const [documentsList, setDocumentsList] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, statsRes] = await Promise.all([
        getEnrollmentsList({ limit: 100 }),
        getEnrollmentStatistics(),
      ]);

      if (enrollmentsRes.success) {
        // API returns { success: true, data: [...] }
        setEnrollments(enrollmentsRes.data || []);
      }

      if (statsRes.success) {
        setStatistics(statsRes.data);
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

  const handleConfirm = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setDocumentsList('');
    setShowConfirmModal(true);
  };

  const handleViewDetails = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setShowDetailModal(true);
  };

  const handleConfirmEnrollment = async () => {
    if (!selectedEnrollment) return;

    try {
      const documents = documentsList
        .split(',')
        .map((d: string) => d.trim())
        .filter((d: string) => d.length > 0);

      const result = await confirmEnrollment(selectedEnrollment.id, documents);

      if (result.success) {
        setEnrollmentResult(result.data);
        setShowSuccessModal(true);
        setShowConfirmModal(false);
        loadData();
      }
    } catch (error: any) {
      console.error('Error confirming enrollment:', error);
      alert('❌ Failed to confirm enrollment: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) return;

    try {
      await removeEnrollment(id);
      alert('✅ Enrollment deleted successfully!');
      loadData();
    } catch (error: any) {
      console.error('Error deleting enrollment:', error);
      alert('❌ Failed to delete enrollment: ' + error.message);
    }
  };

  const filteredEnrollments = enrollments.filter((e: any) => {
    const matchesStatus = filterStatus === 'all' || e.enrollment_status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      `${e.first_name} ${e.last_name} ${e.application_no}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Enrollments</h1>
          <p className="text-gray-600">Confirm offered applicants to create student and user accounts</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Total Offers</div>
            <div className="text-3xl font-bold text-blue-600">{Number(statistics.total) || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Awaiting Confirmation</div>
            <div className="text-3xl font-bold text-yellow-600">{Number(statistics.pending_confirmation) || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Confirmed Students</div>
            <div className="text-3xl font-bold text-green-600">{Number(statistics.completed) || 0}</div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name or application no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All</option>
                <option value="pending_confirmation">Pending Confirmation</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade Applied</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offer Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : filteredEnrollments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No pending offers. Offered applicants will appear here.
                </td>
              </tr>
            ) : (
              filteredEnrollments.map((enrollment: any) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-600 font-medium">{enrollment.application_no || '—'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {enrollment.first_name} {enrollment.last_name}
                    </div>
                    {enrollment.email && (
                      <div className="text-sm text-gray-500">{enrollment.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.applying_for_grade || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {enrollment.enrollment_status === 'completed' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Confirmed
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Awaiting Student
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewDetails(enrollment)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    {enrollment.enrollment_status !== 'completed' && (
                      <button
                        onClick={() => handleConfirm(enrollment)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(enrollment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Enrollment Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="font-medium">{selectedEnrollment.first_name} {selectedEnrollment.last_name}</div>
              <div className="text-sm text-gray-600">Application: {selectedEnrollment.application_no}</div>
              {selectedEnrollment.email && <div className="text-sm text-gray-600">Email: {selectedEnrollment.email}</div>}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Applied For</label>
                  <div className="text-sm text-gray-900">{selectedEnrollment.applying_for_grade || '—'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Date</label>
                  <div className="text-sm text-gray-900">
                    {selectedEnrollment.enrollment_date ? new Date(selectedEnrollment.enrollment_date).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <div className="text-sm text-gray-900">{selectedEnrollment.academic_year || '—'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="text-sm text-gray-900">{selectedEnrollment.enrollment_status}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fees Category</label>
                  <div className="text-sm text-gray-900">{selectedEnrollment.fees_category || '—'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Decision Type</label>
                  <div className="text-sm text-gray-900">{selectedEnrollment.decision_type || '—'}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {selectedEnrollment.enrollment_status !== 'completed' && (
                <button
                  onClick={() => { setShowDetailModal(false); handleConfirm(selectedEnrollment); }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  ✓ Confirm as Student
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Enrollment Modal */}
      {showConfirmModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Confirm Student Enrollment</h2>
              <button onClick={() => setShowConfirmModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>{selectedEnrollment.first_name} {selectedEnrollment.last_name}</strong>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Application: {selectedEnrollment.application_no} | Grade: {selectedEnrollment.applying_for_grade || 'N/A'}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                This will create a student record and user account. The student can then log in with the credentials provided.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documents Submitted (comma-separated, optional)
                </label>
                <textarea
                  value={documentsList}
                  onChange={(e) => setDocumentsList(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="e.g., Birth Certificate, Transfer Certificate, Report Card"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirmEnrollment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ✓ Confirm & Create Accounts
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Enrollment Confirmed */}
      {showSuccessModal && enrollmentResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <h2 className="text-xl font-bold text-white">Enrollment Confirmed</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Student</p>
                <p className="font-semibold text-gray-900">
                  {enrollmentResult.student?.first_name} {enrollmentResult.student?.last_name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Admission No: <span className="font-mono font-semibold text-blue-600">{enrollmentResult.student?.admission_no}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Grade: {enrollmentResult.enrollment?.applying_for_grade || enrollmentResult.student?.applying_for_grade || 'N/A'}
                </p>
              </div>

              {/* Login Credentials */}
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-800 mb-2">🔐 Login Credentials</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-yellow-700">Username</p>
                    <p className="font-mono text-sm bg-white px-3 py-1.5 rounded border border-yellow-200 select-all">
                      {enrollmentResult.user?.username || `user${enrollmentResult.student?.admission_no}`.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-yellow-700">Password</p>
                    <p className="font-mono text-sm bg-white px-3 py-1.5 rounded border border-yellow-200 select-all">
                      {enrollmentResult.user?.default_password || 'See admin'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-2 italic">⚠️ Please share these credentials securely with the student.</p>
              </div>

              {/* Next Steps */}
              <div className="text-sm text-gray-500 text-center">
                The student can now log in to the portal and access their dashboard.
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setEnrollmentResult(null);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentsPage;
