import React, { useState, useEffect } from "react";
import { Button } from "@/components/domains/aacommon/index.js";
import {
  BarChart3, PieChart, TrendingUp, TrendingDown, Users,
  Calendar, Clock, Award, AlertTriangle, Target,
  Activity, Zap, Heart, Star, Download, Filter,
  ChevronDown, Eye, UserCheck, UserX, Briefcase
} from "lucide-react";
import { getStaffStatistics } from "@/domains/staffmgt/staff/services.js";

interface AnalyticsDashboardProps {
  onExport?: (type: string) => void;
}

export function AnalyticsDashboard({ onExport }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [stats, setStats] = useState<any>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, departmentFilter]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const data = await getStaffStatistics();
      // Mock additional analytics data
      setStats({
        ...data,
        headcount: {
          current: 142,
          change: 8,
          trend: 'up'
        },
        attendance: {
          rate: 96.5,
          change: 2.1,
          trend: 'up'
        },
        turnover: {
          rate: 4.2,
          change: -0.8,
          trend: 'down'
        },
        performance: {
          average: 4.1,
          change: 0.3,
          trend: 'up'
        },
        departmentBreakdown: [
          { name: 'Engineering', count: 45, percentage: 32 },
          { name: 'Sales', count: 28, percentage: 20 },
          { name: 'Marketing', count: 22, percentage: 15 },
          { name: 'HR', count: 18, percentage: 13 },
          { name: 'Finance', count: 15, percentage: 11 },
          { name: 'Operations', count: 14, percentage: 9 }
        ],
        leaveTypes: [
          { type: 'Annual Leave', used: 245, total: 300, percentage: 82 },
          { type: 'Sick Leave', used: 45, total: 60, percentage: 75 },
          { type: 'Personal Leave', used: 28, total: 40, percentage: 70 },
          { type: 'Maternity Leave', used: 12, total: 15, percentage: 80 }
        ],
        topPerformers: [
          { name: 'Sarah Johnson', score: 4.8, department: 'Engineering' },
          { name: 'Mike Chen', score: 4.7, department: 'Sales' },
          { name: 'Emma Davis', score: 4.6, department: 'Marketing' }
        ],
        alerts: [
          { type: 'turnover_risk', message: '3 employees show high turnover risk', severity: 'high' },
          { type: 'leave_exhaustion', message: '5 employees have used 90%+ of annual leave', severity: 'medium' },
          { type: 'performance_drop', message: '2 employees had performance decline last month', severity: 'medium' }
        ]
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: "Total Headcount",
      value: stats?.headcount?.current || 0,
      change: stats?.headcount?.change || 0,
      trend: stats?.headcount?.trend || 'up',
      icon: Users,
      color: "teal",
      description: "Active employees"
    },
    {
      title: "Attendance Rate",
      value: `${stats?.attendance?.rate || 0}%`,
      change: stats?.attendance?.change || 0,
      trend: stats?.attendance?.trend || 'up',
      icon: UserCheck,
      color: "cyan",
      description: "Average this month"
    },
    {
      title: "Turnover Rate",
      value: `${stats?.turnover?.rate || 0}%`,
      change: stats?.turnover?.change || 0,
      trend: stats?.turnover?.trend || 'down',
      icon: TrendingDown,
      color: "orange",
      description: "Annual rate"
    },
    {
      title: "Avg Performance",
      value: stats?.performance?.average || 0,
      change: stats?.performance?.change || 0,
      trend: stats?.performance?.trend || 'up',
      icon: Star,
      color: "yellow",
      description: "Out of 5.0 rating"
    }
  ];

  const renderKPICard = (kpi: typeof kpiCards[0]) => (
    <div key={kpi.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${kpi.color}-100 text-${kpi.color}-600 rounded-xl`}>
          <kpi.icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {kpi.change > 0 ? '+' : ''}{kpi.change}{kpi.title.includes('%') ? '%' : ''}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-black text-slate-800">{kpi.value}</p>
        <p className="text-sm font-bold text-slate-600">{kpi.title}</p>
        <p className="text-xs text-slate-500">{kpi.description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Staff Analytics Dashboard</h2>
          <p className="text-slate-600 mt-1">Comprehensive workforce insights and trends</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <Button
            onClick={() => onExport?.('pdf')}
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map(renderKPICard)}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Department Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-teal-600" />
              Department Distribution
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Eye className="w-4 h-4" />
              {timeRange}
            </div>
          </div>

          <div className="space-y-4">
            {stats?.departmentBreakdown?.map((dept: any, index: number) => (
              <div key={dept.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-teal-${(index % 3 + 4) * 100}`} />
                  <span className="font-medium text-slate-700">{dept.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-600 w-12 text-right">
                    {dept.count}
                  </span>
                  <span className="text-xs text-slate-500 w-10 text-right">
                    {dept.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-yellow-600" />
            Top Performers
          </h3>

          <div className="space-y-4">
            {stats?.topPerformers?.map((performer: any, index: number) => (
              <div key={performer.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{performer.name}</p>
                    <p className="text-xs text-slate-500">{performer.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-bold text-slate-700">{performer.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Analytics & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Leave Utilization */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-blue-600" />
            Leave Utilization
          </h3>

          <div className="space-y-4">
            {stats?.leaveTypes?.map((leave: any) => (
              <div key={leave.type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{leave.type}</span>
                  <span className="text-slate-500">{leave.used}/{leave.total} days</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      leave.percentage > 90 ? 'bg-red-500' :
                      leave.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${leave.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            System Alerts
          </h3>

          <div className="space-y-4">
            {stats?.alerts?.map((alert: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${
                alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-600' :
                    alert.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                    <button className="text-xs font-bold text-teal-600 mt-2 hover:text-teal-700">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Zap className="w-6 h-6 text-teal-400" />
          </div>
          <h3 className="text-xl font-bold">AI-Powered Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-green-400">Growth Prediction</span>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Headcount expected to grow by 15% in next quarter based on current hiring trends.
            </p>
            <div className="text-xs text-slate-400">Confidence: 87%</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-blue-400">Retention Focus</span>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Engineering department shows highest retention risk. Consider engagement initiatives.
            </p>
            <div className="text-xs text-slate-400">Risk Level: Medium</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-sm font-bold text-pink-400">Wellness Alert</span>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              23% increase in sick leave this month. Monitor workload distribution.
            </p>
            <div className="text-xs text-slate-400">Trend: Increasing</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;