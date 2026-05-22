import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, FileText, Award, BookOpen, Clock, ChevronRight, Plus, ArrowLeft, Loader2,
  Settings, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Upload, FileText as FileIcon, Search, ArrowRight, Download, Calendar, Users, X
} from "lucide-react";
import { GradeBookPage } from "../assessments/GradeBookPage";
import { StudentReportPage } from "../student_report/StudentReportPage";
import { ExamsPage } from "../exams/ExamsPage";
import { AssignmentsPage } from "../assignments/AssignmentsPage";
import { BulkGradingEntry } from "../grading/BulkGradingEntry";
import { useAssessments } from "@/domains/academics/assessments/hooks/useAssessments.js";
import { Pagination } from "@/components/common/Pagination";
import api from "@/utils/api.js";

const tabs = [
  { id: "gradebook", label: "Gradebook", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "reports", label: "Student Report", icon: <FileText className="w-4 h-4" /> },
  { id: "assessments", label: "Assessments", icon: <FileText className="w-4 h-4" /> },
  { id: "exams", label: "Exams", icon: <Award className="w-4 h-4" /> },
  { id: "assignments", label: "Assignments", icon: <BookOpen className="w-4 h-4" /> },
];

export function AssessmentsGradingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("gradebook");
  const [showBulkGrading, setShowBulkGrading] = useState(false);
  const [bulkGradingType, setBulkGradingType] = useState<"assessments" | "exams" | "assignments">("assessments");

  const renderTabContent = () => {
    switch (activeTab) {
      case "gradebook":
        return (
          <div className="space-y-6">
            {/* Stats & Actions */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Unified Gradebook</h3>
                <p className="text-sm text-slate-600">View and manage all student grades</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setBulkGradingType("assessments");
                    setShowBulkGrading(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Bulk Grade Entry
                </button>
                <button
                  onClick={() => {}}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> Export Grades
                </button>
              </div>
            </div>
            <GradeBookPage />
          </div>
        );
      case "reports":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Reports</h3>
                <p className="text-sm text-slate-600">Generate and manage student report cards</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {}}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <FileText className="w-4 h-4" /> Generate Reports
                </button>
                <button
                  onClick={() => {}}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-4 h-4" /> Bulk Generate
                </button>
              </div>
            </div>
            <StudentReportPage />
          </div>
        );
      case "assessments":
        return <AssessmentsTab />;
      case "exams":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Examinations</h3>
                <p className="text-sm text-slate-600">Manage mid-terms, finals, and exam results</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setBulkGradingType("exams");
                    setShowBulkGrading(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Bulk Results Entry
                </button>
                <button
                  onClick={() => {}}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  <Upload className="w-4 h-4" /> Import Results
                </button>
              </div>
            </div>
            <ExamsPage />
          </div>
        );
      case "assignments":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assignments</h3>
                <p className="text-sm text-slate-600">Manage homework, projects, and graded tasks</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setBulkGradingType("assignments");
                    setShowBulkGrading(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Bulk Grading
                </button>
                <button
                  onClick={() => {}}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  <Upload className="w-4 h-4" /> Import Submissions
                </button>
              </div>
            </div>
            <AssignmentsPage />
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
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-teal-600" />
            Assessments & Grading
          </h1>
          <p className="text-slate-600 mt-2">Manage gradebooks, reports, assessments, exams, and assignments</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Bulk Grading Modal */}
      {showBulkGrading && (
        <BulkGradingEntry
          entityType={bulkGradingType}
          onSave={() => {
            setShowBulkGrading(false);
          }}
          onClose={() => setShowBulkGrading(false)}
        />
      )}
    </div>
  );
}

export default AssessmentsGradingPage;
