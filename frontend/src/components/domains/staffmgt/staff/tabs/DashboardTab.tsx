import React, { useState, useEffect } from "react";
import { Button } from "@/components/domains/aacommon/index.js";
import { 
  Users, UserCheck, Calendar, Briefcase, 
  Plus, FileText, Clock, AlertCircle, ChevronRight 
} from "lucide-react";
import { getStaffStatistics } from "@/domains/staffmgt/staff/services.js";
import { useNavigate } from "react-router-dom";

interface DashboardTabProps {
  onTabChange?: (tab: string) => void;
}

export function DashboardTab({ onTabChange }: DashboardTabProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await getStaffStatistics();

      setStats({
        totalStaff: statsData.total_staff || 0,
        activeStaff: statsData.active_staff || 0,
        onLeave: statsData.on_leave || 0,
        departments: statsData.departments_count || 0,
        pendingLeaveRequests: statsData.pending_leave_requests || 0,
        todayAttendance: statsData.today_attendance || 0,
      });

      setRecentActivities([
        { type: "staff_added", message: "New staff member added", time: "2 hours ago" },
        { type: "leave_approved", message: "Leave request approved", time: "4 hours ago" },
        { type: "attendance", message: "Attendance recorded", time: "6 hours ago" },
        { type: "department", message: "Department updated", time: "1 day ago" }
      ]);

      setAlerts([
        {
          type: "leave_requests",
          title: "Pending Leave Requests",
          message: `${statsData.pending_leave_requests || 0} requests need approval`,
          action: "Review Now",
          priority: "urgent"
        },
        {
          type: "reports",
          title: "Monthly Report Ready",
          message: "Staff performance report for current month",
          action: "View Report",
          priority: "info"
        }
      ]);

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setStats({ totalStaff: 0, activeStaff: 0, onLeave: 0, departments: 0 });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Add New Staff",
      description: "Register a new team member",
      icon: Plus,
      action: () => {
        if (onTabChange) onTabChange("management");
        navigate("/staffmgt/staff?action=new");
      },
    },
    {
      title: "Leave Requests",
      description: "Review pending approvals",
      icon: Calendar,
      action: () => navigate("/staffmgt/leave-management"),
    },
    {
      title: "Attendance",
      description: "View today's records",
      icon: UserCheck,
      action: () => navigate("/staffmgt/staff-attendance"),
    },
    {
      title: "Reports",
      description: "Export staff analytics",
      icon: FileText,
      action: () => navigate("/staffmgt/staff-attendance"),
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Staff Overview</h2>
          <p className="text-slate-500 text-sm">Real-time management dashboard</p>
        </div>
        <div className="text-xs font-medium text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
          Last updated: Just now
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Staff", value: stats.totalStaff, icon: Users, sub: "Members" },
          { label: "Active Now", value: stats.activeStaff, icon: UserCheck, sub: "Working" },
          { label: "On Leave", value: stats.onLeave, icon: Calendar, sub: "Out of Office" },
          { label: "Departments", value: stats.departments, icon: Briefcase, sub: "Groups" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-lg group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <item.icon size={20} />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{item.sub}</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column: Actions and Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions - Unified Branding */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-700">Quick Operations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-cyan-200 hover:bg-cyan-50/50 transition-all text-left group"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                    <action.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">{action.title}</h4>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-cyan-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Clock size={18} className="text-cyan-600" /> Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivities.map((activity, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    <p className="text-sm text-slate-700 font-medium">{activity.message}</p>
                  </div>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Alerts */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
             {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16"></div>
            
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
              <AlertCircle size={20} className="text-cyan-400" /> 
              System Alerts
            </h3>
            
            <div className="space-y-4 relative z-10">
              {alerts.map((alert, index) => (
                <div key={index} className="bg-white/10 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                    {alert.title}
                  </p>
                  <p className="text-sm text-slate-200 mb-3">{alert.message}</p>
                  <button 
                    onClick={() => navigate("/staffmgt/leave-management")}
                    className="text-xs font-bold py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors w-full"
                  >
                    {alert.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}