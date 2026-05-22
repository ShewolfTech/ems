import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Users, Building2, Briefcase, GraduationCap, FileText,
  Calendar, Settings, ChevronRight, Plus, X, Download, Save, Loader2,
  CheckCircle, AlertCircle, Trash2, Upload
} from "lucide-react";
import { CSVImportModal } from "@/components/common/CSVImportModal";
import { BulkCreateForm } from "./BulkCreateForm";
import { EditModal } from "./EditModal";
import { Pagination } from "@/components/common/Pagination";
import { bulkCreateDepartments } from "@/domains/staffmgt/departments/services";
import { bulkCreateStaff } from "@/domains/staffmgt/staff/services";
import { bulkCreateRoles } from "@/domains/staffmgt/staffmgt_roles/services";
import { bulkCreateEmploymentTypes } from "@/domains/staffmgt/employment_types/services";
import { bulkCreateEducationLevels } from "@/domains/staffmgt/education_levels/services";
import { useDepartments } from "@/domains/staffmgt/departments/hooks/useDepartments";
import { useStaff } from "@/domains/staffmgt/staff/hooks/useStaff";
import { useRoles } from "@/domains/staffmgt/staffmgt_roles/hooks/useRoles";
import { useEmploymentTypes } from "@/domains/staffmgt/employment_types/hooks/useEmploymentTypes";
import { useEducationLevels } from "@/domains/staffmgt/education_levels/hooks/useEducationLevels";

const tabs = [
  { id: "staff", label: "Staff", icon: <User className="w-4 h-4" /> },
  { id: "departments", label: "Departments", icon: <Building2 className="w-4 h-4" /> },
  { id: "roles", label: "Roles", icon: <Briefcase className="w-4 h-4" /> },
  { id: "employment_types", label: "Employment Types", icon: <FileText className="w-4 h-4" /> },
  { id: "education_levels", label: "Education Levels", icon: <GraduationCap className="w-4 h-4" /> },
];

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-teal-50">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Success/Error Toast
const Toast = ({ message, type, onClose }: any) => {
  if (!message) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg border ${
      type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
    </div>
  );
};

