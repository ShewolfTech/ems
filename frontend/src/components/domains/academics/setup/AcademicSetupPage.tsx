import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, BookOpen, Settings, Users, Clock,
  ChevronRight, Plus, X, Download, Save, Loader2,
  CheckCircle, AlertCircle, Trash2, Upload, Scale
} from "lucide-react";
import { CSVImportModal } from "@/components/common/CSVImportModal";
import { BulkCreateForm } from "./BulkCreateForm";
import { EditModal } from "./EditModal";
import { Pagination } from "@/components/common/Pagination";
import { bulkCreateAcademicYears } from "@/domains/academics/academic_years/services";
import { bulkCreateTerms } from "@/domains/academics/terms/services";
import { bulkCreateSubjects } from "@/domains/academics/subjects/services";
import { bulkCreateGradeLevels } from "@/domains/academics/grade_levels/services";
import { bulkCreateClasses } from "@/domains/academics/classes/services";
import { bulkCreateStreams } from "@/domains/academics/streams/services";
import { bulkCreateCurricula } from "@/domains/academics/curricula/services";
import { useAcademicYears } from "@/domains/academics/academic_years/hooks/useAcademicYears";
import { useTerms } from "@/domains/academics/terms/hooks/useTerms";
import { useSubjects } from "@/domains/academics/subjects/hooks/useSubjects";
import { useGradeLevels } from "@/domains/academics/grade_levels/hooks/useGradeLevels";
import { useClasses } from "@/domains/academics/classes/hooks/useClasses";
import { useStreams } from "@/domains/academics/streams/hooks/useStreams";
import { useCurricula } from "@/domains/academics/curricula/hooks/useCurricula";

const tabs = [
  { id: "years", label: "Academic Years", icon: <Calendar className="w-4 h-4" /> },
  { id: "terms", label: "Terms", icon: <Clock className="w-4 h-4" /> },
  { id: "subjects", label: "Subjects", icon: <BookOpen className="w-4 h-4" /> },
  { id: "grades", label: "Class Levels", icon: <Settings className="w-4 h-4" /> },
  { id: "curricula", label: "Curricula", icon: <BookOpen className="w-4 h-4" /> },
  { id: "streams", label: "Streams", icon: <Users className="w-4 h-4" /> },
  { id: "classes", label: "Classes", icon: <Users className="w-4 h-4" /> },
  { id: "grading", label: "Grading Scales", icon: <Scale className="w-4 h-4" /> },
];

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
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

