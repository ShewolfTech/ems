import React, { useState, useMemo, useEffect } from "react";
import { useAttendance, useTodaySummary, useAttendanceStats } from "@/domains/staffmgt/staff_attendance/hooks/useAttendance.js";
import { useDepartments } from "@/domains/staffmgt/staff/hooks/useStaff.js";
import { StatusConfig } from "@/domains/staffmgt/staff_attendance/types.js";
import { Button } from "@/components/domains/aacommon/index.js";
import {
  Clock, Calendar, TrendingUp, Users, AlertTriangle, CheckCircle, 
  XCircle, Timer, BarChart3, Filter, RotateCw, MapPin, Download
} from "lucide-react";

// Utility components
const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => {
  const colorClasses: any = {
    teal: { bg: "bg-teal-50", icon: "text-teal-600", border: "border-teal-200", text: "text-teal-700" },
    green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-200", text: "text-green-700" },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-200", text: "text-red-700" },
    orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200", text: "text-orange-700" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200", text: "text-blue-700" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200", text: "text-purple-700" },
  };
  const colors = colorClasses[color] || colorClasses.teal;
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${colors.border} p-6 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-800">{value}</p>
          {subtitle && <p className={`text-xs font-semibold ${colors.text} mt-1`}>{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-bold text-green-600">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = StatusConfig[status as keyof typeof StatusConfig] || StatusConfig.absent;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.color}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

const ProgressBar = ({ percentage, color = "teal" }: { percentage: number; color?: string }) => {
  const colorClasses: any = {
    teal: "bg-teal-500",
    green: "bg-green-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    blue: "bg-blue-500",
  };
  const barColor = colorClasses[color] || colorClasses.teal;
  
  return (
    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full ${barColor} transition-all duration-500 ease-out`} 
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
};

export function StaffAttendancePage() {
  const [filters, setFilters] = useState<any>({
    date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    department_id: undefined,
    status: undefined,
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Data fetching
  const { records, loading, refresh } = useAttendance({ autoFetch: true, filters });
  const { summary: todaySummary } = useTodaySummary({ autoFetch: true });
  const { statistics } = useAttendanceStats({ autoFetch: true, dateFrom: filters.date_from, dateTo: filters.date_to });
  const { departments } = useDepartments({ autoFetch: true });

  // Real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
      page: 1,
      limit: 20,
    });
  };

  // Format time helper
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "—";
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes === 0) return "—";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Calculate attendance percentage for today
  const todayPercentage = useMemo(() => {
    if (!todaySummary || todaySummary.total_staff === 0) return 0;
    return ((todaySummary.present + (todaySummary.late || 0)) / todaySummary.total_staff * 100).toFixed(1);
  }, [todaySummary]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30">
      {/* Header with Real-time Clock */}
      <div className="bg-white border-b border-teal-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-800">Staff Attendance</h1>
                  <p className="text-sm text-slate-600 font-semibold">
                    Track attendance, punctuality, and working hours
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Real-time Clock Display */}
              <div className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white font-bold shadow-lg">
                <div className="text-xs opacity-80">Current Time</div>
                <div className="text-xl font-mono">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => refresh()}
                disabled={loading}
                className="px-4 py-2 border-2 border-teal-600 text-teal-600 hover:bg-teal-50"
              >
                <RotateCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="secondary"
                className="px-4 py-2 border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Today's Attendance"
            value={`${todayPercentage}%`}
            icon={CheckCircle}
            color="green"
            subtitle={`${todaySummary?.present || 0} present out of ${todaySummary?.total_staff || 0}`}
            trend="+2.5% from yesterday"
          />
          <StatCard
            title="Present Now"
            value={statistics?.today_present || todaySummary?.present || 0}
            icon={Users}
            color="teal"
            subtitle={`${statistics?.today_late || 0} arrived late`}
          />
          <StatCard
            title="Absent Today"
            value={statistics?.today_absent || todaySummary?.absent || 0}
            icon={XCircle}
            color="red"
            subtitle={`${statistics?.total_absences_this_month || 0} absences this month`}
          />
          <StatCard
            title="Avg. Attendance (Month)"
            value={`${statistics?.month_average || statistics?.week_average || 0}%`}
            icon={BarChart3}
            color="blue"
            subtitle="Last 30 days average"
            trend="+1.2% from last month"
          />
        </div>

        {/* Attendance Rate Visualization */}
        {todaySummary && (
          <div className="bg-white rounded-xl shadow-sm border border-teal-200 p-6 mb-6">
            <h3 className="text-lg font-black text-slate-800 mb-4">Today's Attendance Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-green-700">✓ Present</span>
                  <span>{todaySummary.present} ({((todaySummary.present / todaySummary.total_staff) * 100).toFixed(1)}%)</span>
                </div>
                <ProgressBar percentage={(todaySummary.present / todaySummary.total_staff) * 100} color="green" />
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-orange-700">⏱ Late</span>
                  <span>{todaySummary.late || 0} ({(((todaySummary.late || 0) / todaySummary.total_staff) * 100).toFixed(1)}%)</span>
                </div>
                <ProgressBar percentage={((todaySummary.late || 0) / todaySummary.total_staff) * 100} color="orange" />
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-red-700">✗ Absent</span>
                  <span>{todaySummary.absent} ({((todaySummary.absent / todaySummary.total_staff) * 100).toFixed(1)}%)</span>
                </div>
                <ProgressBar percentage={(todaySummary.absent / todaySummary.total_staff) * 100} color="red" />
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-purple-700">🏖 On Leave</span>
                  <span>{todaySummary.on_leave || 0} ({(((todaySummary.on_leave || 0) / todaySummary.total_staff) * 100).toFixed(1)}%)</span>
                </div>
                <ProgressBar percentage={((todaySummary.on_leave || 0) / todaySummary.total_staff) * 100} color="purple" />
              </div>
            </div>
          </div>
        )}

        {/* Filters & View Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-teal-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-teal-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  viewMode === 'calendar' 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-teal-50'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Calendar View
              </button>
            </div>

            <div className="flex-1" />
            
            {/* Filter Toggle */}
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border-2 ${showFilters ? 'border-teal-600 bg-teal-50 text-teal-600' : 'border-slate-200 text-slate-600'}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-teal-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.date_from || ""}
                    onChange={(e) => handleFilterChange("date_from", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.date_to || ""}
                    onChange={(e) => handleFilterChange("date_to", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={filters.department_id || ""}
                    onChange={(e) => handleFilterChange("department_id", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-teal-500 bg-white"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={filters.status || ""}
                    onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-teal-500 bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="secondary" onClick={clearFilters} className="text-sm">
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Attendance List */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-teal-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b-2 border-teal-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Staff Member</th>
                    <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Clock In</th>
                    <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Clock Out</th>
                    <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Total Hours</th>
                    <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Late</th>
                    <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-teal-700 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <RotateCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
                        <p className="text-sm text-slate-500 mt-2">Loading attendance records...</p>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="font-bold">No attendance records found</p>
                      </td>
                    </tr>
                  ) : (
                    (records as any[]).map((record: any) => (
                      <tr key={record.id} className="hover:bg-teal-50/50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                              {(record.staff_name || "S").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{record.staff_name || "Unknown"}</p>
                              {record.employee_no && <p className="text-xs text-slate-500">#{record.employee_no}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-teal-500" />
                            {formatTime(record.clock_in_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-500" />
                            {formatTime(record.clock_out_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-700">
                            {record.total_hours ? `${record.total_hours}h` : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {record.late_minutes > 0 ? (
                            <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                              <Timer className="w-4 h-4" />
                              {formatDuration(record.late_minutes)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">On time</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={record.status} />
                        </td>
                        <td className="px-6 py-4">
                          {record.location ? (
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <MapPin className="w-3 h-3" />
                              {record.location}
                            </div>
                          ) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar View Placeholder */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-teal-200 p-12 text-center">
            <Calendar className="w-24 h-24 mx-auto mb-4 text-teal-400 opacity-30" />
            <h3 className="text-xl font-black text-slate-800 mb-2">Calendar View</h3>
            <p className="text-slate-500">Interactive calendar with attendance heatmap coming soon!</p>
            <p className="text-xs text-slate-400 mt-2">This will show daily attendance patterns with color-coded status indicators</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffAttendancePage;