export function StaffSetupPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("staff");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingEntityType, setEditingEntityType] = useState<"staff" | "departments" | "roles" | "employment_types" | "education_levels">("departments");
  const [bulkFormEntity, setBulkFormEntity] = useState<"staff" | "departments" | "roles" | "employment_types" | "education_levels">("departments");
  const [modalType, setModalType] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [csvEntity, setCSVEntity] = useState("");
  const [csvColumns, setCSVColumns] = useState<{ key: string; label: string; required?: boolean; example?: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Helper to paginate data
  const paginateData = (data: any[] | undefined) => {
    if (!data) return { paginated: [], totalPages: 1, hasPrev: false, hasNext: false };
    const totalPages = Math.ceil(data.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return {
      paginated: data.slice(start, end),
      totalPages,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
      startRecord: start + 1,
      endRecord: Math.min(end, data.length),
      totalRecords: data.length,
    };
  };

  // Fetch real data from API
  const departments = useDepartments({ autoFetch: activeTab === "departments" });
  const staff = useStaff({ autoFetch: activeTab === "staff" });
  const roles = useRoles({ autoFetch: activeTab === "roles" });
  const employmentTypes = useEmploymentTypes({ autoFetch: activeTab === "employment_types" });
  const educationLevels = useEducationLevels({ autoFetch: activeTab === "education_levels" });

  const showToast = (message: string, type: string = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // Handle delete operations
  const handleDelete = async (entity: string, id: number, reloadFn: () => void, name?: string) => {
    const entityLabels: Record<string, string> = {
      departments: "Department",
      staff: "Staff Member",
      roles: "Role",
      employment_types: "Employment Type",
      education_levels: "Education Level",
    };

    const label = entityLabels[entity] || "Record";
    const itemName = name ? `"${name}"` : `this ${label.toLowerCase()}`;

    if (!confirm(`Are you sure you want to delete ${itemName}? This action cannot be undone.`)) return;

    try {
      // Import delete functions dynamically
      if (entity === "departments") {
        const { removeDepartments } = await import("@/domains/staffmgt/departments/services");
        await removeDepartments(id);
      } else if (entity === "staff") {
        const { removeStaff } = await import("@/domains/staffmgt/staff/services");
        await removeStaff(id);
      } else if (entity === "roles") {
        const { removeRoles } = await import("@/domains/staffmgt/staffmgt_roles/services");
        await removeRoles(id);
      } else if (entity === "employment_types") {
        const { removeEmploymentTypes } = await import("@/domains/staffmgt/employment_types/services");
        await removeEmploymentTypes(id);
      } else if (entity === "education_levels") {
        const { removeEducationLevels } = await import("@/domains/staffmgt/education_levels/services");
        await removeEducationLevels(id);
      }

      showToast(`${label} ${itemName} deleted successfully!`, "success");
      reloadFn();
    } catch (error: any) {
      showToast(error.message || "Delete failed", "error");
    }
  };

  // CSV Import configurations for each entity
  const csvConfigs: Record<string, { columns: any[]; importFn: (data: any[]) => Promise<any> }> = {
    departments: {
      columns: [
        { key: "name", label: "Name", required: true, example: "Human Resources" },
        { key: "code", label: "Code", required: true, example: "HR" },
        { key: "manager_name", label: "Manager Name", required: false, example: "John Smith" },
        { key: "budget", label: "Budget", required: false, example: "250000" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateDepartments
    },
    staff: {
      columns: [
        { key: "first_name", label: "First Name", required: true, example: "Jane" },
        { key: "last_name", label: "Last Name", required: true, example: "Johnson" },
        { key: "email", label: "Email", required: true, example: "jane.johnson@example.com" },
        { key: "phone", label: "Phone", required: false, example: "+1234567890" },
        { key: "gender", label: "Gender", required: false, example: "Female" },
        { key: "birth_date", label: "Birth Date", required: false, example: "1990-05-15" },
        { key: "hire_date", label: "Hire Date", required: true, example: "2023-01-15" },
        { key: "department_id", label: "Department ID", required: false, example: "5" },
        { key: "role_id", label: "Role ID", required: false, example: "3" },
        { key: "employment_type", label: "Employment Type", required: false, example: "Full-time" },
        { key: "salary", label: "Salary", required: false, example: "75000" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateStaff
    },
    roles: {
      columns: [
        { key: "name", label: "Name", required: true, example: "Senior Developer" },
        { key: "code", label: "Code", required: true, example: "SENIOR_DEV" },
        { key: "description", label: "Description", required: false, example: "Experienced developer role" },
        { key: "grade", label: "Grade", required: false, example: "Grade 7" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateRoles
    },
    employment_types: {
      columns: [
        { key: "title", label: "Title", required: true, example: "Full-Time" },
        { key: "code", label: "Code", required: true, example: "FT" },
        { key: "description", label: "Description", required: false, example: "Permanent employment" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateEmploymentTypes
    },
    education_levels: {
      columns: [
        { key: "title", label: "Title", required: true, example: "Bachelor's Degree" },
        { key: "code", label: "Code", required: true, example: "BD" },
        { key: "description", label: "Description", required: false, example: "4-year undergraduate degree" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateEducationLevels
    }
  };

  const openCSVImport = (entityType: string) => {
    const config = csvConfigs[entityType];
    if (!config) {
      showToast("CSV import not configured for this entity", "error");
      return;
    }
    setCSVEntity(entityType);
    setCSVColumns(config.columns);
    setShowCSVImport(true);
  };

  const openBulkForm = (entityType: "staff" | "departments" | "roles" | "employment_types" | "education_levels") => {
    setBulkFormEntity(entityType);
    setShowBulkForm(true);
  };

  const openEditModal = (entityType: "staff" | "departments" | "roles" | "employment_types" | "education_levels", item: any) => {
    setEditingEntityType(entityType);
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleCSVImport = async (data: any[]) => {
    const config = csvConfigs[csvEntity];
    if (!config) throw new Error("Import configuration not found");

    try {
      const result = await config.importFn(data);
      showToast(`Successfully imported ${result.data?.success || data.length} records!`, "success");
      return result.data;
    } catch (error: any) {
      showToast(error.message || "Import failed", "error");
      throw error;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "departments":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Departments</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => openBulkForm("departments")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Department
                </button>
                <button
                  onClick={() => openCSVImport("departments")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>

            {departments.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : departments.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Departments Yet</h4>
                <p className="text-slate-600 mb-4">Define your organizational structure</p>
                <button
                  onClick={() => openBulkForm("departments")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Department
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Manager</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Employees</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginateData(departments.data).paginated.map((dept: any) => (
                      <tr key={dept.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{dept.code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{dept.name}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{dept.manager_name || "-"}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{dept.staff_count || 0}</td>
                        <td className="px-4 py-3 text-center">
                          {dept.is_active ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal("departments", dept)}
                              className="text-teal-600 hover:text-teal-800 transition-colors"
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete("departments", dept.id, departments.reload, dept.name)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(departments.data).totalPages}
                startRecord={paginateData(departments.data).startRecord}
                endRecord={paginateData(departments.data).endRecord}
                totalRecords={paginateData(departments.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "staff":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Staff Members</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/staffmgt/staff")}
                  className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50"
                >
                  <Users className="w-4 h-4" /> Manage Staff Hub
                </button>
                <button
                  onClick={() => openCSVImport("staff")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>

            {staff.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : staff.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <User className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Staff Yet</h4>
                <p className="text-slate-600 mb-4">Add your first staff members to get started</p>
                <button
                  onClick={() => navigate("/staffmgt/staff")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <User className="w-4 h-4" /> Manage Staff Hub
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Employee #</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Department</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Role</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Employment</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginateData(staff.data).paginated.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{s.employee_no || "-"}</td>
                        <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                        <td className="px-4 py-3 text-slate-600">{s.department_name || "-"}</td>
                        <td className="px-4 py-3 text-center">{s.role_name || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {s.employment_type ? 
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold capitalize">
                              {s.employment_type.split('_').join(' ')}
                            </span> : 
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">—</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.is_active ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/staffmgt/staff/${s.id}`)}
                              className="text-teal-600 hover:text-teal-800 transition-colors"
                              title="View"
                            >
                              <User className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete("staff", s.id, staff.reload, `${s.first_name} ${s.last_name}`)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(staff.data).totalPages}
                startRecord={paginateData(staff.data).startRecord}
                endRecord={paginateData(staff.data).endRecord}
                totalRecords={paginateData(staff.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "roles":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Roles</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => openBulkForm("roles")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Role
                </button>
                <button
                  onClick={() => openCSVImport("roles")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>

            {roles.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : roles.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Roles Yet</h4>
                <p className="text-slate-600 mb-4">Define staff roles and responsibilities</p>
                <button
                  onClick={() => openBulkForm("roles")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Role
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Grade</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginateData(roles.data).paginated.map((role: any) => (
                      <tr key={role.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{role.code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{role.name}</td>
                        <td className="px-4 py-3 text-slate-600">{role.description || "-"}</td>
                        <td className="px-4 py-3 text-center">{role.grade || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {role.is_active ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal("roles", role)}
                              className="text-teal-600 hover:text-teal-800 transition-colors"
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete("roles", role.id, roles.reload, role.name)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(roles.data).totalPages}
                startRecord={paginateData(roles.data).startRecord}
                endRecord={paginateData(roles.data).endRecord}
                totalRecords={paginateData(roles.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "employment_types":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Employment Types</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => openBulkForm("employment_types")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Type
                </button>
                <button
                  onClick={() => openCSVImport("employment_types")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>

            {employmentTypes.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : employmentTypes.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Employment Types Yet</h4>
                <p className="text-slate-600 mb-4">Define types of employment positions</p>
                <button
                  onClick={() => openBulkForm("employment_types")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Type
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginateData(employmentTypes.data).paginated.map((type: any) => (
                      <tr key={type.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{type.code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{type.title}</td>
                        <td className="px-4 py-3 text-slate-600">{type.description || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {type.is_active ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal("employment_types", type)}
                              className="text-teal-600 hover:text-teal-800 transition-colors"
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete("employment_types", type.id, employmentTypes.reload, type.title)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(employmentTypes.data).totalPages}
                startRecord={paginateData(employmentTypes.data).startRecord}
                endRecord={paginateData(employmentTypes.data).endRecord}
                totalRecords={paginateData(employmentTypes.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "education_levels":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Education Levels</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => openBulkForm("education_levels")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Level
                </button>
                <button
                  onClick={() => openCSVImport("education_levels")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>

            {educationLevels.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : educationLevels.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <GraduationCap className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Education Levels Yet</h4>
                <p className="text-slate-600 mb-4">Define educational qualifications</p>
                <button
                  onClick={() => openBulkForm("education_levels")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Level
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginateData(educationLevels.data).paginated.map((level: any) => (
                      <tr key={level.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{level.code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{level.title}</td>
                        <td className="px-4 py-3 text-slate-600">{level.description || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {level.is_active ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal("education_levels", level)}
                              className="text-teal-600 hover:text-teal-800 transition-colors"
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete("education_levels", level.id, educationLevels.reload, level.title)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(educationLevels.data).totalPages}
                startRecord={paginateData(educationLevels.data).startRecord}
                endRecord={paginateData(educationLevels.data).endRecord}
                totalRecords={paginateData(educationLevels.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 p-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-teal-600 hover:bg-cyan-50 rounded-lg transition-colors"
                title="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <Settings className="w-8 h-8 text-teal-600" />
                  Staff Configuration
                </h1>
                <p className="text-slate-600 mt-2">Configure staff structure, departments, and employment details</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
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

          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal
        entityName={
          csvEntity === "departments" ? "Departments" :
          csvEntity === "staff" ? "Staff" :
          csvEntity === "roles" ? "Roles" :
          csvEntity === "employment_types" ? "Employment Types" :
          csvEntity === "education_levels" ? "Education Levels" :
          "Records"
        }
        columns={csvColumns}
        onImport={handleCSVImport}
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
      />

      {/* Bulk Create Form (Form-based entry like Assignments) */}
      {showBulkForm && (
        <BulkCreateForm
          entityType={bulkFormEntity}
          onSave={() => {
            setShowBulkForm(false);
            // Reload data for the active tab
            if (bulkFormEntity === "departments") departments.reload();
            else if (bulkFormEntity === "staff") staff.reload();
            else if (bulkFormEntity === "roles") roles.reload();
            else if (bulkFormEntity === "employment_types") employmentTypes.reload();
            else if (bulkFormEntity === "education_levels") educationLevels.reload();
          }}
          onClose={() => setShowBulkForm(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <EditModal
          entityType={editingEntityType}
          item={editingItem}
          onSave={() => {
            setShowEditModal(false);
            setEditingItem(null);
            // Reload data for the active tab
            if (editingEntityType === "departments") departments.reload();
            else if (editingEntityType === "staff") staff.reload();
            else if (editingEntityType === "roles") roles.reload();
            else if (editingEntityType === "employment_types") employmentTypes.reload();
            else if (editingEntityType === "education_levels") educationLevels.reload();
          }}
          onClose={() => { setShowEditModal(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}

export default StaffSetupPage;