export function AcademicSetupPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("years");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingEntityType, setEditingEntityType] = useState<"years" | "terms" | "subjects" | "grades" | "curricula" | "streams" | "classes">("years");
  const [bulkFormEntity, setBulkFormEntity] = useState<"years" | "terms" | "subjects" | "grades" | "curricula" | "streams" | "classes">("years");
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
  const academicYears = useAcademicYears({ autoFetch: activeTab === "years" });
  const terms = useTerms({ autoFetch: activeTab === "terms" });
  const subjects = useSubjects({ autoFetch: activeTab === "subjects" });
  const gradeLevels = useGradeLevels({ autoFetch: activeTab === "grades" });
  const curricula = useCurricula({ autoFetch: activeTab === "curricula" });
  const streams = useStreams({ autoFetch: activeTab === "streams" });
  const classes = useClasses({ autoFetch: activeTab === "classes" });

  const showToast = (message: string, type: string = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // Handle delete operations
  const handleDelete = async (entity: string, id: number, reloadFn: () => void, name?: string) => {
    const entityLabels: Record<string, string> = {
      years: "Academic Year",
      terms: "Term",
      subjects: "Subject",
      grades: "Class Level",
      curricula: "Curriculum",
      streams: "Stream",
      classes: "Class",
    };
    
    const label = entityLabels[entity] || "Record";
    const itemName = name ? `"${name}"` : `this ${label.toLowerCase()}`;
    
    if (!confirm(`Are you sure you want to delete ${itemName}? This action cannot be undone.`)) return;

    try {
      // Import delete functions dynamically
      if (entity === "years") {
        const { removeAcademicYears } = await import("@/domains/academics/academic_years/services");
        await removeAcademicYears(id);
      } else if (entity === "terms") {
        const { removeTerms } = await import("@/domains/academics/terms/services");
        await removeTerms(id);
      } else if (entity === "subjects") {
        const { removeSubjects } = await import("@/domains/academics/subjects/services");
        await removeSubjects(id);
      } else if (entity === "grades") {
        const { removeGradeLevels } = await import("@/domains/academics/grade_levels/services");
        await removeGradeLevels(id);
      } else if (entity === "curricula") {
        const { removeCurricula } = await import("@/domains/academics/curricula/services");
        await removeCurricula(id);
      } else if (entity === "streams") {
        const { removeStreams } = await import("@/domains/academics/streams/services");
        await removeStreams(id);
      } else if (entity === "classes") {
        const { removeClasses } = await import("@/domains/academics/classes/services");
        await removeClasses(id);
      }

      showToast(`${label} ${itemName} deleted successfully!`, "success");
      reloadFn();
    } catch (error: any) {
      showToast(error.message || "Delete failed", "error");
    }
  };

  // CSV Import configurations for each entity
  const csvConfigs: Record<string, { columns: any[]; importFn: (data: any[]) => Promise<any> }> = {
    years: {
      columns: [
        { key: "name", label: "Name", required: true, example: "2026 Academic Year" },
        { key: "code", label: "Code", required: true, example: "AY2026" },
        { key: "start_date", label: "Start Date", required: true, example: "2026-01-15" },
        { key: "end_date", label: "End Date", required: true, example: "2026-12-15" },
        { key: "is_current", label: "Is Current", required: false, example: "true" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateAcademicYears
    },
    terms: {
      columns: [
        { key: "name", label: "Name", required: true, example: "Term 1" },
        { key: "code", label: "Code", required: true, example: "T1" },
        { key: "academic_year_id", label: "Academic Year ID", required: true, example: "1" },
        { key: "start_date", label: "Start Date", required: true, example: "2026-03-01" },
        { key: "end_date", label: "End Date", required: true, example: "2026-06-30" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateTerms
    },
    subjects: {
      columns: [
        { key: "name", label: "Name", required: true, example: "Mathematics" },
        { key: "code", label: "Code", required: true, example: "MTH" },
        { key: "description", label: "Description", required: false, example: "Core mathematics" },
        { key: "subject_area", label: "Subject Area", required: false, example: "Sciences" },
        { key: "is_core", label: "Is Core", required: false, example: "true" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateSubjects
    },
    grades: {
      columns: [
        { key: "name", label: "Name", required: true, example: "Primary 1" },
        { key: "code", label: "Code", required: true, example: "P1" },
        { key: "education_level", label: "Education Level", required: false, example: "Primary" },
        { key: "order_no", label: "Order Number", required: false, example: "1" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateGradeLevels
    },
    classes: {
      columns: [
        { key: "name", label: "Name", required: true, example: "Primary 1 A" },
        { key: "code", label: "Code", required: true, example: "P1A" },
        { key: "grade_level_id", label: "Grade Level ID", required: true, example: "1" },
        { key: "curriculum_id", label: "Curriculum ID", required: false, example: "1" },
        { key: "capacity", label: "Capacity", required: false, example: "45" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateClasses
    },
    streams: {
      columns: [
        { key: "name", label: "Name", required: true, example: "Stream A" },
        { key: "code", label: "Code", required: true, example: "A" },
        { key: "description", label: "Description", required: false, example: "Science stream" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateStreams
    },
    curricula: {
      columns: [
        { key: "name", label: "Name", required: true, example: "National Curriculum" },
        { key: "code", label: "Code", required: true, example: "NC" },
        { key: "description", label: "Description", required: false, example: "National curriculum framework" },
        { key: "is_active", label: "Is Active", required: false, example: "true" },
      ],
      importFn: bulkCreateCurricula
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

  const openBulkForm = (entityType: "years" | "terms" | "subjects" | "grades" | "curricula" | "streams" | "classes") => {
    setBulkFormEntity(entityType);
    setShowBulkForm(true);
  };

  const openEditModal = (entityType: "years" | "terms" | "subjects" | "grades" | "curricula" | "streams" | "classes", item: any) => {
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

  // Form state for Classes
  const [classForm, setClassForm] = useState({ code: "", name: "", grade: "", capacity: "" });
  const [bulkClasses, setBulkClasses] = useState([{ prefix: "", grade: "", streams: "" }]);

  // Form state for Timetables
  const [timetableForm, setTimetableForm] = useState({ class: "", term: "", teacher: "", subjects: [] });
  const [bulkTimetables, setBulkTimetables] = useState([{ class: "", term: "" }]);

  const handleSaveClass = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast("Class created successfully!");
    setShowModal(false);
    setClassForm({ code: "", name: "", grade: "", capacity: "" });
    setSaving(false);
  };

  const handleBulkCreateClasses = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast(`Created ${bulkClasses.length * 2} classes successfully!`);
    setShowBulkModal(false);
    setBulkClasses([{ prefix: "", grade: "", streams: "" }]);
    setSaving(false);
  };

  const handleSaveTimetable = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast("Timetable created successfully!");
    setShowModal(false);
    setTimetableForm({ class: "", term: "", teacher: "", subjects: [] });
    setSaving(false);
  };

  const handleBulkCreateTimetables = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast(`Created ${bulkTimetables.length} timetables successfully!`);
    setShowBulkModal(false);
    setBulkTimetables([{ class: "", term: "" }]);
    setSaving(false);
  };

  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  const openBulkModal = (type: string) => {
    setModalType(type);
    setShowBulkModal(true);
  };

  const renderModalContent = () => {
    if (modalType === "class") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class Code *</label>
            <input
              type="text"
              value={classForm.code}
              onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
              placeholder="e.g., P1A, S2B"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class Name *</label>
            <input
              type="text"
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              placeholder="e.g., Primary 1 A"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Grade Level *</label>
            <select
              value={classForm.grade}
              onChange={(e) => setClassForm({ ...classForm, grade: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select grade level...</option>
              <option value="Primary 1">Primary 1</option>
              <option value="Primary 2">Primary 2</option>
              <option value="Primary 3">Primary 3</option>
              <option value="Secondary 1">Secondary 1</option>
              <option value="Secondary 2">Secondary 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Student Capacity</label>
            <input
              type="number"
              value={classForm.capacity}
              onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })}
              placeholder="e.g., 45"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClass}
              disabled={saving || !classForm.code || !classForm.name}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Class"}
            </button>
          </div>
        </div>
      );
    }

    if (modalType === "timetable") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class *</label>
            <select
              value={timetableForm.class}
              onChange={(e) => setTimetableForm({ ...timetableForm, class: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select class...</option>
              <option value="Primary 1 A">Primary 1 A</option>
              <option value="Primary 1 B">Primary 1 B</option>
              <option value="Primary 2 A">Primary 2 A</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Term *</label>
            <select
              value={timetableForm.term}
              onChange={(e) => setTimetableForm({ ...timetableForm, term: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select term...</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTimetable}
              disabled={saving || !timetableForm.class}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Timetable"}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderBulkModalContent = () => {
    if (modalType === "class") {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Enter class prefix (e.g., "P1"), grade level, and number of streams to automatically generate classes (P1A, P1B, P1C, etc.)
            </p>
          </div>
          {bulkClasses.map((item, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Class Prefix</label>
                <input
                  type="text"
                  value={item.prefix}
                  onChange={(e) => {
                    const updated = [...bulkClasses];
                    updated[idx].prefix = e.target.value;
                    setBulkClasses(updated);
                  }}
                  placeholder="e.g., P1, S2"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Grade Level</label>
                <select
                  value={item.grade}
                  onChange={(e) => {
                    const updated = [...bulkClasses];
                    updated[idx].grade = e.target.value;
                    setBulkClasses(updated);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                >
                  <option value="">Select...</option>
                  <option value="Primary 1">Primary 1</option>
                  <option value="Primary 2">Primary 2</option>
                  <option value="Secondary 1">Secondary 1</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">No. of Streams</label>
                <input
                  type="number"
                  value={item.streams}
                  onChange={(e) => {
                    const updated = [...bulkClasses];
                    updated[idx].streams = e.target.value;
                    setBulkClasses(updated);
                  }}
                  placeholder="e.g., 3"
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => setBulkClasses([...bulkClasses, { prefix: "", grade: "", streams: "" }])}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Add Another Row
          </button>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowBulkModal(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkCreateClasses}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Creating..." : `Create ${bulkClasses.length} Class Groups`}
            </button>
          </div>
        </div>
      );
    }

    if (modalType === "timetable") {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Select multiple classes and terms to generate timetables in bulk.
            </p>
          </div>
          {bulkTimetables.map((item, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
                <select
                  value={item.class}
                  onChange={(e) => {
                    const updated = [...bulkTimetables];
                    updated[idx].class = e.target.value;
                    setBulkTimetables(updated);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                >
                  <option value="">Select class...</option>
                  <option value="Primary 1 A">Primary 1 A</option>
                  <option value="Primary 1 B">Primary 1 B</option>
                  <option value="Primary 2 A">Primary 2 A</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Term</label>
                <select
                  value={item.term}
                  onChange={(e) => {
                    const updated = [...bulkTimetables];
                    updated[idx].term = e.target.value;
                    setBulkTimetables(updated);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                >
                  <option value="">Select term...</option>
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
            </div>
          ))}
          <button
            onClick={() => setBulkTimetables([...bulkTimetables, { class: "", term: "" }])}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Add Another Row
          </button>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowBulkModal(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkCreateTimetables}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Creating..." : `Create ${bulkTimetables.length} Timetables`}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "years":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Academic Years</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => openBulkForm("years")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Academic Year
                </button>
                <button 
                  onClick={() => openCSVImport("years")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>
            
            {academicYears.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : academicYears.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Academic Years Yet</h4>
                <p className="text-slate-600 mb-4">Get started by importing data or creating a new academic year</p>
                <button 
                  onClick={() => openCSVImport("years")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">End Date</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginateData(academicYears.data).paginated.map((year: any) => (
                      <tr key={year.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{year.name}</td>
                        <td className="px-4 py-3 font-mono text-xs">{year.code || "-"}</td>
                        <td className="px-4 py-3">{year.start_date ? new Date(year.start_date).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-3">{year.end_date ? new Date(year.end_date).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {year.is_current ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">★ Current</span>
                          ) : year.is_active ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => openEditModal("years", year)} 
                              className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors" 
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete("years", year.id, academicYears.reload, year.name)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors" 
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
                totalPages={paginateData(academicYears.data).totalPages}
                startRecord={paginateData(academicYears.data).startRecord}
                endRecord={paginateData(academicYears.data).endRecord}
                totalRecords={paginateData(academicYears.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "terms":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Terms</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => openBulkForm("terms")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Term
                </button>
                <button 
                  onClick={() => openCSVImport("terms")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>
            
            {terms.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : terms.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Clock className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Terms Yet</h4>
                <p className="text-slate-600 mb-4">Create terms for your academic years</p>
                <button 
                  onClick={() => openBulkForm("terms")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> Bulk Submissions Entry
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Academic Year</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">End Date</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginateData(terms.data).paginated.map((term: any) => (
                      <tr key={term.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{term.code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{term.name}</td>
                        <td className="px-4 py-3 text-slate-600">{term.academic_year_name || "-"}</td>
                        <td className="px-4 py-3">{term.start_date ? new Date(term.start_date).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-3">{term.end_date ? new Date(term.end_date).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {term.is_active ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEditModal("terms", term)} 
                              className="text-teal-600 hover:text-teal-800 transition-colors" 
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete("terms", term.id, terms.reload, term.name)}
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
                totalPages={paginateData(terms.data).totalPages}
                startRecord={paginateData(terms.data).startRecord}
                endRecord={paginateData(terms.data).endRecord}
                totalRecords={paginateData(terms.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "subjects":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Subjects</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => openBulkForm("subjects")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Subject
                </button>
                <button
                  onClick={() => openCSVImport("subjects")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>
            
            {subjects.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : subjects.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Subjects Yet</h4>
                <p className="text-slate-600 mb-4">Create subjects for your curriculum</p>
                <button 
                  onClick={() => openBulkForm("subjects")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Subject
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Subject Area</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Core</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginateData(subjects.data).paginated.map((subj: any) => (
                      <tr key={subj.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{subj.code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{subj.name}</td>
                        <td className="px-4 py-3 text-slate-600">{subj.subject_area || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {subj.is_core ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Core</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Elective</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {subj.is_active ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEditModal("subjects", subj)} 
                              className="text-teal-600 hover:text-teal-800 transition-colors" 
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete("subjects", subj.id, subjects.reload, subj.name)}
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
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(subjects.data).totalPages}
                startRecord={paginateData(subjects.data).startRecord}
                endRecord={paginateData(subjects.data).endRecord}
                totalRecords={paginateData(subjects.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "grades":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Class Levels</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => openBulkForm("grades")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Class Level
                </button>
                <button
                  onClick={() => openCSVImport("grades")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-teal-800">
                <strong>Class Levels</strong> define educational stages (e.g., Primary 1, Secondary 2). 
                For exam grading scales (A, B, C...), see the <button onClick={() => setActiveTab("grading")} className="underline font-semibold hover:text-teal-900">Grading Scales</button> tab.
              </p>
            </div>
            
            {gradeLevels.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : gradeLevels.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Settings className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Class Levels Yet</h4>
                <p className="text-slate-600 mb-4">Define your educational stages</p>
                <button 
                  onClick={() => openBulkForm("grades")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Class Level
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Level Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Education Level</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Order</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginateData(gradeLevels.data).paginated.map((level: any) => (
                      <tr key={level.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{level.code || "-"}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{level.name}</td>
                        <td className="px-4 py-3 text-slate-600">{level.education_level || "-"}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{level.order_no || "-"}</td>
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
                              onClick={() => openEditModal("grades", level)} 
                              className="text-teal-600 hover:text-teal-800 transition-colors" 
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete("grades", level.id, gradeLevels.reload, level.name)}
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
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(gradeLevels.data).totalPages}
                startRecord={paginateData(gradeLevels.data).startRecord}
                endRecord={paginateData(gradeLevels.data).endRecord}
                totalRecords={paginateData(gradeLevels.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "curricula":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Curricula</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => openBulkForm("curricula")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Curriculum
                </button>
                <button
                  onClick={() => openCSVImport("curricula")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>
            
            {curricula.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : curricula.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Curricula Yet</h4>
                <p className="text-slate-600 mb-4">Define your curriculum frameworks</p>
                <button 
                  onClick={() => openBulkForm("curricula")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Curriculum
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
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginateData(curricula.data).paginated.map((curr: any) => (
                      <tr key={curr.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{curr.code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{curr.name}</td>
                        <td className="px-4 py-3 text-slate-600">{curr.description || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {curr.is_active ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEditModal("curricula", curr)} 
                              className="text-teal-600 hover:text-teal-800 transition-colors" 
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete("curricula", curr.id, curricula.reload, curr.name)}
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
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(curricula.data).totalPages}
                startRecord={paginateData(curricula.data).startRecord}
                endRecord={paginateData(curricula.data).endRecord}
                totalRecords={paginateData(curricula.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "streams":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Streams</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => openBulkForm("streams")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Stream
                </button>
                <button 
                  onClick={() => openCSVImport("streams")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>
            {streams.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : streams.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Streams Yet</h4>
                <p className="text-slate-600 mb-4">Define streams for your classes</p>
                <button
                  onClick={() => openBulkForm("streams")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Stream
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
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginateData(streams.data).paginated.map((stream: any) => (
                      <tr key={stream.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{stream.code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{stream.name}</td>
                        <td className="px-4 py-3 text-slate-600">{stream.description || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {stream.is_active ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal("streams", stream)}
                              className="text-teal-600 hover:text-teal-800 transition-colors"
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete("streams", stream.id, streams.reload, stream.name)}
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
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(streams.data).totalPages}
                startRecord={paginateData(streams.data).startRecord}
                endRecord={paginateData(streams.data).endRecord}
                totalRecords={paginateData(streams.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "grading":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Grading Scales & Configuration</h3>
              <button 
                onClick={() => navigate("/academics/grading-configurations")}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Settings className="w-4 h-4" /> Manage Grading Configuration
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Scale className="w-8 h-8 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">Grading Scale Management</h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Configure grading scales, category weights, and calculation methods for your school.
                    Grading configurations define how student performance is evaluated and reported.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <h5 className="font-semibold text-blue-900 mb-2">Grade Scale</h5>
                      <p className="text-sm text-blue-800">A+, A, A-, B+, B, B-, C+, C, C-, D, F</p>
                      <p className="text-xs text-blue-600 mt-1">13-point grading scale with GPA points</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <h5 className="font-semibold text-blue-900 mb-2">Category Weights</h5>
                      <p className="text-sm text-blue-800">Assessments: 30%, Exams: 50%, Assignments: 20%</p>
                      <p className="text-xs text-blue-600 mt-1">Customizable weight distribution</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate("/academics/grading-configurations")}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Open Grading Configurations →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "classes":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Classes & Streams</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => openBulkForm("classes")}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Class
                </button>
                <button 
                  onClick={() => openCSVImport("classes")}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
              </div>
            </div>
            {classes.loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : classes.data?.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">No Classes Yet</h4>
                <p className="text-slate-600 mb-4">Create classes for your school</p>
                <button
                  onClick={() => openBulkForm("classes")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> New Class
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Grade Level</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Students</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginateData(classes.data).paginated.map((cls: any) => (
                      <tr key={cls.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{cls.code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{cls.name}</td>
                        <td className="px-4 py-3 text-slate-600">{cls.grade_level_name || "-"}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{cls.student_count || 0}</td>
                        <td className="px-4 py-3 text-center">
                          {cls.is_active ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal("classes", cls)}
                              className="text-teal-600 hover:text-teal-800 transition-colors"
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete("classes", cls.id, classes.reload, cls.name)}
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
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(classes.data).totalPages}
                startRecord={paginateData(classes.data).startRecord}
                endRecord={paginateData(classes.data).endRecord}
                totalRecords={paginateData(classes.data).totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
            )}
          </div>
        );
      case "timetables":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Timetable Management</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => openBulkModal("timetable")}
                  className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4" /> Bulk Create
                </button>
                <button
                  onClick={() => openModal("timetable")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" /> New Timetable
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Term</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Lessons</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { class: "Primary 1 A", term: "Term 1", lessons: 30, status: "Active" },
                    { class: "Primary 1 B", term: "Term 1", lessons: 30, status: "Active" },
                    { class: "Primary 2 A", term: "Term 1", lessons: 28, status: "Draft" },
                  ].map((tt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{tt.class}</td>
                      <td className="px-4 py-3 text-slate-600">{tt.term}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{tt.lessons}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tt.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center"><ChevronRight className="w-4 h-4 mx-auto text-slate-400" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
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
                  Academic Setup
                </h1>
                <p className="text-slate-600 mt-2">Configure academic structure, subjects, and scheduling</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-blue-700'
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

      {/* Single Item Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === "class" ? "Create New Class" : "Create New Timetable"}
      >
        {renderModalContent()}
      </Modal>

      {/* Bulk Create Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title={modalType === "class" ? "Bulk Create Classes" : "Bulk Create Timetables"}
      >
        {renderBulkModalContent()}
      </Modal>

      {/* CSV Import Modal */}
      <CSVImportModal
        entityName={
          csvEntity === "years" ? "Academic Years" :
          csvEntity === "terms" ? "Terms" :
          csvEntity === "subjects" ? "Subjects" :
          csvEntity === "grades" ? "Grade Levels" :
          csvEntity === "classes" ? "Classes" :
          csvEntity === "streams" ? "Streams" :
          csvEntity === "curricula" ? "Curricula" :
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
            if (bulkFormEntity === "years") academicYears.reload();
            else if (bulkFormEntity === "terms") terms.reload();
            else if (bulkFormEntity === "subjects") subjects.reload();
            else if (bulkFormEntity === "grades") gradeLevels.reload();
            else if (bulkFormEntity === "curricula") curricula.reload();
            else if (bulkFormEntity === "streams") streams.reload();
            else if (bulkFormEntity === "classes") classes.reload();
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
            if (editingEntityType === "years") academicYears.reload();
            else if (editingEntityType === "terms") terms.reload();
            else if (editingEntityType === "subjects") subjects.reload();
            else if (editingEntityType === "grades") gradeLevels.reload();
            else if (editingEntityType === "curricula") curricula.reload();
            else if (editingEntityType === "streams") streams.reload();
            else if (editingEntityType === "classes") classes.reload();
          }}
          onClose={() => { setShowEditModal(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}

export default AcademicSetupPage;
