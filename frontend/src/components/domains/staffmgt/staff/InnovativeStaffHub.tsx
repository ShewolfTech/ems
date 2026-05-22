import React, { useState, useEffect } from "react";
import { Button } from "@/components/domains/aacommon/index.js";
import {
  Users, UserCheck, Calendar, Briefcase, Building2, TrendingUp,
  FileText, Clock, AlertCircle, Plus, Search, Filter,
  BarChart3, PieChart, Activity, Zap, Target, Award,
  UserPlus, ClipboardList, Settings, ChevronRight, Star,
  Heart, Shield, BookOpen, GraduationCap, DollarSign
} from "lucide-react";
import { getStaffStatistics } from "@/domains/staffmgt/staff/services.js";
import { useNavigate } from "react-router-dom";

interface InnovativeStaffHubProps {
  onModuleSelect?: (module: string) => void;
}

export function InnovativeStaffHub({ onModuleSelect }: InnovativeStaffHubProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
        newThisMonth: statsData.new_this_month || 0,
        departments: statsData.departments_count || 0,
        roles: statsData.roles_count || 0,
        attendanceRate: statsData.attendance_rate || 0,
        turnoverRate: statsData.turnover_rate || 0,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setStats({
        totalStaff: 0, activeStaff: 0, onLeave: 0, newThisMonth: 0,
        departments: 0, roles: 0, attendanceRate: 0, turnoverRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const coreModules = [
    {
      id: "staff",
      title: "Staff Directory",
      description: "Complete employee profiles with advanced search and filtering",
      icon: Users,
      color: "teal",
      features: ["Smart Search", "Bulk Operations", "Export Tools", "Role Management"],
      stats: `${stats?.totalStaff || 0} Members`,
      path: "/staffmgt/staff"
    },
    {
      id: "attendance",
      title: "Smart Attendance",
      description: "AI-powered attendance tracking with real-time analytics",
      icon: UserCheck,
      color: "cyan",
      features: ["Biometric Integration", "Geo-fencing", "Auto Calculations", "Reports"],
      stats: `${stats?.attendanceRate || 0}% Rate`,
      path: "/staffmgt/staff-attendance"
    },
    {
      id: "leave",
      title: "Leave Intelligence",
      description: "Automated leave management with predictive analytics",
      icon: Calendar,
      color: "blue",
      features: ["Quota Tracking", "Auto Approval", "Calendar Sync", "Analytics"],
      stats: `${stats?.onLeave || 0} On Leave`,
      path: "/staffmgt/leave-management"
    },
    {
      id: "performance",
      title: "Performance Hub",
      description: "360-degree performance reviews and goal tracking",
      icon: Target,
      color: "indigo",
      features: ["360 Reviews", "Goal Setting", "Analytics", "Feedback"],
      stats: "4.2 Avg Rating",
      path: "/staffmgt/performance"
    }
  ];

  const advancedModules = [
    {
      id: "recruitment",
      title: "Talent Acquisition",
      description: "End-to-end recruitment pipeline with AI matching",
      icon: UserPlus,
      color: "purple",
      features: ["Job Posting", "Candidate Tracking", "AI Matching", "Onboarding"],
      stats: "12 Open Positions",
      path: "/staffmgt/hiring"
    },
    {
      id: "training",
      title: "Learning Center",
      description: "Personalized training programs and skill development",
      icon: GraduationCap,
      color: "orange",
      features: ["Course Library", "Progress Tracking", "Certifications", "Assessments"],
      stats: "28 Active Courses",
      path: "/staffmgt/training"
    },
    {
      id: "payroll",
      title: "Payroll Pro",
      description: "Intelligent payroll processing with tax optimization",
      icon: DollarSign,
      color: "green",
      features: ["Auto Calculations", "Tax Compliance", "Direct Deposit", "Reports"],
      stats: "On Time",
      path: "/staffmgt/payroll"
    },
    {
      id: "analytics",
      title: "HR Analytics",
      description: "Advanced workforce analytics and predictive insights",
      icon: BarChart3,
      color: "red",
      features: ["Predictive Analytics", "Custom Reports", "Dashboards", "KPIs"],
      stats: "Real-time",
      path: "/staffmgt/analytics"
    }
  ];

  const quickStats = [
    {
      label: "Total Workforce",
      value: stats?.totalStaff || 0,
      change: "+12%",
      icon: Users,
      color: "teal"
    },
    {
      label: "Active Today",
      value: stats?.activeStaff || 0,
      change: "98.5%",
      icon: Activity,
      color: "cyan"
    },
    {
      label: "New This Month",
      value: stats?.newThisMonth || 0,
      change: "+8",
      icon: UserPlus,
      color: "blue"
    },
    {
      label: "Avg Performance",
      value: "4.2",
      change: "+0.3",
      icon: Star,
      color: "yellow"
    }
  ];

  const handleModuleClick = (module: any) => {
    if (onModuleSelect) {
      onModuleSelect(module.id);
    } else {
      navigate(module.path);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Staff Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Staff Management Hub
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Intelligent workforce management with AI-powered insights and automation
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${stat.color}-100 text-${stat.color}-600 rounded-xl group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-bold text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-full`}>
                  {stat.change}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search modules, features, or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex gap-2">
              {["all", "core", "advanced"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-teal-100 text-teal-700 border border-teal-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {category === "all" ? "All Modules" : category === "core" ? "Core HR" : "Advanced"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Core HR Modules */}
        {(selectedCategory === "all" || selectedCategory === "core") && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-slate-800">Core HR Operations</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreModules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-${module.color}-100 text-${module.color}-600 rounded-xl group-hover:bg-${module.color}-600 group-hover:text-white transition-all`}>
                      <module.icon className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-600 transition-all" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{module.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {module.stats}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {module.features.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-md">
                          {feature}
                        </span>
                      ))}
                      {module.features.length > 2 && (
                        <span className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded-md">
                          +{module.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Modules */}
        {(selectedCategory === "all" || selectedCategory === "advanced") && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-slate-800">Advanced Features</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {advancedModules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-${module.color}-100 text-${module.color}-600 rounded-xl group-hover:bg-${module.color}-600 group-hover:text-white transition-all`}>
                      <module.icon className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 transition-all" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">{module.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {module.stats}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {module.features.slice(0, 1).map((feature, idx) => (
                        <span key={idx} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-md">
                          {feature}
                        </span>
                      ))}
                      {module.features.length > 1 && (
                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-md">
                          +{module.features.length - 1}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights Panel */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mr-32 -mt-32"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold">AI-Powered Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-green-400">Turnover Risk</span>
                </div>
                <p className="text-sm text-slate-300">3 employees show signs of potential turnover</p>
                <button className="text-xs font-bold text-teal-400 mt-2 hover:text-teal-300">
                  View Details →
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400">Top Performer</span>
                </div>
                <p className="text-sm text-slate-300">Sarah Johnson leads with 4.8 rating this quarter</p>
                <button className="text-xs font-bold text-teal-400 mt-2 hover:text-teal-300">
                  Recognize →
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-blue-400">Training Need</span>
                </div>
                <p className="text-sm text-slate-300">Digital marketing skills gap identified</p>
                <button className="text-xs font-bold text-teal-400 mt-2 hover:text-teal-300">
                  Plan Training →
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default InnovativeStaffHub;