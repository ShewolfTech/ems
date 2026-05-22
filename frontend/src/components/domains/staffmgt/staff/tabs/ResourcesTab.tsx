import React, { useState } from "react";
import { Button } from "@/components/domains/aacommon/index.js";
import { Briefcase, Shield, FileText, TrendingUp, GraduationCap, Settings, Plus } from "lucide-react";
import { ModuleOverviewPage } from "../../common/ModuleOverviewPage.js";

type SubTabType = "departments" | "roles" | "contracts" | "performance" | "training";

export function ResourcesTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("departments");

  const subTabs = [
    {
      id: "departments" as SubTabType,
      label: "Departments",
      icon: Briefcase,
      description: "Manage organizational departments"
    },
    {
      id: "roles" as SubTabType,
      label: "Roles",
      icon: Shield,
      description: "Define staff roles and permissions"
    },
    {
      id: "contracts" as SubTabType,
      label: "Contracts",
      icon: FileText,
      description: "Employment contracts and agreements"
    },
    {
      id: "performance" as SubTabType,
      label: "Performance",
      icon: TrendingUp,
      description: "Track staff performance metrics"
    },
    {
      id: "training" as SubTabType,
      label: "Training",
      icon: GraduationCap,
      description: "Professional development programs"
    }
  ];

  const renderSubTabContent = () => {
    const tabConfig = {
      departments: {
        title: "Departments Management",
        description: "Create and manage organizational departments and their hierarchies",
        fetcher: async () => {
          // TODO: Implement API call to fetch departments
          return { data: [] };
        }
      },
      roles: {
        title: "Roles & Permissions",
        description: "Define staff roles, responsibilities, and access permissions",
        fetcher: async () => {
          // TODO: Implement API call to fetch roles
          return { data: [] };
        }
      },
      contracts: {
        title: "Employment Contracts",
        description: "Manage employment contracts, terms, and legal agreements",
        fetcher: async () => {
          // TODO: Implement API call to fetch contracts
          return { data: [] };
        }
      },
      performance: {
        title: "Performance Management",
        description: "Track staff performance, reviews, and development goals",
        fetcher: async () => {
          // TODO: Implement API call to fetch performance data
          return { data: [] };
        }
      },
      training: {
        title: "Training & Development",
        description: "Manage professional development programs and certifications",
        fetcher: async () => {
          // TODO: Implement API call to fetch training data
          return { data: [] };
        }
      }
    };

    const config = tabConfig[activeSubTab];

    return (
      <ModuleOverviewPage
        title={config.title}
        description={config.description}
        fetcher={config.fetcher}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row gap-2 p-1 bg-slate-100 rounded-2xl">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-white text-cyan-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="text-left hidden sm:block">
                <div>{tab.label}</div>
                <div className="text-xs font-normal opacity-70">{tab.description}</div>
              </div>
              <div className="text-center sm:hidden">
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-tab Content */}
      <div className="min-h-[400px]">
        {renderSubTabContent()}
      </div>
    </div>
  );
}