import React, { useState, useEffect } from 'react';
import { loadStudentsList, removeStudents } from '@/domains/studentsmgt/students/controller.js';
import { loadStudentStatistics } from '@/domains/studentsmgt/students/controller.js';

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

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    graduated: 'bg-blue-100 text-blue-800',
    transferred: 'bg-yellow-100 text-yellow-800',
    withdrawn: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    on_leave: 'bg-pink-100 text-pink-800',
  };

  return (
    <span className={statusClasses[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium'}>
      {status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
};

export const StudentsList: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    enrollmentStatus: '',
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, statsRes] = await Promise.all([
        loadStudentsList(filters),
        loadStudentStatistics(),
      ]);

      if (studentsRes.success) {
        setStudents(studentsRes.data?.data || []);
        setPagination({
          page: studentsRes.data?.pagination?.page || 1,
          total: studentsRes.data?.pagination?.total || 0,
          totalPages: studentsRes.data?.pagination?.totalPages || 0,
          limit: studentsRes.data?.pagination?.limit || 100,
        });
      }
      if (statsRes.success) setStatistics(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.enrollmentStatus]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await removeStudents(id);
      alert('Student deleted successfully');
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || 'Failed to delete student'));
    }
  };

  return (
    <div className="p-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Students"
          value={statistics?.total_students || 0}
          color="blue"
          subtitle="All students"
        />
        <StatCard
          title="Active"
          value={statistics?.active_students || 0}
          color="green"
          subtitle="Currently enrolled"
        />
        <StatCard
          title="Graduated"
          value={statistics?.graduated || 0}
          color="purple"
          subtitle="Completed studies"
        />
        <StatCard
          title="Male / Female"
          value={`${statistics?.male || 0} / ${statistics?.female || 0}`}
          color="teal"
          subtitle="Gender distribution"
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
              value={filters.enrollmentStatus}
              onChange={(e) => setFilters({ ...filters, enrollmentStatus: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="suspended">Suspended</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search by name or admission number..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No students found. Students are created through the admissions enrollment flow.</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{student.admission_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.first_name} {student.middle_name} {student.last_name}
                    </div>
                    {student.email && (
                      <div className="text-sm text-gray-500">{student.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.phone && (
                      <div className="text-sm text-gray-900">{student.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={student.enrollment_status || 'active'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => alert(`View Student: ${student.admission_no}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => window.location.href = `/studentsmgt/students/edit/${student.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
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

export default StudentsList;
