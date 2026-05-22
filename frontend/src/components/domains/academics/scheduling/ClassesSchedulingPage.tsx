import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Calendar, BookOpen, Clock, ChevronRight, Plus, ArrowLeft, Loader2,
  Settings, UserCheck, GraduationCap, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Upload, FileText, Search, ArrowRight, UserPlus, X, Download, Database, AlertCircle
} from "lucide-react";
import { useClasses } from "@/domains/academics/classes/hooks/useClasses";
import { useTimetables } from "@/domains/academics/timetables/hooks/useTimetables";
import { useLessons } from "@/domains/academics/lessons/hooks/useLessons";
import { useLessonDeliveries } from "@/domains/academics/lesson_deliveries/hooks/useLessonDeliveries";
import { BulkCreateForm } from "../setup/BulkCreateForm";
import { CSVImportModal } from "@/components/common/CSVImportModal";
import { Pagination } from "@/components/common/Pagination";
import api from "@/utils/api.js";

const tabs = [
  { id: "classes", label: "Class Rosters", icon: <Users className="w-4 h-4" /> },
  { id: "timetables", label: "Timetables", icon: <Calendar className="w-4 h-4" /> },
  { id: "lessons", label: "Lessons", icon: <BookOpen className="w-4 h-4" /> },
  { id: "deliveries", label: "Lesson Deliveries", icon: <Clock className="w-4 h-4" /> },
];

