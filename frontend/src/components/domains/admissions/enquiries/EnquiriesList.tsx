import React, { useState, useEffect } from 'react';
import { 
  getEnquiriesList, 
  getEnquiriesStatistics, 
  removeEnquiry
} from '../../../../domains/admissions/enquiries/controller.js';
import type { Enquiry, EnquiryStatistics } from '../../../../domains/admissions/enquiries/types.js';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const StatCard = ({ title, value, color = 'blue' }: { title: string; value: number | string; color?: string }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} rounded-full p-3 mr-4`}>
          <div className="w-6 h-6 bg-white rounded-full opacity-20"></div>
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    waiting_response: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
  };
  
  const statusLabels: Record<string, string> = {
    new: 'New',
    in_progress: 'In Progress',
    waiting_response: 'Waiting Response',
    converted: 'Converted',
    closed: 'Closed',
    rejected: 'Rejected',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusLabels[status] || status}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityClasses: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses[priority] || 'bg-gray-100 text-gray-600'}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

interface EnquiriesListProps {
  onView?: (id: number) => void;
}

export const EnquiriesList: React.FC<EnquiriesListProps> = ({ onView }) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [statistics, setStatistics] = useState<EnquiryStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    page: 1,
    limit: 20,
  });

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const [enquiriesRes, statsRes] = await Promise.all([
        getEnquiriesList(filters),
        getEnquiriesStatistics(),
      ]);
      
      if (enquiriesRes.success) {
        setEnquiries(enquiriesRes.data.data || []);
      }
      if (statsRes.success) {
        setStatistics(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [filters.status, filters.priority, filters.page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    
    try {
      await removeEnquiry(id);
      loadEnquiries();
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      alert('Failed to delete enquiry');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Enquiries Management</h1>
        <p className="text-gray-600">Track and manage all incoming enquiries</p>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <StatCard title="Total" value={statistics.total || 0} color="blue" />
          <StatCard title="New" value={statistics.new_count || 0} color="blue" />
          <StatCard title="In Progress" value={statistics.in_progress_count || 0} color="yellow" />
          <StatCard title="Waiting" value={statistics.waiting_response_count || 0} color="purple" />
          <StatCard title="Converted" value={statistics.converted_count || 0} color="green" />
          <StatCard title="Closed" value={statistics.closed_count || 0} color="gray" />
        </div>
      )}

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by subject, name, email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_response">Waiting Response</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No enquiries found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enquirer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {enquiry.reference_no || `ENQ-${enquiry.id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{enquiry.subject}</div>
                      <div className="text-gray-500 text-xs">{enquiry.enquiry_source_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{enquiry.enquirer_name}</div>
                      <div className="text-gray-500 text-xs">{enquiry.enquirer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enquiry.enquiry_type_name && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${enquiry.enquiry_type_color}20`, color: enquiry.enquiry_type_color }}>
                          {enquiry.enquiry_type_name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={enquiry.status || 'new'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={enquiry.priority || 'medium'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enquiry.assigned_to_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(enquiry.enquiry_date || '').toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => onView && onView(enquiry.id!)}
                      >
                        View
                      </button>
                      {enquiry.status !== 'closed' && enquiry.status !== 'rejected' && (
                        <button 
                          className="text-green-600 hover:text-green-900 mr-3"
                          onClick={() => {
                            if (confirm('Mark this enquiry as closed?')) {
                              // Will implement close action
                              alert('Close functionality - to be implemented with resolution notes');
                            }
                          }}
                        >
                          ✔️ Close
                        </button>
                      )}
                      <button 
                        className="text-red-600 hover:text-red-900" 
                        onClick={() => handleDelete(enquiry.id!)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EnquiriesList;
