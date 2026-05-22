import React, { useState } from "react";
import { Button } from "@/components/domains/aacommon/index.js";
import { Users, UserCheck, Calendar, Plus, Search, Filter, Download, Upload } from "lucide-react";
import { StaffList } from "../StaffList.js";
import { StaffForm } from "../StaffForm.js";
import { StaffDetail } from "../StaffDetail.js";

type SubTabType = "list" | "attendance" | "leave";

export function StaffTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("list");
  const [viewMode, setViewMode] = useState<"list" | "detail" | "form">("list");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const subTabs = [
    {
      id: "list" as SubTabType,
      label: "Staff List",
      icon: Users,
      description: "View and manage all staff members"
    },
    {
      id: "attendance" as SubTabType,
      label: "Attendance",
      icon: UserCheck,
      description: "Track daily attendance records"
    },
    {
      id: "leave" as SubTabType,
      label: "Leave Management",
      icon: Calendar,
      description: "Manage leave requests and approvals"
    }
  ];

  const handleView = (item: any) => {
    setSelectedItem(item);
    setViewMode("detail");
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setViewMode("form");
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setViewMode("form");
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) return;
    // TODO: Implement delete logic
    console.log("Delete staff member:", id);
  };

  const handlePersistence = async (formData: any) => {
    // TODO: Implement save logic
    console.log("Save staff member:", formData);
    setViewMode("list");
    setSelectedItem(null);
  };

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "list":
        return (
          <div className="space-y-6">
            {/* Search & Filters Bar */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, employee number..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                  />
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="secondary"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 border-2 ${showFilters ? 'border-teal-600 bg-teal-50 text-teal-600' : 'border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-600'}`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="bg-white rounded-xl p-6 border-2 border-teal-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                      <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white">
                        <option value="">All Departments</option>
                        {/* TODO: Populate departments */}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Employment Status</label>
                      <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white">
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Employment Type</label>
                      <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white">
                        <option value="">All Types</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Staff List */}
            {viewMode === "list" && (
              <div className="bg-white rounded-xl border-2 border-teal-200 shadow-sm">
                <div className="p-6 border-b border-teal-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Staff Members</h3>
                      <p className="text-sm text-slate-600">Manage your teaching and administrative staff</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="secondary" className="px-4 py-2 border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="secondary" className="px-4 py-2 border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleCreate}
                        className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Staff Member
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {/* TODO: Replace with actual StaffList component when data is available */}
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-600 mb-2">No Staff Members Yet</h4>
                    <p className="text-slate-500 mb-6">Get started by adding your first staff member</p>
                    <Button
                      onClick={handleCreate}
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold px-6 py-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Staff Member
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Staff Detail Modal */}
            {viewMode === "detail" && selectedItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="w-full max-w-6xl max-h-[90vh] relative">
                  <StaffDetail
                    item={selectedItem}
                    onClose={() => { setViewMode("list"); setSelectedItem(null); }}
                  />
                  <div className="mt-6 flex justify-center gap-4">
                    <Button
                      onClick={() => handleDelete(selectedItem.id)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => handleEdit(selectedItem)}
                      className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold"
                    >
                      Edit Details
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Staff Form Modal */}
            {viewMode === "form" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="w-full max-w-6xl max-h-[90vh]">
                  <StaffForm
                    initialData={selectedItem}
                    onSave={handlePersistence}
                    onClose={() => { setViewMode("list"); setSelectedItem(null); }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "attendance":
        return (
          <div className="bg-white rounded-xl p-6 border-2 border-teal-200 shadow-sm">
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-600 mb-2">Attendance Management</h4>
              <p className="text-slate-500">Track and manage daily staff attendance records</p>
            </div>
          </div>
        );

      case "leave":
        return (
          <div className="bg-white rounded-xl p-6 border-2 border-teal-200 shadow-sm">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-600 mb-2">Leave Management</h4>
              <p className="text-slate-500">Manage leave requests, approvals, and balances</p>
            </div>
          </div>
        );

      default:
        return null;
    }
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