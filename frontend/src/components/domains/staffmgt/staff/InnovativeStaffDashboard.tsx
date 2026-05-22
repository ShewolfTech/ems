import React, { useState, useEffect } from "react";
import { Button } from "@/components/domains/aacommon/index.js";
import {
  Users, UserCheck, Calendar, Briefcase, Building2, TrendingUp,
  FileText, Clock, AlertCircle, Plus, Search, Filter,
  BarChart3, PieChart, Activity, Zap, Target, Award,
  UserPlus, ClipboardList, Settings, ChevronRight, Star,
  Heart, Shield, BookOpen, GraduationCap, DollarSign,
  Home, User, BarChart, Sparkles
} from "lucide-react";
import { InnovativeStaffHub } from "./InnovativeStaffHub.js";
import { OnboardingWizard } from "./OnboardingWizard.js";
import { AnalyticsDashboard } from "./AnalyticsDashboard.js";
import { StaffForm } from "./StaffForm.js";
import { StaffList } from "./StaffList.js";

type MainTabType = "hub" | "directory" | "onboarding" | "analytics" | "settings";

export function InnovativeStaffDashboard() {
  const [activeMainTab, setActiveMainTab] = useState<MainTabType>("hub");
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainTabs = [
    { id: "hub" as MainTabType, label: "Staff Hub", icon: Home, description: "Overview & Quick Actions" },
    { id: "directory" as MainTabType, label: "Directory", icon: Users, description: "Staff Management" },
    { id: "onboarding" as MainTabType, label: "Onboarding", icon: Sparkles, description: "New Employee Setup" },
    { id: "analytics" as MainTabType, label: "Analytics", icon: BarChart, description: "Insights & Reports" },
    { id: "settings" as MainTabType, label: "Settings", icon: Settings, description: "Configuration" },
  ];

  const handleModuleSelect = (module: string) => {
    switch (module) {
      case "staff":
        setActiveMainTab("directory");
        break;
      case "attendance":
        // Navigate to attendance module
        break;
      case "leave":
        // Navigate to leave module
        break;
      case "performance":
        // Navigate to performance module
        break;
      default:
        setActiveMainTab("hub");
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboardingWizard(false);
    setActiveMainTab("directory");
  };

  const handleStaffFormClose = () => {
    setShowStaffForm(false);
  };

  const renderContent = () => {
    switch (activeMainTab) {
      case "hub":
        return (
          <InnovativeStaffHub onModuleSelect={handleModuleSelect} />
        );
      case "directory":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Staff Directory</h2>
                <p className="text-slate-600 mt-1">Manage and view all staff members</p>
              </div>
              <Button
                onClick={() => setShowStaffForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold shadow-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Staff Member
              </Button>
            </div>
            <StaffList />
          </div>
        );
      case "onboarding":
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl mb-8">
                <Sparkles className="w-16 h-16 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Employee Onboarding</h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Streamlined onboarding process with step-by-step guidance and document collection
              </p>
              <Button
                onClick={() => setShowOnboardingWizard(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg shadow-xl"
              >
                <UserPlus className="w-6 h-6 mr-3" />
                Start Onboarding Process
              </Button>
            </div>
          </div>
        );
      case "analytics":
        return <AnalyticsDashboard />;
      case "settings":
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gradient-to-r from-slate-100 to-gray-100 rounded-3xl mb-8">
                <Settings className="w-16 h-16 text-slate-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">System Settings</h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Configure staff management preferences, workflows, and integrations
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                  <Briefcase className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 mb-2">Departments</h3>
                  <p className="text-sm text-slate-600">Manage organizational structure</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                  <Users className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 mb-2">Roles & Permissions</h3>
                  <p className="text-sm text-slate-600">Configure access controls</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 mb-2">Templates</h3>
                  <p className="text-sm text-slate-600">Document and email templates</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <InnovativeStaffHub onModuleSelect={handleModuleSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Staff Management System</h1>
          <p className="text-slate-600 text-lg">Intelligent workforce management with AI-powered insights</p>
        </div>

        {/* Main Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="flex flex-wrap gap-1 p-2 bg-slate-50">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg text-base font-bold transition-all ${
                    activeMainTab === tab.id
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-teal-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs opacity-75 font-normal">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="mb-12">
          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      {showOnboardingWizard && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onCancel={() => setShowOnboardingWizard(false)}
        />
      )}

      {showStaffForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <StaffForm
              onClose={handleStaffFormClose}
              onSave={(data) => {
                console.log("Staff saved:", data);
                handleStaffFormClose();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InnovativeStaffDashboard;