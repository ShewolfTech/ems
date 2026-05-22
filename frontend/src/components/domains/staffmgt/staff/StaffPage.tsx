import React, { useState } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { Users, Building2, BarChart3, Clock, CalendarDays, Shield, FileText, TrendingDown, BookOpen } from "lucide-react";
import { DashboardTab } from "./tabs/DashboardTab.js";
import { ManagementTab } from "./tabs/ManagementTab.js";

type MainTabType = "dashboard" | "staff" | "resources";
type StaffSubTabType = "list" | "attendance" | "leave";
type ResourcesSubTabType = "departments" | "roles" | "contracts" | "performance" | "training";

export function StaffPage() {
  const { user } = useAuthContext() as any;
  const [activeMainTab, setActiveMainTab] = useState<MainTabType>("dashboard");
  const [activeStaffSubTab, setActiveStaffSubTab] = useState<StaffSubTabType>("list");
  const [activeResourcesSubTab, setActiveResourcesSubTab] = useState<ResourcesSubTabType>("departments");

  const mainTabs = [
    { id: "dashboard" as MainTabType, label: "Dashboard", icon: BarChart3 },
    { id: "staff" as MainTabType, label: "Staff", icon: Users },
    { id: "resources" as MainTabType, label: "Resources & Departments", icon: Building2 },
  ];

  const staffSubTabs = [
    { id: "list" as StaffSubTabType, label: "Staff List", icon: Users },
    { id: "attendance" as StaffSubTabType, label: "Attendance", icon: Clock },
    { id: "leave" as StaffSubTabType, label: "Leave Management", icon: CalendarDays },
  ];

  const resourcesSubTabs = [
    { id: "departments" as ResourcesSubTabType, label: "Departments", icon: Building2 },
    { id: "roles" as ResourcesSubTabType, label: "Roles", icon: Shield },
    { id: "contracts" as ResourcesSubTabType, label: "Contracts", icon: FileText },
    { id: "performance" as ResourcesSubTabType, label: "Performance", icon: TrendingDown },
    { id: "training" as ResourcesSubTabType, label: "Training", icon: BookOpen },
  ];

  const renderTabContent = () => {
    switch (activeMainTab) {
      case "dashboard":
        return <DashboardTab onTabChange={() => setActiveMainTab("staff")} />;
      case "staff":
        return renderStaffContent();
      case "resources":
        return renderResourcesContent();
      default:
        return <DashboardTab onTabChange={() => setActiveMainTab("staff")} />;
    }
  };

  const renderStaffContent = () => {
    const renderStaffSubContent = () => {
      switch (activeStaffSubTab) {
        case "list":
          return <ManagementTab />;
        case "attendance":
          return <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">Attendance tracking coming soon</div>;
        case "leave":
          return <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">Leave management coming soon</div>;
        default:
          return <ManagementTab />;
      }
    };

    return (
      <div className="space-y-4">
        {/* Staff Sub-tabs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            {staffSubTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeStaffSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStaffSubTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white shadow-sm text-teal-700 border border-teal-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="p-6">
            {renderStaffSubContent()}
          </div>
        </div>
      </div>
    );
  };

  const renderResourcesContent = () => {
    const renderResourcesSubContent = () => {
      switch (activeResourcesSubTab) {
        case "departments":
          return <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">Department management coming soon</div>;
        case "roles":
          return <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">Role management coming soon</div>;
        case "contracts":
          return <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">Contract management coming soon</div>;
        case "performance":
          return <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">Performance tracking coming soon</div>;
        case "training":
          return <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">Training programs coming soon</div>;
        default:
          return <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">Department management coming soon</div>;
      }
    };

    return (
      <div className="space-y-4">
        {/* Resources Action Buttons - Horizontal Layout */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            {resourcesSubTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeResourcesSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveResourcesSubTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white shadow-sm text-teal-700 border border-teal-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="p-6">
            {renderResourcesSubContent()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Simple Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
          <button className="text-cyan-600 hover:text-cyan-700 font-medium">← Back</button>
        </div>
        <h1 className="text-3xl font-black text-slate-900">Staff Management</h1>
        <p className="text-slate-600 text-sm mt-1">Manage staff, attendance, and organizational resources.</p>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className={`flex gap-1 p-2 border-b border-slate-200 overflow-x-auto ${
          activeMainTab === "resources" ? "bg-slate-100" : "bg-slate-50"
        }`}>
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMainTab === tab.id;
            const isSubTabActive = (activeMainTab === "staff" && activeStaffSubTab) || (activeMainTab === "resources" && activeResourcesSubTab);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive && !isSubTabActive
                    ? "bg-white shadow-sm text-teal-700 border border-teal-200"
                    : isActive && isSubTabActive
                    ? "bg-slate-200 text-slate-600 border border-slate-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default StaffPage;
