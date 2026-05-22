import React, { useState, useEffect } from "react";
import { Button } from "@/components/domains/aacommon/index.js";
import { Users, UserCheck, Calendar, Briefcase, Shield, FileText, TrendingUp, GraduationCap, Plus, Search, Filter, Download, Upload, Building2, MapPin } from "lucide-react";
import { StaffList } from "../StaffList.js";
import { StaffForm } from "../StaffForm.js";
import { StaffDetail } from "../StaffDetail.js";
import { ModuleOverviewPage } from "../../common/ModuleOverviewPage.js";
import { TransferModal } from "../modals/TransferModal.js";
import { PromoteModal } from "../modals/PromoteModal.js";
import { getStaffList, getDepartments, getStaffRoles, saveStaff, removeStaff, transferStaff, promoteStaff } from "@/domains/staffmgt/staff/services.js";

type SubTabType =
  | "staff-list"
  | "attendance"
  | "leave"
  | "departments"
  | "roles"
  | "contracts"
  | "performance"
  | "training";

export function ManagementTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("staff-list");
  const [viewMode, setViewMode] = useState<"list" | "detail" | "form">("list");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    role: "",
    employmentStatus: "",
    employmentType: ""
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (activeSubTab === "staff-list") {
      loadStaffData();
    }
  }, [activeSubTab, searchTerm, filters]);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [departmentsData, rolesData] = await Promise.all([getDepartments(), getStaffRoles()]);
      setDepartments(departmentsData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Failed to load staff metadata:", error);
    }
  };

  const loadStaffData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filters.department) params.department_id = filters.department;
      if (filters.role) params.role_id = filters.role;
      if (filters.employmentStatus) params.employment_status = filters.employmentStatus;
      if (filters.employmentType) params.employment_type = filters.employmentType;

      const result = await getStaffList(params);
      setStaffData(result.items);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to load staff data:", error);
      setStaffData([]);
      setPagination({ page: 1, limit: 15, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  const subTabs = [
    {
      id: "staff-list" as SubTabType,
      label: "Staff List",
      icon: Users,
      description: "View and manage all staff members",
      group: "Staff Management"
    },
    {
      id: "attendance" as SubTabType,
      label: "Attendance",
      icon: UserCheck,
      description: "Track daily attendance records",
      group: "Staff Management"
    },
    {
      id: "leave" as SubTabType,
      label: "Leave Management",
      icon: Calendar,
      description: "Manage leave requests and approvals",
      group: "Staff Management"
    },
    {
      id: "departments" as SubTabType,
      label: "Departments",
      icon: Briefcase,
      description: "Manage organizational departments",
      group: "Resources"
    },
    {
      id: "roles" as SubTabType,
      label: "Roles",
      icon: Shield,
      description: "Define staff roles and permissions",
      group: "Resources"
    },
    {
      id: "contracts" as SubTabType,
      label: "Contracts",
      icon: FileText,
      description: "Employment contracts and agreements",
      group: "Resources"
    },
    {
      id: "performance" as SubTabType,
      label: "Performance",
      icon: TrendingUp,
      description: "Track staff performance metrics",
      group: "Resources"
    },
    {
      id: "training" as SubTabType,
      label: "Training",
      icon: GraduationCap,
      description: "Professional development programs",
      group: "Resources"
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

    try {
      await removeStaff(id);
      await loadStaffData();
    } catch (error) {
      console.error("Failed to delete staff member:", error);
      // TODO: Show error message to user
    }
  };

  const handlePersistence = async (formData: any) => {
    try {
      await saveStaff({ ...selectedItem, ...formData });
      await loadStaffData();
      setViewMode("list");
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save staff member:", error);
      // TODO: Show error message to user
    }
  };

  const handleTransfer = async (formData: any) => {
    setActionLoading(true);
    try {
      await transferStaff(formData);
      await loadStaffData();
      setShowTransferModal(false);
      setSelectedItem(null);
      // TODO: Show success message to user
    } catch (error) {
      console.error("Failed to transfer staff member:", error);
      // TODO: Show error message to user
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = async (formData: any) => {
    setActionLoading(true);
    try {
      await promoteStaff(formData);
      await loadStaffData();
      setShowPromoteModal(false);
      setSelectedItem(null);
      // TODO: Show success message to user
    } catch (error) {
      console.error("Failed to promote staff member:", error);
      // TODO: Show error message to user
    } finally {
      setActionLoading(false);
    }
  };

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "staff-list":
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                      <select
                        value={filters.department}
                        onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                      >
                        <option value="">All Departments</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>{department.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                      <select
                        value={filters.role}
                        onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                      >
                        <option value="">All Roles</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Employment Status</label>
                      <select
                        value={filters.employmentStatus}
                        onChange={(e) => setFilters(prev => ({ ...prev, employmentStatus: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Employment Type</label>
                      <select
                        value={filters.employmentType}
                        onChange={(e) => setFilters(prev => ({ ...prev, employmentType: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                      >
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
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                      <p className="text-slate-600">Loading staff members...</p>
                    </div>
                  ) : staffData.length > 0 ? (
                    <StaffList
                      data={staffData}
                      loading={loading}
                      onSelect={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  ) : (
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
                  )}
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
                  <div className="mt-6 flex justify-center gap-4 flex-wrap">
                    <Button
                      onClick={() => handleDelete(selectedItem.id)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => {
                        setShowTransferModal(true);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      Transfer
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPromoteModal(true);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold flex items-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Promote
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

      case "departments":
      case "roles":
      case "contracts":
      case "performance":
      case "training":
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

      default:
        return null;
    }
  };

  // Group tabs by category
  const groupedTabs = subTabs.reduce((acc, tab) => {
    if (!acc[tab.group]) {
      acc[tab.group] = [];
    }
    acc[tab.group].push(tab);
    return acc;
  }, {} as Record<string, typeof subTabs>);

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      {Object.entries(groupedTabs).map(([groupName, tabs]) => (
        <div key={groupName} className="space-y-3">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">{groupName}</h3>
          <div className="flex flex-col sm:flex-row gap-2 p-1 bg-slate-100 rounded-2xl">
            {tabs.map((tab) => {
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
        </div>
      ))}

      {/* Sub-tab Content */}
      <div className="min-h-[400px]">
        {renderSubTabContent()}
      </div>

      {/* Transfer Modal */}
      <TransferModal
        staff={selectedItem}
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSubmit={handleTransfer}
        loading={actionLoading}
      />

      {/* Promote Modal */}
      <PromoteModal
        staff={selectedItem}
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        onSubmit={handlePromote}
        loading={actionLoading}
      />
    </div>
  );
}