export function ClassesSchedulingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("classes");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showCreateTimetable, setShowCreateTimetable] = useState(false);
  const [showImportTimetable, setShowImportTimetable] = useState(false);
  const [viewTimetableId, setViewTimetableId] = useState<number | null>(null);
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [showImportLessons, setShowImportLessons] = useState(false);
  const [showAddDelivery, setShowAddDelivery] = useState(false);
  const [showImportDeliveries, setShowImportDeliveries] = useState(false);
  const [deliveryActionModal, setDeliveryActionModal] = useState<any>(null); // { delivery, action }
  const [deliveryComments, setDeliveryComments] = useState("");
  const [deliveryActionState, setDeliveryActionState] = useState("delivered");
  const [lessonSearch, setLessonSearch] = useState("");
  const [timetableSearch, setTimetableSearch] = useState("");
  const [timetablePage, setTimetablePage] = useState(1);

  // Fetch real data
  const classes = useClasses({ autoFetch: activeTab === "classes" });
  const timetables = useTimetables({ autoFetch: activeTab === "timetables" });
  const lessons = useLessons({ autoFetch: activeTab === "lessons" });
  const deliveries = useLessonDeliveries({ autoFetch: activeTab === "deliveries" });

  const pageSize = 50;

  const paginateData = (data: any[] | undefined) => {
    if (!data) return { paginated: [], totalPages: 1, hasPrev: false, hasNext: false, startRecord: 0, endRecord: 0, totalRecords: 0 };
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

  const filteredData = useMemo(() => {
    if (!searchTerm) return classes.data || [];
    return (classes.data || []).filter((item: any) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [classes.data, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Auto-generate lessons from timetables when Lessons tab is active
  useEffect(() => {
    if (activeTab !== "lessons") return;
    
    const generateLessonsFromTimetables = async () => {
      try {
        const ttRes = await api.get("/academics/timetables");
        const allTimetables = ttRes.data?.data || [];
        if (allTimetables.length === 0) return;
        
        const today = new Date().toISOString().split('T')[0];
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        let createdCount = 0;
        const startDate = new Date(startOfWeek);
        const endDate = new Date(startOfWeek);
        endDate.setDate(endDate.getDate() + 27); // 4 weeks ahead
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
          
          const existingForDate = lessons.data?.filter((l: any) => l.scheduled_date === dateStr) || [];
          if (existingForDate.length > 0) continue;
          
          for (const tt of allTimetables) {
            const entries = tt.entries || [];
            const dayEntries = entries.filter((e: any) => e.day_of_week === dayOfWeek);
            
            for (const entry of dayEntries) {
              if (entry.room?.startsWith("BREAK:")) continue;
              if (!entry.subject_id) continue;
              
              const exists = existingForDate.some(
                (l: any) => l.class_id === tt.class_id && l.subject_id === entry.subject_id && l.start_time === entry.start_time
              );
              
              if (!exists) {
                try {
                  await api.post("/academics/lessons", {
                    title: `${entry.subject_name || 'Lesson'} - ${tt.class_name || ''}`,
                    class_id: Number(tt.class_id),
                    subject_id: Number(entry.subject_id),
                    teacher_id: entry.teacher_id ? Number(entry.teacher_id) : null,
                    term_id: Number(tt.term_id),
                    scheduled_date: dateStr,
                    start_time: entry.start_time || null,
                    end_time: entry.end_time || null,
                    room: entry.room || null,
                    description: `From timetable: ${tt.name}`,
                    is_active: true,
                  });
                  createdCount++;
                } catch (err) { /* skip */ }
              }
            }
          }
        }
        
        if (createdCount > 0) lessons.reload();
      } catch (err) {
        console.error("Failed to auto-generate lessons:", err);
      }
    };
    
    generateLessonsFromTimetables();
  }, [activeTab, lessons.data]);

  const handleReload = () => {
    classes.reload();
  };

  // Auto-sync lessons when Lessons tab is opened
  useEffect(() => {
    console.log('🔍 LESSON SYNC CHECK - activeTab:', activeTab);
    if (activeTab !== "lessons") return;
    console.log('🔍 LESSON SYNC STARTING...');

    const syncTimetables = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
        const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
        
        console.log('🔄 Starting lesson sync...', { todayStr, tomorrowStr, dayOfWeek, tomorrowDay });
        
        let createdCount = 0;

        // 1. Get list of timetables
        const ttListRes = await api.get("/academics/timetables");
        const timetableList = ttListRes.data?.data || [];
        console.log(`📋 Found ${timetableList.length} timetables`);
        
        // 2. Fetch each timetable individually to get entries
        for (const ttSummary of timetableList) {
          try {
            const ttRes = await api.get(`/academics/timetables/${ttSummary.id}`);
            const tt = ttRes.data?.data;
            if (!tt || !tt.entries || tt.entries.length === 0) {
              console.log(`⏭️ Timetable ${ttSummary.id} has no entries`);
              continue;
            }
            if (!tt.term_id) continue;
            
            console.log(`📝 Timetable ${ttSummary.id}: ${tt.entries.length} entries`);
            
            // Fetch term dates
            const termRes = await api.get(`/academics/terms/${tt.term_id}`);
            const term = termRes.data?.data;
            if (!term || !term.start_date || !term.end_date) continue;
            
            const termStart = new Date(term.start_date);
            termStart.setHours(0, 0, 0, 0);
            const termEnd = new Date(term.end_date);
            termEnd.setHours(23, 59, 59, 999);
            
            console.log(`📅 Term dates: ${term.start_date} to ${term.end_date}`);
            console.log(`📅 Today in range? ${today >= termStart && today <= termEnd}`);
            console.log(`📅 Tomorrow in range? ${tomorrow >= termStart && tomorrow <= termEnd}`);

            const createLesson = async (entry: any, date: string) => {
              if (entry.room?.startsWith("BREAK:")) return;
              if (!entry.subject_id) return;
              
              const lessonDate = new Date(date);
              lessonDate.setHours(0, 0, 0, 0);
              if (lessonDate < termStart || lessonDate > termEnd) return;
              
              // Check if exists
              const exists = lessons.data?.some((l: any) => {
                const existingDate = l.scheduled_date?.substring(0, 10);
                return existingDate === date && 
                  l.class_id === tt.class_id && 
                  l.subject_id === entry.subject_id &&
                  l.start_time?.substring(0, 5) === entry.start_time?.substring(0, 5);
              });

              if (!exists) {
                try {
                  await api.post("/academics/lessons", {
                    title: `${entry.subject_name || 'Lesson'} - ${tt.class_name || ''}`,
                    class_id: Number(tt.class_id),
                    subject_id: Number(entry.subject_id),
                    teacher_id: entry.teacher_id ? Number(entry.teacher_id) : null,
                    term_id: Number(tt.term_id),
                    scheduled_date: date,
                    start_time: entry.start_time || null,
                    end_time: entry.end_time || null,
                    room: entry.room || null,
                  });
                  createdCount++;
                  console.log(`✅ Created lesson: ${entry.subject_name} on ${date}`);
                } catch (e: any) {
                  console.warn(`⚠️ Failed to create lesson:`, e.response?.data?.message || e.message);
                }
              }
            };

            // Sync Today
            for (const entry of tt.entries) {
              if (entry.day_of_week === dayOfWeek) await createLesson(entry, todayStr);
            }
            // Sync Tomorrow
            for (const entry of tt.entries) {
              if (entry.day_of_week === tomorrowDay) await createLesson(entry, tomorrowStr);
            }
          } catch (err) {
            console.error(`❌ Failed to process timetable ${ttSummary.id}:`, err);
          }
        }

        console.log(`🎉 Sync complete. Created ${createdCount} lessons`);
        if (createdCount > 0) lessons.reload();
      } catch (err) {
        console.error("❌ Failed to sync lessons:", err);
      }
    };

    syncTimetables();
    // Only run when tab changes - NOT when lessons.data changes
  }, [activeTab]);

  const renderClassesTab = () => {
    const stats = {
      totalClasses: classes.data?.length || 0,
      totalStudents: classes.data?.reduce((sum: number, c: any) => sum + (c.student_count || 0), 0) || 0,
      activeClasses: classes.data?.filter((c: any) => c.is_active).length || 0,
      avgClassSize: classes.data?.length > 0
        ? Math.round(classes.data.reduce((sum: number, c: any) => sum + (c.student_count || 0), 0) / classes.data.length)
        : 0,
    };

    return (
      <div className="space-y-6">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Classes</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalClasses}</p>
              </div>
              <Users className="w-10 h-10 text-teal-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Students</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
              </div>
              <GraduationCap className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Classes</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeClasses}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Students/Class</p>
                <p className="text-3xl font-bold text-slate-900">{stats.avgClassSize}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowBulkForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Class
          </button>
          <button
            onClick={() => setShowCSVImport(true)}
            className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Classes Table */}
        {classes.loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h4 className="font-semibold text-slate-900 mb-2">No Classes Yet</h4>
            <p className="text-slate-600">Create your first class to get started</p>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: '1200px' }}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase bg-slate-50 sticky left-0 z-10 border-b border-r border-slate-200">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Grade Level</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Curriculum</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Teacher</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Students</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Capacity</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase bg-slate-50 sticky right-0 z-10 border-b border-l border-slate-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginateData(filteredData).paginated.map((cls: any) => {
                      const capacityPercent = cls.capacity && cls.student_count
                        ? Math.round((cls.student_count / cls.capacity) * 100)
                        : 0;
                      return (
                        <tr key={cls.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs bg-white sticky left-0 z-10 border-r border-slate-100">{cls.code || "-"}</td>
                          <td className="px-4 py-3 font-medium">{cls.name}</td>
                          <td className="px-4 py-3 text-slate-600">{cls.grade_level_name || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{cls.curriculum_name || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{cls.teacher_name || "-"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {cls.student_count || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    capacityPercent > 90 ? 'bg-red-500' :
                                    capacityPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-600 w-10">{capacityPercent}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(`/academics/classes/${cls.id}`, { is_active: !cls.is_active });
                                  handleReload();
                                } catch (err) {
                                  console.error("Failed to update status:", err);
                                }
                              }}
                              className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                cls.is_active
                                  ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title={cls.is_active ? "Click to deactivate" : "Click to activate"}
                            >
                              {cls.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center bg-white sticky right-0 z-10 border-l border-slate-100">
                            <button
                              onClick={() => setSelectedClass(cls)}
                              className="text-teal-600 hover:text-teal-800 transition-colors"
                              title="Manage Class"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={paginateData(filteredData).totalPages}
              startRecord={paginateData(filteredData).startRecord}
              endRecord={paginateData(filteredData).endRecord}
              totalRecords={paginateData(filteredData).totalRecords}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Class Management Modal */}
        {selectedClass && (
          <ClassManagementModal
            cls={selectedClass}
            onClose={() => setSelectedClass(null)}
            onReload={handleReload}
          />
        )}

        {/* Bulk Create Form */}
        {showBulkForm && (
          <BulkCreateForm
            entityType="classes"
            onSave={() => { setShowBulkForm(false); handleReload(); }}
            onClose={() => setShowBulkForm(false)}
          />
        )}

        {/* CSV Import */}
        {showCSVImport && (
          <CSVImportModal
            entityName="Classes"
            columns={[
              { key: "name", label: "Name *", required: true, example: "Primary 1 A" },
              { key: "code", label: "Code *", required: true, example: "P1A" },
              { key: "grade_level_id", label: "Grade Level ID", required: false, example: "1" },
              { key: "curriculum_id", label: "Curriculum ID", required: false, example: "1" },
              { key: "capacity", label: "Capacity", required: false, example: "45" },
              { key: "is_active", label: "Active", required: false, example: "true" },
            ]}
            onImport={async (data) => {
              const result = await api.post("/academics/classes/bulk", data);
              handleReload();
              return result.data;
            }}
            isOpen={showCSVImport}
            onClose={() => setShowCSVImport(false)}
          />
        )}
      </div>
    );
  };

  const renderTimetablesTab = () => {
    const filteredTimetables = timetables.data?.filter((tt: any) => {
      if (!timetableSearch) return true;
      return `${tt.name} ${tt.class_name} ${tt.term_name}`.toLowerCase().includes(timetableSearch.toLowerCase());
    }) || [];

    const paginatedTimetables = filteredTimetables.slice(
      (timetablePage - 1) * 20,
      timetablePage * 20
    );
    const totalPages = Math.ceil(filteredTimetables.length / 20);

    const stats = {
      total: timetables.data?.length || 0,
      active: timetables.data?.filter((t: any) => t.is_active).length || 0,
    };

    return (
      <div className="space-y-6">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Timetables</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Calendar className="w-10 h-10 text-teal-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Timetables</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* Action Buttons & Search */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setShowCreateTimetable(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Timetable
          </button>
          <button
            onClick={() => setShowImportTimetable(true)}
            className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button
            onClick={() => {
              // Export functionality
              const csv = "Name,Class,Term,Status\n" + (timetables.data || []).map((tt: any) => `${tt.name},${tt.class_name},${tt.term_name},${tt.is_active ? 'Active' : 'Draft'}`).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "timetables.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search timetables..."
                value={timetableSearch}
                onChange={(e) => { setTimetableSearch(e.target.value); setTimetablePage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Timetables Table */}
        {timetables.loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : filteredTimetables.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h4 className="font-semibold text-slate-900 mb-2">
              {timetables.data?.length === 0 ? "No Timetables Yet" : "No Results Found"}
            </h4>
            <p className="text-slate-600 mb-4">
              {timetables.data?.length === 0
                ? "Create your first timetable to schedule classes"
                : "Try adjusting your search terms"}
            </p>
            {timetables.data?.length === 0 && (
              <button
                onClick={() => setShowCreateTimetable(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Plus className="w-4 h-4" /> New Timetable
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase bg-slate-50 sticky left-0 z-20 border-b border-r border-slate-200">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Term</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Academic Year</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Lessons</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase bg-slate-50 sticky right-0 z-20 border-b border-l border-slate-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTimetables.map((tt: any) => (
                    <tr key={tt.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium bg-white sticky left-0 z-10 border-r border-slate-100">{tt.name}</td>
                      <td className="px-4 py-3 text-slate-600">{tt.class_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{tt.term_name || "-"}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{tt.academic_year_name || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {tt.lesson_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={async () => {
                            try {
                              await api.put(`/academics/timetables/${tt.id}`, { is_active: !tt.is_active });
                              timetables.reload();
                            } catch (err) {
                              console.error("Failed to update status:", err);
                            }
                          }}
                          className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            tt.is_active
                              ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title={tt.is_active ? "Click to deactivate" : "Click to activate"}
                        >
                          {tt.is_active ? 'Active' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewTimetableId(tt.id)}
                            className="text-teal-600 hover:text-teal-800 text-sm p-1 rounded hover:bg-teal-50"
                            title="View Timetable"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Clone "${tt.name}"? This will create a new timetable with the same class and term.`)) return;
                              try {
                                // Create new timetable first
                                const createRes = await api.post("/academics/timetables", {
                                  name: `${tt.name} (Copy)`,
                                  class_id: Number(tt.class_id),
                                  term_id: Number(tt.term_id),
                                  description: `Clone of ${tt.name}`,
                                  is_active: true,
                                });
                                
                                const newTimetableId = createRes.data?.data?.id;
                                if (!newTimetableId) {
                                  alert("Failed to create clone");
                                  return;
                                }
                                
                                // Clone entries to the new timetable
                                await api.post(`/academics/timetables/${newTimetableId}/clone`, {
                                  source_timetable_id: Number(tt.id),
                                });
                                
                                timetables.reload();
                              } catch (err: any) {
                                console.error("Failed to clone:", err);
                                alert(err.response?.data?.message || "Failed to clone timetable");
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50"
                            title="Clone"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete "${tt.name}"?\nThis will remove the timetable and all entries.`)) return;
                              try {
                                await api.delete(`/academics/timetables/${tt.id}`);
                                timetables.reload();
                              } catch (err) {
                                console.error("Failed to delete:", err);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <p className="text-sm text-slate-600">
                  Showing {(timetablePage - 1) * 20 + 1}-{Math.min(timetablePage * 20, filteredTimetables.length)} of {filteredTimetables.length} records
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimetablePage(p => Math.max(1, p - 1))}
                    disabled={timetablePage === 1}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-slate-600">
                    Page {timetablePage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setTimetablePage(p => Math.min(totalPages, p + 1))}
                    disabled={timetablePage === totalPages}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timetable Modal (Single & Bulk) */}
        {showCreateTimetable && (
          <TimetableModal
            onClose={() => setShowCreateTimetable(false)}
            onReload={timetables.reload}
          />
        )}

        {/* Timetable Viewer */}
        {viewTimetableId && (
          <TimetableViewer
            timetableId={viewTimetableId}
            onClose={() => setViewTimetableId(null)}
          />
        )}

        {/* Import CSV Modal */}
        {showImportTimetable && (
          <CSVImportModal
            entityName="Timetables"
            columns={[
              { key: "name", label: "Name *", required: true, example: "P1A Timetable" },
              { key: "class_id", label: "Class ID *", required: true, example: "1" },
              { key: "term_id", label: "Term ID *", required: true, example: "1" },
              { key: "is_active", label: "Active", required: false, example: "true" },
            ]}
            onImport={async (data) => {
              const result = await api.post("/academics/timetables/bulk", data);
              timetables.reload();
              return result.data;
            }}
            isOpen={showImportTimetable}
            onClose={() => setShowImportTimetable(false)}
          />
        )}

        {/* Lesson Modal (Single & Bulk) */}
        {showCreateLesson && (
          <LessonModal
            onClose={() => setShowCreateLesson(false)}
            onReload={lessons.reload}
          />
        )}

        {/* Import CSV Modal */}
        {showImportLessons && (
          <CSVImportModal
            entityName="Lessons"
            columns={[
              { key: "title", label: "Title *", required: true, example: "Mathematics - P1A" },
              { key: "class_id", label: "Class ID *", required: true, example: "1" },
              { key: "subject_id", label: "Subject ID *", required: true, example: "5" },
              { key: "teacher_id", label: "Teacher ID", required: false, example: "3" },
              { key: "term_id", label: "Term ID *", required: true, example: "1" },
              { key: "scheduled_date", label: "Date *", required: true, example: "2026-04-15" },
              { key: "start_time", label: "Start Time", required: false, example: "09:00:00" },
              { key: "end_time", label: "End Time", required: false, example: "10:00:00" },
              { key: "room", label: "Room", required: false, example: "Room 101" },
            ]}
            onImport={async (data) => {
              const result = await api.post("/academics/lessons/bulk", data);
              lessons.reload();
              return result.data;
            }}
            isOpen={showImportLessons}
            onClose={() => setShowImportLessons(false)}
          />
        )}
      </div>
    );
  };

  const renderLessonsTab = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const todayLessons = (lessons.data?.filter((l: any) => {
      const lessonDate = l.scheduled_date?.substring(0, 10);
      return lessonDate === todayStr;
    }) || []).filter((l: any) => {
      if (!lessonSearch) return true;
      const search = lessonSearch.toLowerCase();
      return `${l.subject_name || ''} ${l.class_name || ''} ${l.teacher_first_name || ''} ${l.teacher_last_name || ''} ${l.room || ''}`
        .toLowerCase().includes(search);
    });
    const tomorrowLessons = (lessons.data?.filter((l: any) => {
      const lessonDate = l.scheduled_date?.substring(0, 10);
      return lessonDate === tomorrowStr;
    }) || []).filter((l: any) => {
      if (!lessonSearch) return true;
      const search = lessonSearch.toLowerCase();
      return `${l.subject_name || ''} ${l.class_name || ''} ${l.teacher_first_name || ''} ${l.teacher_last_name || ''} ${l.room || ''}`
        .toLowerCase().includes(search);
    });

    return (
      <div className="space-y-6">
        {/* Stats & Search */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Daily Lessons - Quick Reference</h3>
            <p className="text-sm text-slate-600">Today's and tomorrow's lessons at a glance</p>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={lessonSearch}
                onChange={(e) => setLessonSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => lessons.reload()}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={() => setShowCreateLesson(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Lesson
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today Card */}
          <div className="bg-white rounded-xl border border-teal-200 shadow-sm">
            <div className="px-5 py-4 border-b border-teal-100 bg-teal-50/50 flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-teal-700">Today's Lessons</span>
                <div className="text-2xl font-bold text-slate-900">{todayLessons.length}</div>
                <div className="text-xs text-slate-600">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
              </div>
              <Calendar className="w-10 h-10 text-teal-600 opacity-20" />
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              {todayLessons.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">No lessons scheduled</p>
              ) : (
                <div className="space-y-3">
                  {todayLessons.map((l: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className={`w-1 h-full rounded-full ${l.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{l.subject_name || l.title}</div>
                        <div className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                          <span>⏰ {l.start_time?.substring(0, 5)} - {l.end_time?.substring(0, 5)}</span>
                          <span>📍 {l.room || '-'}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          👤 {l.teacher_first_name ? `${l.teacher_first_name} ${l.teacher_last_name}` : 'No teacher'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tomorrow Card */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
            <div className="px-5 py-4 border-b border-blue-100 bg-blue-50/50 flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-blue-700">Tomorrow's Lessons</span>
                <div className="text-2xl font-bold text-slate-900">{tomorrowLessons.length}</div>
                <div className="text-xs text-slate-600">{tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
              </div>
              <Calendar className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              {tomorrowLessons.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">No lessons scheduled</p>
              ) : (
                <div className="space-y-3">
                  {tomorrowLessons.map((l: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="w-1 h-full rounded-full bg-blue-400" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{l.subject_name || l.title}</div>
                        <div className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                          <span>⏰ {l.start_time?.substring(0, 5)} - {l.end_time?.substring(0, 5)}</span>
                          <span>📍 {l.room || '-'}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          👤 {l.teacher_first_name ? `${l.teacher_first_name} ${l.teacher_last_name}` : 'No teacher'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manual Lesson Modal */}
        {showCreateLesson && (
          <LessonModal
            onClose={() => setShowCreateLesson(false)}
            onReload={lessons.reload}
          />
        )}
      </div>
    );
  };

  // Lesson Deliveries handlers and auto-sync
  const handleGenerateDeliveries = async (showAlert = true) => {
    try {
      const { data } = await api.post("/academics/lesson-deliveries/generate", {});
      if (data.success) {
        if (showAlert) alert(`✅ Generated ${data.data.generated} lesson deliveries`);
        deliveries.reload();
        return data.data.generated;
      } else {
        if (showAlert) alert(`❌ ${data.message || "Generation failed"}`);
        return 0;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to generate deliveries";
      if (showAlert) alert(`❌ ${msg}`);
      return 0;
    }
  };

  // Auto-generate when Deliveries tab is first viewed
  useEffect(() => {
    if (activeTab === "deliveries" && (!deliveries.data || deliveries.data.length === 0)) {
      handleGenerateDeliveries(false);
    }
  }, [activeTab]);

  const handleDeliveryAction = async (delivery: any, action: string, comments: string) => {
    try {
      // The API returns delivery_id, not id
      const deliveryId = delivery.id || delivery.delivery_id;
      console.log('🔔 Updating delivery:', {
        deliveryId,
        idType: typeof deliveryId,
        subject: delivery.subject_name,
        action,
        comments
      });
      
      if (!deliveryId) {
        console.error('❌ Delivery object:', delivery);
        throw new Error(`Invalid delivery ID - got: ${deliveryId}`);
      }
      
      const numericId = Number(deliveryId);
      if (isNaN(numericId) || numericId <= 0) {
        throw new Error(`Invalid delivery ID value: ${deliveryId}`);
      }
      
      const payload: any = { status: action };
      if (comments) payload.comments = comments;
      // Remove is_delivered - the backend uses status field instead
      
      console.log('📤 PUT request to:', `/academics/lesson-deliveries/${numericId}`, payload);
      
      const response = await api.put(`/academics/lesson-deliveries/${numericId}`, payload);
      console.log('✅ Update successful:', response.data);
      
      setDeliveryActionModal(null);
      deliveries.reload();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Unknown error";
      console.error('❌ Update failed:', err.response?.data || err);
      alert(`❌ Failed to update delivery:\n${msg}`);
    }
  };

  const renderDeliveriesTab = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayDeliveries = deliveries.data?.filter((d: any) => d.scheduled_date?.substring(0, 10) === today) || [];
    const plannedDeliveries = deliveries.data?.filter((d: any) => d.status === 'planned') || [];
    const deliveredDeliveries = deliveries.data?.filter((d: any) => d.status === 'delivered') || [];
    const postponedDeliveries = deliveries.data?.filter((d: any) => d.status === 'postponed') || [];

    const stats = {
      total: deliveries.data?.length || 0,
      today: todayDeliveries.length,
      delivered: deliveredDeliveries.length,
      postponed: postponedDeliveries.length,
      planned: plannedDeliveries.length,
    };

    return (
      <div className="space-y-6">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Today's Deliveries</p>
                <p className="text-3xl font-bold text-teal-600">{stats.today}</p>
              </div>
              <BookOpen className="w-10 h-10 text-teal-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Planned</p>
                <p className="text-3xl font-bold text-blue-600">{stats.planned}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Postponed</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.postponed}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Database className="w-10 h-10 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddDelivery(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Lesson Delivery
          </button>
          <button
            onClick={() => setShowImportDeliveries(true)}
            className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button
            onClick={() => deliveries.reload()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Refresh List
          </button>
        </div>

        {/* Deliveries Table */}
        {deliveries.loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : deliveries.data?.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h4 className="font-semibold text-slate-900 mb-2">No Deliveries Yet</h4>
            <p className="text-slate-600 mb-4">Click "Generate Deliveries" to create planned lessons from your timetables</p>
            <button
              onClick={() => handleGenerateDeliveries(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <Calendar className="w-4 h-4" /> Generate Now
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase bg-slate-50 sticky left-0 z-20 border-b border-r border-slate-200">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Teacher</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Time</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Room</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase bg-slate-50 sticky right-0 z-20 border-b border-l border-slate-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveries.data?.map((delivery: any, idx: number) => (
                    <tr key={delivery.delivery_id || delivery.id || `delivery-${idx}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium bg-white sticky left-0 z-10 border-r border-slate-100">
                        {delivery.scheduled_date ? new Date(delivery.scheduled_date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{delivery.class_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{delivery.subject_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {delivery.teacher_first_name && delivery.teacher_last_name
                          ? `${delivery.teacher_first_name} ${delivery.teacher_last_name}`
                          : (delivery.teacher_name || "-")}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 whitespace-nowrap">
                        {(delivery.start_time || delivery.lesson_start_time) && (delivery.end_time || delivery.lesson_end_time)
                          ? `${(delivery.start_time || delivery.lesson_start_time).substring(0, 5)} – ${(delivery.end_time || delivery.lesson_end_time).substring(0, 5)}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{delivery.room || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          delivery.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          delivery.status === 'planned' ? 'bg-blue-100 text-blue-700' :
                          delivery.status === 'postponed' ? 'bg-yellow-100 text-yellow-700' :
                          delivery.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {delivery.status === 'delivered' ? 'Delivered' :
                           delivery.status === 'planned' ? 'Planned' :
                           delivery.status === 'postponed' ? 'Postponed' :
                           delivery.status === 'cancelled' ? 'Cancelled' :
                           delivery.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center bg-white sticky right-0 z-20 border-l border-slate-100">
                        <div className="flex items-center justify-center gap-1.5">
                          {delivery.status === 'planned' && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔘 Settings clicked for delivery:', delivery.id, delivery.subject_name);
                                setDeliveryActionModal({ delivery, action: 'update' });
                              }}
                              className="text-teal-600 hover:text-teal-800 text-xs p-1.5 rounded hover:bg-teal-50 transition-colors cursor-pointer"
                              title="Update Status"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          )}
                          {delivery.status !== 'planned' && (
                            <span className="text-slate-400 text-xs px-2">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
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
            Classroom Management
          </h1>
          <p className="text-slate-600 mt-2">Manage class rosters, timetables, lessons, and scheduling</p>
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
            {activeTab === "classes" && renderClassesTab()}
            {activeTab === "timetables" && renderTimetablesTab()}
            {activeTab === "lessons" && renderLessonsTab()}
            {activeTab === "deliveries" && renderDeliveriesTab()}
          </div>
        </div>

        {/* Delivery Action Modal - MUST be outside render functions */}
        {deliveryActionModal && (deliveryActionModal.delivery.id || deliveryActionModal.delivery.delivery_id) && (
          <DeliveryActionModal
            delivery={deliveryActionModal.delivery}
            onClose={() => setDeliveryActionModal(null)}
            onSubmit={(action, comments) => handleDeliveryAction(deliveryActionModal.delivery, action, comments)}
          />
        )}

        {/* Add Lesson Delivery Modal */}
        {showAddDelivery && (
          <AddDeliveryModal
            onClose={() => setShowAddDelivery(false)}
            onSuccess={() => {
              setShowAddDelivery(false);
              deliveries.reload();
            }}
          />
        )}

        {/* Import Deliveries CSV Modal */}
        {showImportDeliveries && (
          <CSVImportModal
            entityName="Lesson Deliveries"
            columns={[
              { key: "class_name", label: "Class Name *", required: true, example: "Primary 1 A" },
              { key: "subject_name", label: "Subject Name *", required: true, example: "Mathematics" },
              { key: "teacher_name", label: "Teacher Name", required: false, example: "John Doe" },
              { key: "scheduled_date", label: "Date *", required: true, example: "2026-04-15" },
              { key: "start_time", label: "Start Time", required: false, example: "08:00" },
              { key: "end_time", label: "End Time", required: false, example: "08:45" },
              { key: "room", label: "Room", required: false, example: "Room 101" },
              { key: "status", label: "Status", required: false, example: "planned" },
              { key: "comments", label: "Comments", required: false, example: "Extra revision session" },
            ]}
            onImport={async (data) => {
              const result = await api.post("/academics/lesson-deliveries/bulk", data);
              deliveries.reload();
              return result.data;
            }}
            isOpen={showImportDeliveries}
            onClose={() => setShowImportDeliveries(false)}
          />
        )}
      </div>
    </div>
  );
}

// Class Management Modal with tabs
function ClassManagementModal({ cls, onClose, onReload }: { cls: any; onClose: () => void; onReload: () => void }) {
  const [activeTab, setActiveTab] = useState<"students" | "teachers" | "subjects" | "attendances">("students");
  const [classDetail, setClassDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [todayTimetableEntries, setTodayTimetableEntries] = useState<any[]>([]);
  const [selectedTodayEntry, setSelectedTodayEntry] = useState<any>(null);
  const [attendanceStudents, setAttendanceStudents] = useState<any[]>([]);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [substituteTeacher, setSubstituteTeacher] = useState<string>("");
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);
  const [existingLessonId, setExistingLessonId] = useState<number | null>(null);

  useEffect(() => {
    loadClassDetail();
  }, [cls.id]);

  useEffect(() => {
    if (activeTab === "attendances") loadTodayEntries();
  }, [activeTab]);

  const loadClassDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/academics/classes/${cls.id}`);
      setClassDetail(res.data?.data || null);
    } catch (err) {
      console.error("Failed to load class detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayEntries = async () => {
    try {
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Fetch all timetables for this class
      const ttRes = await api.get("/academics/timetables");
      const timetables = ttRes.data?.data || [];
      const classTimetables = timetables.filter((tt: any) => Number(tt.class_id) === Number(cls.id));
      
      let entries: any[] = [];
      for (const tt of classTimetables) {
        const ttDetailRes = await api.get(`/academics/timetables/${tt.id}`);
        const ttDetail = ttDetailRes.data?.data;
        const ttEntries = ttDetail?.entries || [];
        
        // Filter for today's day
        const todayEntries = ttEntries
          .filter((e: any) => e.day_of_week === dayOfWeek && !e.room?.startsWith("BREAK:"))
          .map((e: any) => ({ ...e, timetable_name: tt.name, timetable_id: tt.id }));
        
        entries = [...entries, ...todayEntries];
      }
      
      // Sort by start time
      entries.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
      
      console.log(`📋 Found ${entries.length} lessons for today (${dayOfWeek})`);
      setTodayTimetableEntries(entries);
    } catch (err) {
      console.error("Failed to load today's entries:", err);
      setTodayTimetableEntries([]);
    }
  };

  const loadAttendanceForEntry = async (entry: any) => {
    try {
      setSelectedTodayEntry(entry);
      setSubstituteTeacher('');
      setHasExistingAttendance(false);
      setExistingLessonId(null);
      
      // Get students enrolled in this class using the detailed endpoint
      const classRes = await api.get(`/academics/classes/${cls.id}`);
      const classData = classRes.data?.data || {};
      const students = classData.students || [];
      
      console.log(`📋 Found ${students.length} students for class ${cls.name}`);
      
      if (students.length === 0) {
        setAttendanceStudents([]);
        return;
      }
      
      // Try to get existing attendance records for this lesson today
      const todayStr = new Date().toISOString().split('T')[0];
      const existingLessons = await api.get(`/academics/lessons`, {
        params: {
          class_id: cls.id,
          subject_id: entry.subject_id,
          scheduled_date: todayStr,
        }
      }).catch(() => ({ data: { data: [] } }));
      
      const lessonsList = existingLessons.data?.data || [];
      const existingLesson = lessonsList.find((l: any) => 
        l.subject_id === entry.subject_id && 
        l.start_time?.substring(0, 5) === entry.start_time?.substring(0, 5)
      );
      
      let existingAttendance: any[] = [];
      if (existingLesson) {
        console.log(`📝 Found existing lesson ID: ${existingLesson.id}`);
        setExistingLessonId(existingLesson.id);
        
        const attRes = await api.get(`/academics/lessons/${existingLesson.id}/attendance`).catch(() => ({ data: { data: null } }));
        existingAttendance = attRes.data?.data?.students || [];
        
        // Check if any student has attendance marked
        const hasAttendance = existingAttendance.some((a: any) => a.status);
        setHasExistingAttendance(hasAttendance);
        
        console.log(`📝 Found ${existingAttendance.length} existing attendance records, has attendance: ${hasAttendance}`);
      }
      
      // Merge students with their attendance status
      const mergedStudents = students.map((student: any) => {
        const studentId = student.student_id || student.id;
        const existing = existingAttendance.find((a: any) => Number(a.student_id) === Number(studentId));
        return {
          student_id: studentId,
          first_name: student.first_name,
          last_name: student.last_name,
          status: existing?.status || '',
          remark: existing?.remark || '',
        };
      });
      
      console.log(`✅ Loaded ${mergedStudents.length} students for attendance`);
      setAttendanceStudents(mergedStudents);
    } catch (err) {
      console.error("Failed to load attendance for entry:", err);
      setAttendanceStudents([]);
    }
  };

  const handleAttendanceSave = async () => {
    if (!selectedTodayEntry) return;
    
    // Check if there are any students with status marked
    const markedCount = attendanceStudents.filter((s: any) => s.status).length;
    if (markedCount === 0) {
      alert("⚠️ Please mark attendance for at least one student before saving.");
      return;
    }
    
    // Warn if updating existing attendance
    if (hasExistingAttendance) {
      const confirmed = confirm(
        `⚠️ Update Existing Attendance\n\n` +
        `Attendance has already been saved for this lesson.\n` +
        `This will update the records for ${attendanceStudents.length} students.\n\n` +
        `Do you want to continue?`
      );
      if (!confirmed) return;
    }
    
    setAttendanceSaving(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      let lessonId = existingLessonId;
      
      if (!lessonId) {
        // Create lesson
        const classRes = await api.get(`/academics/classes/${cls.id}`);
        const className = classRes.data?.data?.name || cls.name;
        
        const lessonRes = await api.post("/academics/lessons", {
          title: `${selectedTodayEntry.subject_name || 'Lesson'} - ${className}`,
          class_id: Number(cls.id),
          subject_id: Number(selectedTodayEntry.subject_id),
          teacher_id: selectedTodayEntry.teacher_id ? Number(selectedTodayEntry.teacher_id) : null,
          scheduled_date: todayStr,
          start_time: selectedTodayEntry.start_time || null,
          end_time: selectedTodayEntry.end_time || null,
          room: selectedTodayEntry.room || null,
          is_active: true,
        });
        lessonId = lessonRes.data?.data?.id;
      }
      
      // Save attendance
      if (lessonId) {
        console.log(`💾 ${hasExistingAttendance ? 'Updating' : 'Saving'} attendance for lesson ${lessonId}:`, markedCount, 'students marked');
        
        await api.put(`/academics/lessons/${lessonId}/attendance`, {
          records: attendanceStudents.map((s: any) => ({
            student_id: Number(s.student_id),
            status: s.status,
            remark: s.remark,
          })),
        });
        
        alert(`✅ Attendance ${hasExistingAttendance ? 'updated' : 'saved'} successfully!\n\n${markedCount}/${attendanceStudents.length} students marked.`);
        setSelectedTodayEntry(null);
        setAttendanceStudents([]);
        setHasExistingAttendance(false);
        setExistingLessonId(null);
        loadTodayEntries(); // Refresh the list
      }
    } catch (err: any) {
      console.error("Failed to save attendance:", err);
      alert(`❌ ${err.response?.data?.message || "Failed to save attendance"}`);
    } finally {
      setAttendanceSaving(false);
    }
  };

  const capacityPercent = cls.capacity && cls.student_count
    ? Math.round((cls.student_count / cls.capacity) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {cls.name} <span className="text-sm font-normal text-slate-600">({cls.code})</span>
            </h2>
            <div className="flex gap-4 mt-2 text-sm text-slate-600">
              <span>Grade: {cls.grade_level_name || "-"}</span>
              <span>Curriculum: {cls.curriculum_name || "-"}</span>
              <span>Teacher: {cls.teacher_name || "-"}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Capacity Meter */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Capacity Utilization</span>
            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  capacityPercent > 90 ? 'bg-red-500' :
                  capacityPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-900">{cls.student_count || 0} / {cls.capacity || "?"} students</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200">
          {[
            { id: "students" as const, label: "Students", icon: <Users className="w-4 h-4" />, count: classDetail?.students?.length || 0 },
            { id: "teachers" as const, label: "Teachers", icon: <UserCheck className="w-4 h-4" />, count: classDetail?.teachers?.length || 0 },
            { id: "subjects" as const, label: "Subjects", icon: <BookOpen className="w-4 h-4" />, count: classDetail?.availableSubjects?.length || 0 },
            { id: "attendances" as const, label: "Attendances", icon: <Calendar className="w-4 h-4" />, count: todayTimetableEntries?.length || 0 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-teal-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : activeTab === "students" ? (
            <StudentsTab cls={cls} classDetail={classDetail} onReload={onReload} />
          ) : activeTab === "teachers" ? (
            <TeachersTab cls={cls} classDetail={classDetail} onReload={onReload} />
          ) : activeTab === "subjects" ? (
            <SubjectsTab cls={cls} classDetail={classDetail} onReload={onReload} />
          ) : activeTab === "attendances" ? (
            <div className="space-y-4">
              {!selectedTodayEntry ? (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Today's Lessons - {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                      <p className="text-sm text-slate-600">Select a lesson to take attendance</p>
                    </div>
                    <button
                      onClick={loadTodayEntries}
                      className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
                    >
                      <Download className="w-4 h-4" /> Refresh
                    </button>
                  </div>

                  {todayTimetableEntries.length === 0 ? (
                    <div className="bg-slate-50 rounded-lg p-12 text-center">
                      <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                      <p className="text-slate-600 font-medium">No lessons scheduled for today</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Today is {new Date().toLocaleDateString('en-US', { weekday: 'long' })}. Add lessons to the timetable for this day.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayTimetableEntries.map((entry: any, idx: number) => (
                        <div
                          key={`${entry.id}-${idx}`}
                          className="bg-white rounded-lg border border-slate-200 hover:border-teal-300 transition-colors p-4 cursor-pointer"
                          onClick={() => loadAttendanceForEntry(entry)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-teal-100 rounded-lg p-3">
                              <span className="text-2xl font-bold text-teal-700">
                                {entry.start_time ? entry.start_time.substring(0, 5) : '--:--'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">{entry.subject_name || 'Lesson'}</h4>
                              <div className="flex gap-4 mt-1 text-sm text-slate-600">
                                <span>⏰ {entry.start_time?.substring(0, 5) || '-'} – {entry.end_time?.substring(0, 5) || '-'}</span>
                                <span>👤 {entry.teacher_first_name && entry.teacher_last_name ? `${entry.teacher_first_name} ${entry.teacher_last_name}` : '-'}</span>
                                <span>📍 {entry.room || '-'}</span>
                              </div>
                            </div>
                            <div className="text-teal-600">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Selected Lesson Header */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{selectedTodayEntry.subject_name || 'Lesson'}</h3>
                        <div className="flex gap-4 mt-2 text-sm text-slate-600">
                          <span>📅 {new Date().toLocaleDateString()}</span>
                          <span>⏰ {selectedTodayEntry.start_time?.substring(0, 5) || '-'} – {selectedTodayEntry.end_time?.substring(0, 5) || '-'}</span>
                          <span>👤 {selectedTodayEntry.teacher_first_name && selectedTodayEntry.teacher_last_name ? `${selectedTodayEntry.teacher_first_name} ${selectedTodayEntry.teacher_last_name}` : '-'}</span>
                          <span>📍 {selectedTodayEntry.room || '-'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTodayEntry(null);
                          setAttendanceStudents([]);
                        }}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {/* Substitute Teacher */}
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      👤 Substitute Teacher (if different from timetable)
                    </label>
                    <select
                      value={substituteTeacher}
                      onChange={(e) => setSubstituteTeacher(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Use timetable teacher</option>
                      {classDetail?.teachers?.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.first_name} {t.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setSelectedTodayEntry(null);
                        setAttendanceStudents([]);
                      }}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAttendanceSave}
                      disabled={attendanceSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                      {attendanceSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {attendanceSaving ? "Saving..." : (hasExistingAttendance ? "Update Attendance" : "Save Attendance")}
                    </button>
                  </div>

                  {/* Students Table */}
                  {attendanceStudents.length === 0 ? (
                    <div className="bg-slate-50 rounded-lg p-8 text-center">
                      <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                      <p className="text-slate-600">No students enrolled in this class</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Remark</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attendanceStudents.map((student: any, index: number) => (
                            <tr key={student.student_id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                              <td className="px-4 py-3 font-medium">{student.first_name} {student.last_name}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  {[
                                    { code: 'P', label: 'Present', color: 'green' },
                                    { code: 'A', label: 'Absent', color: 'red' },
                                    { code: 'L', label: 'Late', color: 'yellow' },
                                    { code: 'E', label: 'Excused', color: 'blue' },
                                  ].map(({ code, label, color }) => (
                                    <button
                                      key={code}
                                      onClick={() => {
                                        const updated = [...attendanceStudents];
                                        updated[index] = { ...updated[index], status: code };
                                        setAttendanceStudents(updated);
                                      }}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                        student.status === code
                                          ? `bg-${color}-500 text-white`
                                          : `bg-${color}-50 text-${color}-600 hover:bg-${color}-100`
                                      }`}
                                      title={label}
                                    >
                                      {code}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  placeholder="Optional remark..."
                                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                  value={student.remark || ''}
                                  onChange={(e) => {
                                    const updated = [...attendanceStudents];
                                    updated[index] = { ...updated[index], remark: e.target.value };
                                    setAttendanceStudents(updated);
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Students Tab Component
function StudentsTab({ cls, classDetail, onReload }: { cls: any; classDetail: any; onReload: () => void }) {
  const [showEnroll, setShowEnroll] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showBulkPromote, setShowBulkPromote] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);

  useEffect(() => {
    if (showEnroll || showTransfer || showBulkPromote) {
      api.get("/studentsmgt/students")
        .then(r => {
          const data = r.data?.data || r.data?.students || r.data || [];
          const enrolledIds = new Set((classDetail?.students || []).map((s: any) => s.student_id || s.id));
          const available = Array.isArray(data) ? data.filter((s: any) => !enrolledIds.has(s.id)) : [];
          setAvailableStudents(available);
        })
        .catch(() => setAvailableStudents([]));

      api.get("/academics/classes")
        .then(r => {
          const data = r.data?.data || r.data?.classes || r.data || [];
          setAllClasses(Array.isArray(data) ? data.filter((c: any) => c.id !== cls.id && c.is_active) : []);
        })
        .catch(() => setAllClasses([]));
    }
  }, [showEnroll, showTransfer, showBulkPromote, classDetail, cls.id]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Enrolled Students</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkPromote(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <ArrowRight className="w-4 h-4" /> Promote Class
          </button>
          <button
            onClick={() => setShowEnroll(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
          >
            <UserPlus className="w-4 h-4" /> Enroll Students
          </button>
        </div>
      </div>

      {classDetail?.students?.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Admission No</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Gender</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">Enrolled</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classDetail.students.map((student: any) => (
                <tr key={student.student_id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{student.first_name} {student.last_name}</td>
                  <td className="px-4 py-2 text-slate-600">{student.admission_no || "-"}</td>
                  <td className="px-4 py-2 text-slate-600">{student.gender || "-"}</td>
                  <td className="px-4 py-2 text-center text-slate-600">
                    {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => { setSelectedStudent(student); setShowTransfer(true); }}
                      className="text-teal-600 hover:text-teal-800 text-sm"
                    >
                      Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600">No students enrolled in this class</p>
          <button
            onClick={() => setShowEnroll(true)}
            className="mt-3 text-teal-600 hover:text-teal-700 font-medium"
          >
            Enroll Students →
          </button>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnroll && (
        <StudentEnrollmentModal
          classId={cls.id}
          availableStudents={availableStudents}
          onClose={() => setShowEnroll(false)}
          onReload={() => { setShowEnroll(false); onReload(); }}
        />
      )}

      {/* Transfer Modal */}
      {showTransfer && selectedStudent && (
        <StudentTransferModal
          student={selectedStudent}
          currentClassId={cls.id}
          targetClasses={allClasses}
          onClose={() => { setShowTransfer(false); setSelectedStudent(null); }}
          onReload={() => { setShowTransfer(false); setSelectedStudent(null); onReload(); }}
        />
      )}

      {/* Bulk Promote Modal */}
      {showBulkPromote && (
        <BulkPromoteModal
          classId={cls.id}
          currentClass={cls}
          targetClasses={allClasses}
          studentCount={classDetail?.students?.length || 0}
          onClose={() => setShowBulkPromote(false)}
          onReload={() => { setShowBulkPromote(false); onReload(); }}
        />
      )}
    </div>
  );
}

// Student Enrollment Modal
function StudentEnrollmentModal({ classId, availableStudents, onClose, onReload }: {
  classId: number; availableStudents: any[]; onClose: () => void; onReload: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = availableStudents.filter((s: any) => {
    if (!searchTerm) return true;
    return `${s.first_name} ${s.last_name} ${s.admission_no}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleSelect = (id: number) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const selectAll = () => {
    if (selected.size === filteredStudents.length) setSelected(new Set());
    else setSelected(new Set(filteredStudents.map((s: any) => s.id)));
  };

  const handleEnroll = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      for (const studentId of Array.from(selected)) {
        await api.post(`/academics/classes/${classId}/students`, { studentId });
      }
      onReload();
    } catch (err: any) {
      console.error("Failed to enroll students:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Enroll Students</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
            />
            <button
              onClick={selectAll}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100"
            >
              {selected.size === filteredStudents.length ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredStudents.length > 0 ? (
            <div className="space-y-2">
              {filteredStudents.map((student: any) => (
                <label
                  key={student.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selected.has(student.id) ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(student.id)}
                    onChange={() => toggleSelect(student.id)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{student.first_name} {student.last_name}</p>
                    <p className="text-sm text-slate-600">Admission: {student.admission_no || "-"} | Gender: {student.gender || "-"}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              {searchTerm ? "No students found" : "No available students to enroll"}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <p className="text-sm text-slate-600">{selected.size} student(s) selected</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              onClick={handleEnroll}
              disabled={saving || selected.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Enroll {selected.size} Student(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Transfer Modal
function StudentTransferModal({ student, currentClassId, targetClasses, onClose, onReload }: {
  student: any; currentClassId: number; targetClasses: any[]; onClose: () => void; onReload: () => void;
}) {
  const [targetClassId, setTargetClassId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleTransfer = async () => {
    if (!targetClassId) return;
    setSaving(true);
    try {
      await api.post(`/academics/classes/${currentClassId}/students/${student.student_id}/transfer`, {
        targetClassId: Number(targetClassId),
        reason,
      });
      onReload();
    } catch (err: any) {
      console.error("Failed to transfer student:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <h2 className="text-xl font-bold text-slate-900">Transfer Student</h2>
          <p className="text-sm text-slate-600">{student.first_name} {student.last_name}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Class</label>
            <input type="text" value={student.class_name || "This class"} disabled className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Transfer To Class *</label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select target class...</option>
              {targetClasses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional: Reason for transfer"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              rows={3}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button
            onClick={handleTransfer}
            disabled={saving || !targetClassId}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Transfer Student
          </button>
        </div>
      </div>
    </div>
  );
}

// Bulk Promote Modal - Transfer entire class to next grade
function BulkPromoteModal({ classId, currentClass, targetClasses, studentCount, onClose, onReload }: {
  classId: number; currentClass: any; targetClasses: any[]; studentCount: number;
  onClose: () => void; onReload: () => void;
}) {
  const [targetClassId, setTargetClassId] = useState("");
  const [promotionType, setPromotionType] = useState<"all" | "selected">("all");
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/academics/classes/${classId}`)
      .then(r => {
        const data = r.data?.data || {};
        setStudents(data.students || []);
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [classId]);

  const handlePromote = async () => {
    if (!targetClassId) return;
    setSaving(true);
    try {
      // If promoting all students
      if (promotionType === "all") {
        for (const student of students) {
          const studentId = student.student_id || student.id;
          await api.post(`/academics/classes/${classId}/students/${studentId}/transfer`, {
            targetClassId: Number(targetClassId),
            reason: reason || `Promoted from ${currentClass?.name || 'current class'}`,
          });
        }
      } else {
        // Only selected students
        for (const studentId of Array.from(selectedStudents)) {
          await api.post(`/academics/classes/${classId}/students/${studentId}/transfer`, {
            targetClassId: Number(targetClassId),
            reason: reason || `Promoted from ${currentClass?.name || 'current class'}`,
          });
        }
      }
      onReload();
    } catch (err: any) {
      console.error("Failed to promote students:", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleStudent = (id: number) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStudents(newSet);
  };

  const selectAll = () => {
    if (selectedStudents.size === students.length) setSelectedStudents(new Set());
    else setSelectedStudents(new Set(students.map(s => s.student_id || s.id)));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-indigo-600" />
            Promote Class
          </h2>
          <p className="text-sm text-slate-600">Transfer students to the next grade level</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-800">
              <strong>Current Class:</strong> {currentClass?.name || 'Unknown'} ({currentClass?.code || '-'})
              <br />
              <strong>Students to Promote:</strong> {studentCount}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Promotion Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="promotionType"
                  checked={promotionType === "all"}
                  onChange={() => setPromotionType("all")}
                  className="text-indigo-600"
                />
                <span className="text-sm">All Students ({students.length})</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="promotionType"
                  checked={promotionType === "selected"}
                  onChange={() => setPromotionType("selected")}
                  className="text-indigo-600"
                />
                <span className="text-sm">Selected Students Only</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Class (Next Grade) *</label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select next grade class...</option>
              {targetClasses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code}) - Grade: {c.grade_level_name || '-'}</option>
              ))}
            </select>
          </div>

          {promotionType === "selected" && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Select Students</label>
                <button
                  onClick={selectAll}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  {selectedStudents.size === students.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                {students.map((student: any) => {
                  const studentId = student.student_id || student.id;
                  return (
                    <label
                      key={studentId}
                      className={`flex items-center gap-3 p-3 border-b border-slate-100 cursor-pointer transition-colors ${
                        selectedStudents.has(studentId) ? 'bg-indigo-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(studentId)}
                        onChange={() => toggleStudent(studentId)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{student.first_name} {student.last_name}</p>
                        <p className="text-xs text-slate-600">Admission: {student.admission_no || '-'}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-slate-600 mt-1">{selectedStudents.size} student(s) selected</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Annual promotion to next grade level"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              rows={2}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <p className="text-sm text-slate-600">
            This will transfer {promotionType === "all" ? "all" : selectedStudents.size} student(s)
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              onClick={handlePromote}
              disabled={saving || !targetClassId || (promotionType === "selected" && selectedStudents.size === 0)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Promote Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Teachers Tab Component
function TeachersTab({ cls, classDetail, onReload }: { cls: any; classDetail: any; onReload: () => void }) {
  const [showAssign, setShowAssign] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Assigned Teachers</h3>
        <button
          onClick={() => setShowAssign(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
        >
          <UserPlus className="w-4 h-4" /> Assign Teacher
        </button>
      </div>

      {classDetail?.teachers?.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Teacher</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Subject</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classDetail.teachers.map((teacher: any) => (
                <tr key={teacher.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{teacher.teacher_name || "-"}</td>
                  <td className="px-4 py-2 text-slate-600">{teacher.subject_name || "All Subjects"}</td>
                  <td className="px-4 py-2 text-center">
                    {teacher.is_primary ? (
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Homeroom</span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">Subject Teacher</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <UserCheck className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600">No teachers assigned to this class</p>
        </div>
      )}

      {showAssign && (
        <AssignTeacherModal
          classId={cls.id}
          onClose={() => setShowAssign(false)}
          onReload={() => { setShowAssign(false); onReload(); }}
        />
      )}
    </div>
  );
}

// Assign Teacher Modal
function AssignTeacherModal({ classId, onClose, onReload }: {
  classId: number; onClose: () => void; onReload: () => void;
}) {
  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load staff with correct data structure
    api.get("/staffmgt/staff")
      .then(r => {
        // Response is { success: true, data: [...] }
        const data = r.data?.data || r.data?.staff || r.data || [];
        setTeachers(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Failed to load teachers:", err);
        setTeachers([]);
      });

    api.get("/academics/subjects")
      .then(r => {
        const data = r.data?.data || r.data?.subjects || r.data || [];
        setSubjects(Array.isArray(data) ? data : []);
      })
      .catch(() => setSubjects([]));
  }, []);

  const handleAssign = async () => {
    if (!teacherId) return;
    setSaving(true);
    try {
      await api.post(`/academics/classes/${classId}/teachers`, {
        teacherId: Number(teacherId),
        subjectId: subjectId ? Number(subjectId) : null,
        isPrimary,
      });
      onReload();
    } catch (err: any) {
      console.error("Failed to assign teacher:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50">
          <h2 className="text-xl font-bold text-slate-900">Assign Teacher</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teacher *</label>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="">Select teacher...</option>
              {teachers.map((t: any) => {
                // Handle different staff data structures
                const firstName = t.user?.first_name || t.first_name || t.staff?.first_name || '';
                const lastName = t.user?.last_name || t.last_name || t.staff?.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim() || `Staff #${t.id}`;
                return (
                  <option key={t.id} value={t.id}>{fullName}</option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject (optional)</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="">All Subjects</option>
              {subjects.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} className="rounded" />
            <span className="text-sm font-medium text-slate-700">Homeroom Teacher</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
          <button
            onClick={handleAssign}
            disabled={saving || !teacherId}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Assign Teacher
          </button>
        </div>
      </div>
    </div>
  );
}

// Timetable Modal Component (Single & Bulk)
function TimetableModal({ onClose, onReload }: { onClose: () => void; onReload: () => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([{ name: "", classId: "", termId: "", description: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesRes = await api.get("/academics/classes");
        console.log('📚 Classes response:', classesRes.data);
        setClasses(classesRes.data?.data || []);
      } catch (err: any) {
        console.error('❌ Classes error:', err.response || err);
        setClasses([]);
      }

      try {
        const termsRes = await api.get("/academics/terms");
        console.log('📅 Terms response:', termsRes.data);
        setTerms(termsRes.data?.data || []);
      } catch (err: any) {
        console.error('❌ Terms error:', err.response || err);
        setTerms([]);
      }

      try {
        const yearsRes = await api.get("/academics/academic-years");
        console.log('🎓 Academic Years response:', yearsRes.data);
        setAcademicYears(yearsRes.data?.data || []);
      } catch (err: any) {
        console.error('❌ Academic Years error:', err.response || err);
        setAcademicYears([]);
      }
    };
    fetchData();
  }, []);

  const addRow = () => setRows([...rows, { name: "", classId: "", termId: "", description: "" }]);
  const removeRow = (idx: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };
  const updateRow = (idx: number, field: string, value: string) => {
    const updated = rows.map((row, i) => 
      i === idx ? { ...row, [field]: value } : row
    );
    setRows(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessCount(0);

    const validRows = rows.filter(r => r.name && r.classId && r.termId);
    if (validRows.length === 0) {
      setError("Please fill in at least one timetable entry");
      setSaving(false);
      return;
    }

    try {
      let count = 0;
      for (const row of validRows) {
        await api.post("/academics/timetables", {
          name: row.name,
          class_id: Number(row.classId),
          term_id: Number(row.termId),
          description: row.description || null,
          is_active: true,
        });
        count++;
      }
      setSuccessCount(count);
      setTimeout(() => {
        onReload();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create timetables");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col" style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-teal-600" />
              {rows.length === 1 ? "New Timetable" : "Bulk Create Timetables"}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {rows.length === 1 ? "Create a new class timetable" : "Create multiple timetables at once"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {successCount > 0 && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Successfully created {successCount} timetable(s)!
              </div>
            )}

            {/* Rows */}
            {rows.map((row, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  {rows.length > 1 ? (
                    <h4 className="font-semibold text-slate-700">Entry #{idx + 1}</h4>
                  ) : (
                    <h4 className="font-semibold text-slate-700">Timetable Details</h4>
                  )}
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      title="Remove this entry"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Timetable Name *</label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(idx, "name", e.target.value)}
                      placeholder="e.g., Primary 1A Timetable"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Class *</label>
                      <select
                        value={String(row.classId || "")}
                        onChange={(e) => updateRow(idx, "classId", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select class...</option>
                        {classes.map((c: any) => (
                          <option key={c.id} value={String(c.id)}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Term *</label>
                      <select
                        value={String(row.termId || "")}
                        onChange={(e) => updateRow(idx, "termId", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select term...</option>
                        {terms.length > 0 ? terms.map((t: any) => {
                          const ayId = String(t.academic_year_id || t.academicYearId || '');
                          const ayName = t.academic_year_name || t.academicYearName || 'N/A';
                          return (
                            <option key={t.id} value={String(t.id)}>
                              {t.name} ({ayName})
                            </option>
                          );
                        }) : (
                          <option disabled>No terms available</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={row.description}
                      onChange={(e) => updateRow(idx, "description", e.target.value)}
                      placeholder="Optional description"
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Another Timetable
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <p className="text-sm text-slate-600">
            {rows.filter(r => r.name && r.classId && r.termId).length} timetable(s) ready to create
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? "Creating..." : `Create ${rows.filter(r => r.name && r.classId && r.termId).length} Timetable${rows.filter(r => r.name && r.classId && r.termId).length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lesson Modal Component (Single & Bulk)
function LessonModal({ onClose, onReload }: { onClose: () => void; onReload: () => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([{ title: "", classId: "", subjectId: "", teacherId: "", termId: "", date: "", startTime: "", endTime: "", room: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/academics/classes").then(r => r.data?.data || []).catch(() => []),
      api.get("/academics/subjects").then(r => r.data?.data || []).catch(() => []),
      api.get("/staffmgt/staff").then(r => {
        console.log('📋 Staff response:', r.data);
        return r.data?.data || [];
      }).catch((err) => {
        console.error('❌ Failed to load staff:', err);
        return [];
      }),
      api.get("/academics/terms").then(r => r.data?.data || []).catch(() => []),
    ]).then(([classesData, subjectsData, staffData, termsData]) => {
      setClasses(classesData);
      setSubjects(subjectsData);
      setTeachers(staffData);
      setTerms(termsData);
    });
  }, []);

  const addRow = () => setRows([...rows, { title: "", classId: "", subjectId: "", teacherId: "", termId: "", date: "", startTime: "", endTime: "", room: "" }]);
  const removeRow = (idx: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };
  const updateRow = (idx: number, field: string, value: string) => {
    const updated = [...rows];
    updated[idx] = { ...updated[idx], [field]: value };
    setRows(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessCount(0);

    const validRows = rows.filter(r => r.title && r.classId && r.subjectId && r.termId && r.date);
    if (validRows.length === 0) {
      setError("Please fill in at least one lesson entry");
      setSaving(false);
      return;
    }

    try {
      let count = 0;
      for (const row of validRows) {
        await api.post("/academics/lessons", {
          title: row.title,
          class_id: Number(row.classId),
          subject_id: Number(row.subjectId),
          teacher_id: row.teacherId ? Number(row.teacherId) : null,
          term_id: Number(row.termId),
          scheduled_date: row.date,
          start_time: row.startTime || null,
          end_time: row.endTime || null,
          room: row.room || null,
        });
        count++;
      }
      setSuccessCount(count);
      setTimeout(() => {
        onReload();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create lessons");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-teal-600" />
              {rows.length === 1 ? "New Lesson" : "Bulk Create Lessons"}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {rows.length === 1 ? "Create a single lesson instance" : "Create multiple lessons at once"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {successCount > 0 && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Successfully created {successCount} lesson(s)!
              </div>
            )}

            {/* Rows */}
            {rows.map((row, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  {rows.length > 1 ? (
                    <h4 className="font-semibold text-slate-700">Entry #{idx + 1}</h4>
                  ) : (
                    <h4 className="font-semibold text-slate-700">Lesson Details</h4>
                  )}
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      title="Remove this entry"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={row.title}
                      onChange={(e) => updateRow(idx, "title", e.target.value)}
                      placeholder="e.g., Introduction to Algebra"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Class *</label>
                      <select
                        value={row.classId}
                        onChange={(e) => updateRow(idx, "classId", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                      <select
                        value={row.subjectId}
                        onChange={(e) => updateRow(idx, "subjectId", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
                      <select
                        value={row.teacherId}
                        onChange={(e) => updateRow(idx, "teacherId", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.user?.first_name} {t.user?.last_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Term *</label>
                      <select
                        value={row.termId}
                        onChange={(e) => updateRow(idx, "termId", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {terms.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(idx, "date", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={row.startTime}
                        onChange={(e) => updateRow(idx, "startTime", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={row.endTime}
                        onChange={(e) => updateRow(idx, "endTime", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
                    <input
                      type="text"
                      value={row.room}
                      onChange={(e) => updateRow(idx, "room", e.target.value)}
                      placeholder="e.g., Room 101"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Another Lesson
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <p className="text-sm text-slate-600">
            {rows.filter(r => r.title && r.classId && r.subjectId && r.termId && r.date).length} lesson(s) ready to create
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? "Creating..." : `Create ${rows.filter(r => r.title && r.classId && r.subjectId && r.termId && r.date).length} Lesson${rows.filter(r => r.title && r.classId && r.subjectId && r.termId && r.date).length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subjects Tab Component
function SubjectsTab({ cls, classDetail }: { cls: any; classDetail: any; onReload: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-900">Available Subjects</h3>

      {classDetail?.availableSubjects?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {classDetail.availableSubjects.map((subject: any) => (
            <div key={subject.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{subject.name}</p>
                  <p className="text-sm text-slate-600">{subject.code || "-"}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  subject.is_core ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {subject.is_core ? 'Core' : 'Elective'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600">No subjects available for this class</p>
        </div>
      )}
    </div>
  );
}

// Timetable Viewer Component - Beautiful Grid View
function TimetableViewer({ timetableId, onClose }: { timetableId: number; onClose: () => void }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [timetableInfo, setTimetableInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [entryMode, setEntryMode] = useState<"lesson" | "break">("lesson");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [form, setForm] = useState({ subjectId: "", teacherId: "", room: "", startTime: "08:00", endTime: "08:30", breakType: "BREAK:morning_break" });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  // 24-hour clock: 07:00 to 06:00 (next day) = 46 slots of 30 minutes
  const TIME_SLOTS = Array.from({ length: 46 }, (_, i) => {
    const totalMinutes = 7 * 60 + i * 30; // Start at 07:00
    const startH = Math.floor(totalMinutes / 60) % 24;
    const startM = totalMinutes % 60;
    const endTotal = totalMinutes + 30;
    const endH = Math.floor(endTotal / 60) % 24;
    const endM = endTotal % 60;
    
    const startLabel = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const endLabel = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    return { start: startLabel, end: endLabel, label: `${startLabel} - ${endLabel}` };
  });

  const BREAK_TYPES = [
    { value: "BREAK:breakfast", label: "🍳 Breakfast Break", icon: "🍳" },
    { value: "BREAK:morning_break", label: "☕ Morning Break", icon: "☕" },
    { value: "BREAK:lunch", label: "🍽️ Lunch Break", icon: "🍽️" },
    { value: "BREAK:afternoon_break", label: "☕ Afternoon Break", icon: "☕" },
    { value: "BREAK:prayer", label: "🙏 Prayer/Assembly", icon: "🙏" },
    { value: "BREAK:evening_prayer", label: "🙏 Evening Prayer", icon: "🙏" },
    { value: "BREAK:prep", label: "📚 Prep/Study Time", icon: "📚" },
    { value: "BREAK:sports", label: "🏃 Sports/Activities", icon: "🏃" },
    { value: "BREAK:other", label: "⏸️ Other Break", icon: "⏸️" },
  ];

  const isBreak = (entry: any) => entry?.room?.startsWith("BREAK:");
  const getBreakType = (entry: any) => BREAK_TYPES.find(b => b.value === entry?.room) || BREAK_TYPES[BREAK_TYPES.length - 1];

  const SUBJECT_COLORS = [
    "bg-blue-100 border-blue-300 text-blue-900",
    "bg-green-100 border-green-300 text-green-900",
    "bg-purple-100 border-purple-300 text-purple-900",
    "bg-orange-100 border-orange-300 text-orange-900",
    "bg-pink-100 border-pink-300 text-pink-900",
    "bg-teal-100 border-teal-300 text-teal-900",
    "bg-yellow-100 border-yellow-300 text-yellow-900",
    "bg-indigo-100 border-indigo-300 text-indigo-900",
  ];

  const getSubjectColor = (subjectId: string | number) => {
    if (!subjectId) return SUBJECT_COLORS[0];
    let hash = 0;
    const str = String(subjectId);
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
  };

  useEffect(() => {
    loadTimetable();
  }, [timetableId]);

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const [ttRes, subjRes, teachRes] = await Promise.all([
        api.get(`/academics/timetables/${timetableId}`),
        api.get("/academics/subjects").catch(() => ({ data: { data: [] } })),
        api.get("/staffmgt/staff").catch(() => ({ data: { data: [] } })),
      ]);
      
      const data = ttRes.data?.data || {};
      const entriesArray = Array.isArray(data.entries) ? data.entries : [];
      
      console.log('📊 Timetable API Response:', ttRes.data);
      console.log('📝 Entries found:', entriesArray.length);
      if (entriesArray.length > 0) {
        console.log('🔍 First entry:', entriesArray[0]);
      }
      console.log('👨‍🏫 Staff response:', teachRes.data);
      
      setTimetableInfo(data);
      setEntries(entriesArray);
      setSubjects(subjRes.data?.data || []);
      
      const staffData = teachRes.data?.data || [];
      console.log('👥 Teachers loaded:', staffData.length, staffData);
      setTeachers(Array.isArray(staffData) ? staffData : []);
    } catch (err) {
      console.error("Failed to load timetable:", err);
    } finally {
      setLoading(false);
    }
  };

  // Robust time matching - finds entries that OVERLAP with the slot
  const timeToMinutes = (timeStr: string | null): number => {
    if (!timeStr) return -1;
    const clean = String(timeStr).trim();
    const parts = clean.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  const getEntryForSlot = (day: string, timeSlot: any) => {
    const slotStart = timeToMinutes(timeSlot.start);
    const slotEnd = timeToMinutes(timeSlot.end);
    
    return entries.find((e) => {
      const entryDay = e.day_of_week || "";
      if (entryDay !== day) return false;
      
      const entryStart = timeToMinutes(e.start_time);
      const entryEnd = timeToMinutes(e.end_time);
      
      if (entryStart < 0 || entryEnd < 0) return false;
      
      // Overlap detection: entry starts before slot ends AND ends after slot starts
      return entryStart < slotEnd && entryEnd > slotStart;
    });
  };

  const handleAddEntry = async () => {
    if (!selectedSlot) return;
    
    // Validate based on mode
    if (entryMode === "lesson" && !form.subjectId) {
      alert("Please select a subject");
      return;
    }
    if (entryMode === "break" && !form.breakType) {
      alert("Please select a break type");
      return;
    }
    if (selectedDays.length === 0) {
      alert("Please select at least one day");
      return;
    }

    setSaving(true);
    try {
      let successCount = 0;
      
      for (const day of selectedDays) {
        const payload: any = {
          dayOfWeek: day,
          startTime: form.startTime,
          endTime: form.endTime,
        };

        if (entryMode === "lesson") {
          payload.subjectId = Number(form.subjectId);
          payload.teacherId = form.teacherId ? Number(form.teacherId) : null;
          payload.room = form.room || null;
        } else {
          payload.room = form.breakType;
          payload.subjectId = null;
          payload.teacherId = null;
        }

        try {
          await api.post(`/academics/timetables/${timetableId}/entries`, payload);
          successCount++;
        } catch (err: any) {
          console.error(`Failed to add entry for ${day}:`, err);
        }
      }

      if (successCount > 0) {
        await loadTimetable();
        setShowAddEntry(false);
        setSelectedSlot(null);
        setSelectedDays([]);
        setEntryMode("lesson");
        setForm({ subjectId: "", teacherId: "", room: "", startTime: "08:00", endTime: "08:30", breakType: "BREAK:morning_break" });
      }
    } catch (err: any) {
      console.error("Failed to add entry:", err);
      alert(err.response?.data?.message || "Failed to add entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm("Delete this lesson from the timetable?")) return;
    try {
      await api.delete(`/academics/timetables/${timetableId}/entries/${entryId}`);
      await loadTimetable();
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full p-12 flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mb-4" />
          <p className="text-slate-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-[95vw] w-full max-h-[96vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              {timetableInfo.name || "Timetable"}
            </h2>
            <div className="flex gap-4 mt-1.5 text-sm text-slate-600">
              <span>📚 Class: <strong>{timetableInfo.class_name || "-"}</strong></span>
              <span>📅 Term: <strong>{timetableInfo.term_name || "-"}</strong></span>
              <span>🎓 Year: <strong>{timetableInfo.academic_year_name || "-"}</strong></span>
              <span>📝 Entries: <strong>{entries.length}</strong></span>
              {entries.length > 0 && (
                <span className="text-xs text-slate-500">
                  ({entries.filter(e => e.room?.startsWith("BREAK:")).length} breaks, {entries.filter(e => !e.room?.startsWith("BREAK:")).length} lessons)
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Timetable Grid */}
        <div className="flex-1 overflow-auto p-3">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-20 bg-slate-100 border border-slate-300 px-2 py-2 text-xs font-bold text-slate-700 sticky left-0 z-10">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th key={day} className="min-w-[130px] bg-slate-100 border border-slate-300 px-2 py-2 text-xs font-bold text-slate-700 text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot, idx) => (
                  <tr key={idx}>
                    <td className="bg-slate-50 border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 sticky left-0 z-10 text-center">
                      {timeSlot.label}
                    </td>
                    {DAYS.map((day) => {
                      const entry = getEntryForSlot(day, timeSlot);
                      return (
                        <td
                          key={`${day}-${idx}`}
                          className="border border-slate-200 p-1 min-h-[48px] align-top cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            setSelectedSlot({ day, timeSlot });
                            setSelectedDays([day]); // Auto-select the clicked day
                            if (entry) {
                              setForm({
                                subjectId: entry.subject_id?.toString() || "",
                                teacherId: entry.teacher_id?.toString() || "",
                                room: entry.room || "",
                                startTime: entry.start_time?.substring(0, 5) || "08:00",
                                endTime: entry.end_time?.substring(0, 5) || "08:30",
                              });
                              setEntryMode(entry.room?.startsWith("BREAK:") ? "break" : "lesson");
                              if (entry.room?.startsWith("BREAK:")) {
                                setForm(prev => ({ ...prev, breakType: entry.room }));
                              }
                            } else {
                              setForm({
                                subjectId: "",
                                teacherId: "",
                                room: "",
                                startTime: timeSlot.start,
                                endTime: timeSlot.end,
                                breakType: "BREAK:morning_break",
                              });
                              setEntryMode("lesson");
                            }
                            setShowAddEntry(true);
                          }}
                        >
                          {entry ? (
                            isBreak(entry) ? (
                              <div className="bg-gradient-to-br from-slate-100 to-slate-200 border border-dashed border-slate-300 rounded p-1.5 h-full flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-400 transition-colors">
                                <div className="text-lg leading-none">{getBreakType(entry).icon}</div>
                                <div className="font-semibold text-slate-700 text-xs mt-1">{getBreakType(entry).label.replace(/^[^\s]+\s/, '')}</div>
                              </div>
                            ) : (
                              <div className={`${getSubjectColor(entry.subject_id)} border rounded p-1.5 text-xs h-full relative group`}>
                                <div className="font-semibold text-xs mb-1">{entry.subject_name || "Unknown"}</div>
                                {(entry.teacher_first_name || entry.teacher_last_name) && (
                                  <div className="text-slate-600 mb-0.5 text-xs">
                                    👤 {entry.teacher_first_name} {entry.teacher_last_name}
                                  </div>
                                )}
                                {entry.room && (
                                  <div className="text-slate-500 text-xs">📍 {entry.room}</div>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEntry(entry.id);
                                  }}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 hover:text-teal-500 transition-colors">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-sm text-slate-600">
          <div className="flex gap-4">
            <span>💡 Click to add</span>
            <span>📚 Lesson / ⏸️ Break</span>
            <span>🗑️ Hover × to delete</span>
          </div>
          <span>Total: {entries.length} entries</span>
        </div>
      </div>

      {/* Add/Edit Entry Modal */}
      {showAddEntry && selectedSlot && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50">
              <h3 className="text-xl font-bold text-slate-900">
                {isBreak(getEntryForSlot(selectedSlot.day, selectedSlot.timeSlot)) ? "Edit Slot" : 
                 getEntryForSlot(selectedSlot.day, selectedSlot.timeSlot) ? "Edit Lesson" : "Add to Timetable"}
              </h3>
              <p className="text-sm text-slate-600">
                {selectedSlot.day} • {selectedSlot.timeSlot.label}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEntryMode("lesson")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    entryMode === "lesson" 
                      ? "bg-teal-600 text-white shadow-md" 
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-300"
                  }`}
                >
                  📚 Lesson
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode("break")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    entryMode === "break" 
                      ? "bg-slate-600 text-white shadow-md" 
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-300"
                  }`}
                >
                  ⏸️ Break/Activity
                </button>
              </div>
            </div>

            {/* Day Selection */}
            <div className="px-6 py-3 border-b border-slate-200 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Apply to Days:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDays(DAYS)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDays(DAYS.slice(0, 5))}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mon-Fri
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDays([])}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDays(prev =>
                        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                      );
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all border ${
                      selectedDays.includes(day)
                        ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-300 hover:border-teal-400"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Selected: {selectedDays.length > 0 ? selectedDays.map(d => d.slice(0, 3)).join(', ') : 'None'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {entryMode === "lesson" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                    <select
                      value={form.subjectId}
                      onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select subject...</option>
                      {subjects.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
                      <select
                        value={form.teacherId}
                        onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select teacher...</option>
                        {teachers.length > 0 ? teachers.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.first_name || ''} {t.last_name || ''}
                          </option>
                        )) : (
                          <option disabled>No teachers available</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
                      <input
                        type="text"
                        value={form.room}
                        onChange={(e) => setForm({ ...form, room: e.target.value })}
                        placeholder="e.g., Room 101"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Break/Activity Type *</label>
                  <select
                    value={form.breakType}
                    onChange={(e) => setForm({ ...form, breakType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Select break type...</option>
                    {BREAK_TYPES.map((b) => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddEntry(false);
                  setSelectedSlot(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                disabled={saving || selectedDays.length === 0 || (entryMode === "lesson" && !form.subjectId) || (entryMode === "break" && !form.breakType)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {isBreak(getEntryForSlot(selectedSlot.day, selectedSlot.timeSlot)) ? "Update Slot" : 
                 entryMode === "break" ? `Add ${selectedDays.length} Break${selectedDays.length !== 1 ? 's' : ''}` : `Add ${selectedDays.length} Lesson${selectedDays.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Delivery Action Modal Component
function DeliveryActionModal({ delivery, onClose, onSubmit }: { delivery: any; onClose: () => void; onSubmit: (action: string, comments: string) => void }) {
  const [action, setAction] = useState("delivered");
  const [comments, setComments] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50">
          <h3 className="text-xl font-bold text-slate-900">Update Lesson Delivery</h3>
          <p className="text-sm text-slate-600">
            {delivery.subject_name || 'Lesson'} - {delivery.class_name || ''}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Delivery Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Date:</span>
              <span className="font-medium">{delivery.scheduled_date ? new Date(delivery.scheduled_date).toLocaleDateString() : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Time:</span>
              <span className="font-medium">
                {delivery.start_time && delivery.end_time
                  ? `${delivery.start_time.substring(0, 5)} – ${delivery.end_time.substring(0, 5)}`
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Teacher:</span>
              <span className="font-medium">
                {delivery.teacher_first_name && delivery.teacher_last_name
                  ? `${delivery.teacher_first_name} ${delivery.teacher_last_name}`
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Room:</span>
              <span className="font-medium">{delivery.room || '-'}</span>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAction("delivered")}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                  action === "delivered"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-slate-700 border-slate-300 hover:border-green-400"
                }`}
              >
                ✅ Delivered
              </button>
              <button
                type="button"
                onClick={() => setAction("postponed")}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                  action === "postponed"
                    ? "bg-yellow-600 text-white border-yellow-600"
                    : "bg-white text-slate-700 border-slate-300 hover:border-yellow-400"
                }`}
              >
                ⏰ Postponed
              </button>
              <button
                type="button"
                onClick={() => setAction("cancelled")}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                  action === "cancelled"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-slate-700 border-slate-300 hover:border-red-400"
                }`}
              >
                ❌ Cancelled
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Comments / Remarks</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any notes about this lesson delivery..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(action, comments)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Update Delivery
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Lesson Delivery Modal Component
function AddDeliveryModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [form, setForm] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    scheduledDate: "",
    startTime: "",
    endTime: "",
    room: "",
    status: "planned",
    comments: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/academics/classes").then(r => setClasses(r.data?.data || [])).catch(() => setClasses([]));
    api.get("/academics/subjects").then(r => setSubjects(r.data?.data || [])).catch(() => setSubjects([]));
    api.get("/staffmgt/staff").then(r => setTeachers(r.data?.data || [])).catch(() => setTeachers([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.classId || !form.subjectId || !form.scheduledDate) {
      setError("Please fill in all required fields");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Get class and subject names for the title
      const classObj = classes.find(c => c.id === Number(form.classId));
      const subjectObj = subjects.find(s => s.id === Number(form.subjectId));
      const title = `${subjectObj?.name || 'Lesson'} - ${classObj?.name || ''}`;

      // Step 1: Create lesson first
      const lessonRes = await api.post("/academics/lessons", {
        title,
        class_id: Number(form.classId),
        subject_id: Number(form.subjectId),
        teacher_id: form.teacherId ? Number(form.teacherId) : null,
        scheduled_date: form.scheduledDate,
        start_time: form.startTime || null,
        end_time: form.endTime || null,
        room: form.room || null,
        is_active: true,
      });

      const lessonId = lessonRes.data?.data?.id;
      if (!lessonId) {
        setError("Failed to create lesson");
        setSaving(false);
        return;
      }

      // Step 2: Create delivery linked to the lesson
      await api.post("/academics/lesson-deliveries", {
        lesson_id: Number(lessonId),
        scheduled_date: form.scheduledDate,
        status: form.status,
        comments: form.comments || null,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create lesson delivery");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" />
              Add Lesson Delivery
            </h2>
            <p className="text-sm text-slate-600">Create a manual delivery record not on the timetable</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class *</label>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select class...</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
              <select
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select subject...</option>
                {subjects.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
            <select
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select teacher...</option>
              {teachers.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.first_name || ''} {t.last_name || ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
              <input
                type="text"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="e.g., Room 101"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="planned">Planned</option>
                <option value="delivered">Delivered</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Comments</label>
            <textarea
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="Optional notes about this delivery..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {saving ? "Saving..." : "Add Delivery"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClassesSchedulingPage;
