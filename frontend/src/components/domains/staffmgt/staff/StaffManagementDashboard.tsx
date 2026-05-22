import React, { useState, useEffect } from "react";
import { User, Users, Briefcase, Building2, TrendingUp, Calendar, FileText } from "lucide-react";
import { DashboardTab } from "./tabs/DashboardTab.js";

type MainTabType = "dashboard" | "management" | "resources";
type ManagementSubTabType = "staff";
type ResourceSubTabType = "departments" | "roles" | "contracts" | "performance" | "training";

export function StaffManagementDashboard() {
  const [activeMainTab, setActiveMainTab] = useState<MainTabType>("dashboard");
  const [activeManagementSubTab, setActiveManagementSubTab] = useState<ManagementSubTabType>("staff");
  const [activeResourceSubTab, setActiveResourceSubTab] = useState<ResourceSubTabType>("departments");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainTabs = [
    { id: "dashboard" as MainTabType, label: "Dashboard", icon: Users },
    { id: "management" as MainTabType, label: "Staff Management", icon: Briefcase },
    { id: "resources" as MainTabType, label: "Resources", icon: Building2 },
  ];

  const managementSubTabs = [
    { id: "staff" as ManagementSubTabType, label: "Staff", icon: User },
  ];

  const resourceSubTabs = [
    { id: "departments" as ResourceSubTabType, label: "Departments", icon: Building2 },
    { id: "roles" as ResourceSubTabType, label: "Roles", icon: Briefcase },
    { id: "contracts" as ResourceSubTabType, label: "Contracts", icon: FileText },
    { id: "performance" as ResourceSubTabType, label: "Performance", icon: TrendingUp },
    { id: "training" as ResourceSubTabType, label: "Training", icon: User },
  ];

  const renderContent = () => {
    switch (activeMainTab) {
      case "dashboard":
        return <DashboardTab />;
      case "management":
        return renderManagementContent();
      case "resources":
        return renderResourceContent();
      default:
        return <DashboardTab />;
    }
  };

  const renderManagementContent = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {managementSubTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveManagementSubTab(tab.id)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  activeManagementSubTab === tab.id
                    ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-md"
                    : "border-slate-200 hover:border-cyan-300 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {activeManagementSubTab === 'staff' && (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Staff Overview</h3>
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-cyan-100 rounded-full mb-4">
                  <Users className="w-12 h-12 text-cyan-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800">Staff Management System</h4>
                <p className="text-slate-600 mt-2">Add, edit, and manage staff members efficiently</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResourceContent = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {resourceSubTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveResourceSubTab(tab.id)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  activeResourceSubTab === tab.id
                    ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-md"
                    : "border-slate-200 hover:border-cyan-300 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {activeResourceSubTab === 'departments' && (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Departments</h3>
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
                  <Building2 className="w-12 h-12 text-teal-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800">Department Management</h4>
                <p className="text-slate-600 mt-2">Create and manage organizational departments</p>
              </div>
            </div>
          )}
          {activeResourceSubTab === 'roles' && (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Roles & Permissions</h3>
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
                  <Briefcase className="w-12 h-12 text-teal-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800">Staff Roles</h4>
                <p className="text-slate-600 mt-2">Define and assign roles with specific permissions</p>
              </div>
            </div>
          )}
          {activeResourceSubTab === 'contracts' && (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Contracts</h3>
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
                  <FileText className="w-12 h-12 text-teal-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800">Contract Management</h4>
                <p className="text-slate-600 mt-2">Track employment contracts and renewals</p>
              </div>
            </div>
          )}
          {activeResourceSubTab === 'performance' && (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Performance</h3>
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
                  <TrendingUp className="w-12 h-12 text-teal-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800">Performance Reviews</h4>
                <p className="text-slate-600 mt-2">Monitor and evaluate staff performance</p>
              </div>
            </div>
          )}
          {activeResourceSubTab === 'training' && (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Training</h3>
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
                  <User className="w-12 h-12 text-teal-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800">Staff Training</h4>
                <p className="text-slate-600 mt-2">Manage ongoing skill development and training</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Staff Management System</h1>
          <p className="text-slate-600 text-lg">Efficiently manage your organization's human resources</p>
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="flex flex-wrap gap-1 p-2 bg-slate-50">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-lg text-base font-bold transition-all ${
                    activeMainTab === tab.id
                      ? "bg-cyan-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-cyan-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="p-5 border-t border-slate-200 bg-slate-50">
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search staff, departments, or roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="mb-12">
          {renderContent()}
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl p-6 text-white">
            <div className="text-3xl font-black">142</div>
            <div className="text-cyan-100">Total Staff</div>
          </div>
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-6 text-white">
            <div className="text-3xl font-black">8</div>
            <div className="text-cyan-100">Departments</div>
          </div>
          <div className="bg-gradient-to-r from-cyan-700 to-teal-700 rounded-2xl p-6 text-white">
            <div className="text-3xl font-black">24</div>
            <div className="text-cyan-100">Active Roles</div>
          </div>
          <div className="bg-gradient-to-r from-cyan-800 to-teal-800 rounded-2xl p-6 text-white">
            <div className="text-3xl font-black">98%</div>
            <div className="text-cyan-100">Attendance</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffManagementDashboard;
