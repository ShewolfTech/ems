import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, BarChart3, TrendingUp, Users, Download, Printer
} from "lucide-react";

const tabs = [
  { id: "reports", label: "Student Report Card", icon: <GraduationCap className="w-4 h-4" /> },
  { id: "class", label: "Class Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "subject", label: "Subject Performance", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "attendance", label: "Attendance Reports", icon: <Users className="w-4 h-4" /> },
];

export function ReportsAnalyticsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("reports");

  const renderTabContent = () => {
    switch (activeTab) {
      case "reports":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Student Report Cards</h3>
              <button
                onClick={() => navigate("/academics/student-report")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <GraduationCap className="w-4 h-4" /> Generate Report Card
              </button>
            </div>
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Comprehensive Report Cards</h3>
              <p className="text-slate-600 mb-4">Generate detailed student report cards with grades, attendance, and teacher comments.</p>
              <button
                onClick={() => navigate("/academics/student-report")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Open Student Report Center
              </button>
            </div>
          </div>
        );
      case "class":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Class Analytics</h3>
              <button
                onClick={() => navigate("/academics/assignments")}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <BarChart3 className="w-4 h-4" /> View Analytics
              </button>
            </div>
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Class-Level Analytics</h3>
              <p className="text-slate-600 mb-4">View performance trends, grade distributions, and submission rates by class.</p>
              <button
                onClick={() => navigate("/academics/assignments")}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Go to Assignments Analytics
              </button>
            </div>
          </div>
        );
      case "subject":
        return (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Subject Performance</h3>
            <p className="text-slate-600">Analyze subject-level performance across classes and terms.</p>
          </div>
        );
      case "attendance":
        return (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Attendance Reports</h3>
            <p className="text-slate-600">Track attendance patterns and generate attendance summaries.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            Reports & Analytics
          </h1>
          <p className="text-slate-600 mt-2">Generate reports, view analytics, and track academic performance</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-orange-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default ReportsAnalyticsPage;
