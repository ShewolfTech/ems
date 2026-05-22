import React, { useState, useMemo } from "react";
import { ChevronRight, Loader2, Database, Mail, Phone, Eye, Edit2, Trash2, Calendar, MapPin, Building } from "lucide-react";
import type { Staff, StaffStatistics } from "../../types.js";

interface StaffListProps {
  data?: Staff[];
  loading?: boolean;
  statistics?: StaffStatistics | null;
  onSelect: (item: Staff) => void;
  onEdit: (item: Staff) => void;
  onDelete: (id: string | number) => void;
  onView: (item: Staff) => void;
  pageSize?: number;
}

const PAGE_SIZE = 15;

// Utility components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-teal-100 ${className}`}>{children}</div>
);

const StatCard = ({ title, value, icon: Icon, color = "teal", subtitle }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color?: string;
  subtitle?: string;
}) => {
  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    teal: { bg: "bg-teal-50", icon: "text-teal-600", border: "border-teal-200" },
    cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", border: "border-cyan-200" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
    green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-200" },
    orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200" },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-200" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200" },
  };
  
  const colors = colorClasses[color] || colorClasses.teal;
  
  return (
    <Card className={`p-6 hover:shadow-md transition-all border-l-4 ${colors.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-800">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
    inactive: { bg: "bg-slate-100", text: "text-slate-600", label: "Inactive" },
    suspended: { bg: "bg-red-100", text: "text-red-800", label: "Suspended" },
    terminated: { bg: "bg-gray-100", text: "text-gray-800", label: "Terminated" },
    on_leave: { bg: "bg-orange-100", text: "text-orange-800", label: "On Leave" },
  };
  
  const config = statusConfig[status] || statusConfig.inactive;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
      <span className="w-2 h-2 rounded-full bg-current mr-2" />
      {config.label}
    </span>
  );
};

const EmploymentTypeBadge = ({ type }: { type: string }) => {
  const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
    full_time: { bg: "bg-teal-100", text: "text-teal-800", label: "Full Time" },
    part_time: { bg: "bg-blue-100", text: "text-blue-800", label: "Part Time" },
    contract: { bg: "bg-purple-100", text: "text-purple-800", label: "Contract" },
    temporary: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Temporary" },
    intern: { bg: "bg-cyan-100", text: "text-cyan-800", label: "Intern" },
    consultant: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Consultant" },
  };
  
  const config = typeConfig[type] || typeConfig.full_time;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export function StaffList({ data, loading, statistics, onSelect, onEdit, onDelete, onView, pageSize = PAGE_SIZE }: StaffListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    if (!data) return [];
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil((data?.length || 0) / pageSize);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatName = (staff: Staff) => {
    const title = staff.title ? `${staff.title.toUpperCase()}. ` : "";
    const firstName = staff.first_name || "";
    const lastName = staff.last_name || "";
    return `${title}${firstName} ${lastName}`.trim() || "N/A";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateYearsOfService = (hireDate?: string) => {
    if (!hireDate) return "—";
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    if (months < 0) return years - 1;
    return years;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 bg-white border border-teal-200 rounded-xl">
      <Loader2 className="w-12 h-12 animate-spin mb-4 text-teal-600" />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Loading staff records...</p>
    </div>
  );

  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/50 text-slate-400">
      <Database className="w-16 h-16 mb-4 opacity-20 text-teal-400" />
      <p className="font-bold text-lg text-slate-600">No staff records found</p>
      <p className="text-sm text-slate-500 mt-2">Add your first staff member to get started</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Staff"
            value={statistics.total_staff}
            icon={Database}
            color="teal"
            subtitle="All time"
          />
          <StatCard
            title="Active Staff"
            value={statistics.active_staff}
            icon={Eye}
            color="green"
            subtitle={`${((statistics.active_staff / statistics.total_staff * 100) || 0).toFixed(1)}% of total`}
          />
          <StatCard
            title="On Leave"
            value={statistics.on_leave}
            icon={Calendar}
            color="orange"
            subtitle="Currently away"
          />
          <StatCard
            title="New This Month"
            value={statistics.new_this_month}
            icon={Building}
            color="blue"
            subtitle="Recent hires"
          />
        </div>
      )}

      {/* Staff Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b-2 border-teal-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Hire Date</th>
                <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((staff: Staff) => (
                <tr 
                  key={staff.id} 
                  className="hover:bg-teal-50/50 transition-all cursor-pointer group"
                  onClick={() => onSelect(staff)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(staff.first_name?.[0] || staff.last_name?.[0] || "S").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{formatName(staff)}</p>
                        {staff.employee_no && (
                          <p className="text-xs text-slate-500">#{staff.employee_no}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {staff.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Mail className="w-3 h-3 text-teal-500" />
                          <span className="truncate max-w-[180px]">{staff.email}</span>
                        </div>
                      )}
                      {staff.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="w-3 h-3 text-teal-500" />
                          {staff.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-teal-500" />
                      <span className="text-sm font-semibold text-slate-700">
                        {staff.department_name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-700">
                      {staff.role_name || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={staff.employment_status || (staff.is_active ? "active" : "inactive")} />
                  </td>
                  <td className="px-6 py-4">
                    <EmploymentTypeBadge type={staff.employment_type || "full_time"} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar className="w-4 h-4 text-teal-500" />
                      {formatDate(staff.hire_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">
                      {calculateYearsOfService(staff.hire_date)} {typeof calculateYearsOfService(staff.hire_date) === 'number' && calculateYearsOfService(staff.hire_date) === 1 ? 'yr' : 'yrs'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => { e.stopPropagation(); onView(staff); }}
                        className="p-2 hover:bg-teal-100 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-teal-600" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(staff); }}
                        className="p-2 hover:bg-cyan-100 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-cyan-600" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(staff.id); }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-teal-100 bg-gradient-to-r from-teal-50/50 to-cyan-50/50">
            <div className="text-sm text-slate-600 font-semibold">
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, data.length)} of {data.length} records
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => goToPage(1)} 
                disabled={currentPage === 1} 
                className="p-2 hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-teal-200"
              >
                <ChevronRight className="w-4 h-4 rotate-180 text-teal-600" />
              </button>
              <button 
                onClick={() => goToPage(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="p-2 hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-teal-200"
              >
                ←
              </button>
              <span className="px-4 py-2 bg-white rounded-lg border border-teal-200 text-sm font-bold text-teal-700">
                {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => goToPage(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="p-2 hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-teal-200"
              >
                →
              </button>
              <button 
                onClick={() => goToPage(totalPages)} 
                disabled={currentPage === totalPages} 
                className="p-2 hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-teal-200"
              >
                <ChevronRight className="w-4 h-4 text-teal-600" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default StaffList;
