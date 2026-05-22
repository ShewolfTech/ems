import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import hooks from existing domain modules
import { useAcademicYears } from "@/domains/academics/academic_years/hooks/useAcademicYears.js";
import { useTerms } from "@/domains/academics/terms/hooks/useTerms.js";
import { useSubjects } from "@/domains/academics/subjects/hooks/useSubjects.js";
import { useGradeLevels } from "@/domains/academics/grade_levels/hooks/useGradeLevels.js";
import { useCurricula } from "@/domains/academics/curricula/hooks/useCurricula.js";
import { useStreams } from "@/domains/academics/streams/hooks/useStreams.js";
import { useLessons } from "@/domains/academics/lessons/hooks/useLessons.js";
import api from "@/utils/api.js";

const TABS = [
  { id: "years", label: "Academic Years", icon: "📅" },
  { id: "terms", label: "Terms", icon: "📚" },
  { id: "subjects", label: "Subjects", icon: "📝" },
  { id: "grade_levels", label: "Grade Levels", icon: "🎓" },
  { id: "curricula", label: "Curricula", icon: "📖" },
  { id: "streams", label: "Streams", icon: "🔀" },
  { id: "lessons", label: "Lessons", icon: "📋" },
];

export function AcademicsSetupPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("years");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [lessonDropdowns, setLessonDropdowns] = useState({ classes: [], subjects: [], staff: [], terms: [] });
  const [dropdownData, setDropdownData] = useState({ academicYears: [], curricula: [], gradeLevels: [] });

  // Load data for each tab
  const years = useAcademicYears({ autoFetch: activeTab === "years" });
  const terms = useTerms({ autoFetch: activeTab === "terms" });
  const subjects = useSubjects({ autoFetch: activeTab === "subjects" });
  const gradeLevels = useGradeLevels({ autoFetch: activeTab === "grade_levels" });
  const curricula = useCurricula({ autoFetch: activeTab === "curricula" });
  const streams = useStreams({ autoFetch: activeTab === "streams" });
  const lessons = useLessons({ autoFetch: activeTab === "lessons" });

  // Load dropdown data for lessons tab
  React.useEffect(() => {
    if (activeTab === "lessons") {
      Promise.all([
        api.get("/academics/classes").then(r => {
          const d = r.data?.data;
          return Array.isArray(d) ? d : [];
        }),
        api.get("/academics/subjects").then(r => {
          const d = r.data?.data;
          return Array.isArray(d) ? d : [];
        }),
        api.get("/staffmgt/staff").then(r => {
          const d = r.data?.data;
          return Array.isArray(d) ? d : [];
        }),
        api.get("/academics/terms").then(r => {
          const d = r.data?.data;
          return Array.isArray(d) ? d : [];
        }),
      ]).then(([cls, subs, stf, trms]) => {
        setLessonDropdowns({ classes: cls, subjects: subs, staff: stf, terms: trms });
      }).catch(console.error);
    }
  }, [activeTab]);

  // Load dropdown data for form fields
  React.useEffect(() => {
    if (activeTab === "terms" || activeTab === "subjects" || activeTab === "streams") {
      Promise.all([
        activeTab === "terms" ? api.get("/academics/academic-years").then(r => {
          const d = r.data?.data;
          return Array.isArray(d) ? d : [];
        }) : Promise.resolve(dropdownData.academicYears),
        activeTab === "subjects" ? api.get("/academics/curricula").then(r => {
          const d = r.data?.data;
          return Array.isArray(d) ? d : [];
        }) : Promise.resolve(dropdownData.curricula),
        (activeTab === "subjects" || activeTab === "streams") ? api.get("/academics/grade-levels").then(r => {
          const d = r.data?.data;
          return Array.isArray(d) ? d : [];
        }) : Promise.resolve(dropdownData.gradeLevels),
      ]).then(([yrs, curs, gls]) => {
        setDropdownData({
          academicYears: activeTab === "terms" ? yrs : dropdownData.academicYears,
          curricula: activeTab === "subjects" ? curs : dropdownData.curricula,
          gradeLevels: (activeTab === "subjects" || activeTab === "streams") ? gls : dropdownData.gradeLevels,
        });
      }).catch(console.error);
    }
  }, [activeTab]);

  const tabMap: Record<string, any> = {
    years,
    terms,
    subjects,
    grade_levels: gradeLevels,
    curricula,
    streams,
    lessons,
  };

  const current = tabMap[activeTab];

  const handleEdit = (item: any) => {
    const editData = { ...item };
    // Ensure ID fields are present for foreign keys
    if (item.class_id !== undefined) editData.class_id = item.class_id;
    if (item.subject_id !== undefined) editData.subject_id = item.subject_id;
    if (item.teacher_id !== undefined) editData.teacher_id = item.teacher_id;
    if (item.term_id !== undefined) editData.term_id = item.term_id;
    setEditingItem(editData);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };
  const columns: Record<string, { key: string; label: string }[]> = {
    years: [
      { key: "name", label: "Name" },
      { key: "start_date", label: "Start" },
      { key: "end_date", label: "End" },
      { key: "is_current", label: "Current" },
      { key: "is_active", label: "Active" },
    ],
    terms: [
      { key: "academic_year_name", label: "Academic Year" },
      { key: "name", label: "Term" },
      { key: "code", label: "Code" },
      { key: "start_date", label: "Start" },
      { key: "end_date", label: "End" },
      { key: "is_active", label: "Active" },
    ],
    subjects: [
      { key: "name", label: "Name" },
      { key: "code", label: "Code" },
      { key: "curriculum_name", label: "Curriculum" },
      { key: "grade_level_name", label: "Grade Level" },
      { key: "is_core", label: "Core" },
      { key: "is_active", label: "Active" },
    ],
    grade_levels: [
      { key: "name", label: "Name" },
      { key: "code", label: "Code" },
      { key: "display_order", label: "Order" },
      { key: "is_active", label: "Active" },
    ],
    curricula: [
      { key: "name", label: "Name" },
      { key: "code", label: "Code" },
      { key: "is_active", label: "Active" },
    ],
    streams: [
      { key: "name", label: "Name" },
      { key: "code", label: "Code" },
      { key: "display_order", label: "Order" },
      { key: "is_active", label: "Active" },
    ],
    lessons: [
      { key: "title", label: "Title" },
      { key: "class_name", label: "Class" },
      { key: "subject_name", label: "Subject" },
      { key: "teacher_first_name", label: "Teacher" },
      { key: "term_name", label: "Term" },
      { key: "scheduled_date", label: "Date" },
      { key: "start_time", label: "Start" },
      { key: "end_time", label: "End" },
      { key: "room", label: "Room" },
      { key: "is_active", label: "Active" },
    ],
  };

  const handleSave = async (data: any) => {
    if (!current?.save) return;
    try {
      await current.save(data);
      current.reload();
    } catch (e: any) {
      alert("Failed: " + (e.message || e));
    }
  };

  const handleDelete = async (id: number, item?: any) => {
    if (!current?.remove) return;
    const itemName = item?.name || "this item";
    if (!window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) return;
    try {
      await current.remove(id);
      current.reload();
    } catch (e: any) {
      alert("Failed: " + (e.message || e));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Academic Setup</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage academic years, terms, subjects, and other reference data
          </p>
        </div>
        <button
          onClick={() => navigate("/academics")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
        >
          ← Back to Academics
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Loading */}
          {current?.loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <>
              {/* Add/Edit Form */}
              {editingItem ? (
                <AddForm tab={activeTab} onSave={handleSave} editItem={editingItem} onCancel={handleCancelEdit} lessonDropdowns={lessonDropdowns} dropdownData={dropdownData} />
              ) : (
                <AddForm tab={activeTab} onSave={handleSave} lessonDropdowns={lessonDropdowns} dropdownData={dropdownData} />
              )}

              {/* Data Table */}
              {current?.data && current.data.length > 0 ? (
                <div className="overflow-x-auto mt-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {columns[activeTab]?.map((col) => (
                          <th
                            key={col.key}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            {col.label}
                          </th>
                        ))}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {current.data.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {columns[activeTab]?.map((col) => (
                            <td key={col.key} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {col.key === "is_current" ? (
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    item[col.key] ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {item[col.key] ? "★ Current" : "No"}
                                </span>
                              ) : col.key === "is_active" ? (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    item[col.key] ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {item[col.key] ? "Active" : "Inactive"}
                                </span>
                              ) : col.key.includes("date") ? (
                                item[col.key] ? new Date(item[col.key]).toLocaleDateString() : "—"
                              ) : (
                                item[col.key] ?? "—"
                              )}
                            </td>
                          ))}
                          <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No {TABS.find(t => t.id === activeTab)?.label?.toLowerCase()} found. Add one above.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple inline add/edit form based on tab
function AddForm({ tab, onSave, editItem, onCancel, lessonDropdowns, dropdownData }: { tab: string; onSave: (data: any) => void; editItem?: any; onCancel?: () => void; lessonDropdowns?: any; dropdownData?: any }) {
  if (!lessonDropdowns) lessonDropdowns = { classes: [], subjects: [], staff: [], terms: [] };
  if (!dropdownData) dropdownData = { academicYears: [], curricula: [], gradeLevels: [] };
  const [form, setForm] = useState<any>(editItem || {});
  const [showForm, setShowForm] = useState(false);
  const [timeError, setTimeError] = useState("");

  React.useEffect(() => {
    if (editItem) {
      setForm({ ...editItem });
      setShowForm(true);
    }
  }, [editItem]);

  const fields: Record<string, { key: string; label: string; type?: string; required?: boolean }[]> = {
    years: [
      { key: "name", label: "Name (e.g. 2028 Academic Year)", required: true },
      { key: "start_date", label: "Start Date", type: "date", required: true },
      { key: "end_date", label: "End Date", type: "date", required: true },
      { key: "is_current", label: "Current Year", type: "checkbox" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    terms: [
      { key: "academic_year_id", label: "Academic Year", type: "select_academic_year", required: true },
      { key: "name", label: "Term Name (e.g. Term 1)", required: true },
      { key: "code", label: "Code (e.g. T1)", required: true },
      { key: "start_date", label: "Start Date", type: "date", required: true },
      { key: "end_date", label: "End Date", type: "date", required: true },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    subjects: [
      { key: "name", label: "Name", required: true },
      { key: "code", label: "Code", required: true },
      { key: "curriculum_id", label: "Curriculum", type: "select_curriculum", required: true },
      { key: "grade_level_id", label: "Grade Level", type: "select_grade_level", required: true },
      { key: "is_core", label: "Core Subject", type: "checkbox" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    grade_levels: [
      { key: "name", label: "Name (e.g. Primary 1)", required: true },
      { key: "code", label: "Code (e.g. P1)", required: true },
      { key: "display_order", label: "Display Order", type: "number" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    curricula: [
      { key: "name", label: "Name", required: true },
      { key: "code", label: "Code", required: true },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    streams: [
      { key: "name", label: "Name (e.g. Stream A)", required: true },
      { key: "code", label: "Code (e.g. A)", required: true },
      { key: "grade_level_id", label: "Grade Level", type: "select_grade_level", required: true },
      { key: "display_order", label: "Display Order", type: "number" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    lessons: [
      { key: "name", label: "Title", required: true },
      { key: "class_id", label: "Class", type: "select_class", required: true },
      { key: "subject_id", label: "Subject", type: "select_subject", required: true },
      { key: "teacher_id", label: "Teacher", type: "select_teacher", required: true },
      { key: "term_id", label: "Term", type: "select_term" },
      { key: "scheduled_date", label: "Scheduled Date", type: "date", required: true },
      { key: "start_time", label: "Start Time", type: "time", required: true },
      { key: "end_time", label: "End Time", type: "time", required: true },
      { key: "room", label: "Room" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
  };

  const tabFields = fields[tab] || [];
  const isEditing = !!editItem;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };

    // Validate lesson times
    if (tab === "lessons" && payload.start_time && payload.end_time) {
      if (payload.end_time <= payload.start_time) {
        setTimeError("End time must be after start time");
        return;
      }
      setTimeError("");
    }

    if (payload.is_core) payload.is_core = payload.is_core === true || payload.is_core === "on";
    if (payload.is_active === undefined) payload.is_active = true;
    else payload.is_active = payload.is_active === true || payload.is_active === "on";
    if (payload.display_order) payload.display_order = Number(payload.display_order);
    if (payload.academic_year_id) payload.academic_year_id = Number(payload.academic_year_id);
    if (payload.curriculum_id) payload.curriculum_id = Number(payload.curriculum_id);
    if (payload.grade_level_id) payload.grade_level_id = Number(payload.grade_level_id);
    // Convert lesson foreign keys to numbers
    if (payload.class_id) payload.class_id = Number(payload.class_id);
    if (payload.subject_id) payload.subject_id = Number(payload.subject_id);
    if (payload.teacher_id) payload.teacher_id = Number(payload.teacher_id);
    if (payload.term_id) payload.term_id = Number(payload.term_id);
    if (isEditing) payload.id = editItem.id;
    onSave(payload);
    setForm({});
    setShowForm(false);
    setTimeError("");
    if (onCancel) onCancel();
  };

  if (!showForm && !isEditing) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
      >
        + Add New
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">{isEditing ? "Edit Item" : "Add New"}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tabFields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={!!form[field.key]}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })}
              />
            ) : field.type === "select_class" ? (
              <select
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form[field.key] || ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              >
                <option value="">Select class...</option>
                {(lessonDropdowns.classes || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code || "—"})</option>
                ))}
              </select>
            ) : field.type === "select_subject" ? (
              <select
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form[field.key] || ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              >
                <option value="">Select subject...</option>
                {(lessonDropdowns.subjects || []).map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ""}</option>
                ))}
              </select>
            ) : field.type === "select_teacher" ? (
              <select
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form[field.key] || ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              >
                <option value="">Select teacher...</option>
                {(lessonDropdowns.staff || []).map((t: any) => (
                  <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                ))}
              </select>
            ) : field.type === "select_term" ? (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form[field.key] || ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              >
                <option value="">Select term...</option>
                {(lessonDropdowns.terms || []).map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.academic_year_name || t.code || ""})</option>
                ))}
              </select>
            ) : field.type === "select_academic_year" ? (
              <select
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form[field.key] || ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              >
                <option value="">Select academic year...</option>
                {(dropdownData.academicYears || []).map((y: any) => (
                  <option key={y.id} value={y.id}>{y.name} {y.is_current ? "(Current)" : ""}</option>
                ))}
              </select>
            ) : field.type === "select_curriculum" ? (
              <select
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form[field.key] || ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              >
                <option value="">Select curriculum...</option>
                {(dropdownData.curricula || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ""}</option>
                ))}
              </select>
            ) : field.type === "select_grade_level" ? (
              <select
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form[field.key] || ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              >
                <option value="">Select grade level...</option>
                {(dropdownData.gradeLevels || []).map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name} {g.code ? `(${g.code})` : ""}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || "text"}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form[field.key] || ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              />
            )}
          </div>
        ))}
        {timeError && (
          <div className="text-red-600 text-sm">{timeError}</div>
        )}
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          {isEditing ? "Update" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => { setShowForm(false); setForm({}); if (onCancel) onCancel(); }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AcademicsSetupPage;
