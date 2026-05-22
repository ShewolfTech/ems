import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Award, BarChart3, Settings, ChevronRight, Plus, Calendar, Users, FileSpreadsheet
} from "lucide-react";
import { BulkGradingEntry } from "./BulkGradingEntry";

const tabs = [
  { id: "bulk-entry", label: "Bulk Submissions Entry", icon: <FileSpreadsheet className="w-4 h-4" /> },
  { id: "assessments", label: "Assessments", icon: <FileText className="w-4 h-4" /> },
  { id: "exams", label: "Exams", icon: <Award className="w-4 h-4" /> },
  { id: "assignments", label: "Assignments", icon: <FileText className="w-4 h-4" /> },
  { id: "gradebook", label: "Grade Book", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "config", label: "Grading Config", icon: <Settings className="w-4 h-4" /> },
];

export function AssessmentsGradingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bulk-entry");
  const [bulkEntityType, setBulkEntityType] = useState<"assessments" | "exams" | "assignments">("assessments");

  const renderTabContent = () => {
    switch (activeTab) {
      case "bulk-entry":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Bulk Submissions Entry</h3>
              <div className="flex gap-2">
                <select
                  value={bulkEntityType}
                  onChange={(e) => setBulkEntityType(e.target.value as any)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="assessments">Assessments</option>
                  <option value="exams">Exams</option>
                  <option value="assignments">Assignments</option>
                </select>
              </div>
            </div>
            <BulkGradingEntry 
              entityType={bulkEntityType}
              onSaved={() => console.log("Grades saved successfully")}
            />
          </div>
        );
      case "assessments":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Assessments</h3>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50">
                  <Calendar className="w-4 h-4" /> Calendar
                </button>
                <button
                  onClick={() => navigate("/academics/assessments")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Assessment
                </button>
              </div>
            </div>
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Assessment Management</h3>
              <p className="text-slate-600">Create and manage continuous assessments, quizzes, and tests.</p>
              <button
                onClick={() => navigate("/academics/assessments")}
                className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Go to Assessments
              </button>
            </div>
          </div>
        );
      case "exams":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Examinations</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/academics/exams/calendar")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Calendar className="w-4 h-4" /> Calendar
                </button>
                <button
                  onClick={() => navigate("/academics/exams")}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" /> New Exam
                </button>
              </div>
            </div>
            <div className="text-center py-12">
              <Award className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Exam Management</h3>
              <p className="text-slate-600">Schedule exams, enter results, and track examination performance.</p>
              <button
                onClick={() => navigate("/academics/exams")}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Go to Exams
              </button>
            </div>
          </div>
        );
      case "assignments":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Assignments</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/academics/assignments/calendar")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Calendar className="w-4 h-4" /> Calendar
                </button>
                <button
                  onClick={() => navigate("/academics/assignments")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Assignment
                </button>
              </div>
            </div>
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Assignment Management</h3>
              <p className="text-slate-600">Create assignments, track submissions, and grade student work.</p>
              <button
                onClick={() => navigate("/academics/assignments")}
                className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Go to Assignments
              </button>
            </div>
          </div>
        );
      case "gradebook":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Grade Book</h3>
              <button
                onClick={() => navigate("/academics/gradebook")}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                <BarChart3 className="w-4 h-4" /> Open Grade Book
              </button>
            </div>
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Unified Grade Book</h3>
              <p className="text-slate-600">View all grades from assessments, exams, and assignments in one place.</p>
              <button
                onClick={() => navigate("/academics/gradebook")}
                className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Open Grade Book
              </button>
            </div>
          </div>
        );
      case "config":
        return (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Grading Configuration</h3>
            <p className="text-slate-600">Configure grading scales, weights, and calculation methods.</p>
            <button
              onClick={() => navigate("/academics/grading-configurations")}
              className="mt-4 px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Configure Grading
            </button>
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
            <Award className="w-8 h-8 text-purple-600" />
            Assessments & Grading
          </h1>
          <p className="text-slate-600 mt-2">Manage assessments, exams, assignments, and grade tracking</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-purple-700'
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

export default AssessmentsGradingPage;
