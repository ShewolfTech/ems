import React, { useState, useEffect, useMemo } from "react";
import api from "@/utils/api.js";
import { Copy, Upload, Download, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// 30-minute intervals from 07:00 to 06:30 (48 slots = 24 hours)
const HOURS = [
  ...Array.from({ length: 34 }, (_, i) => 7 + i * 0.5), // 07:00 - 23:30
  ...Array.from({ length: 13 }, (_, i) => i * 0.5),      // 00:00 - 06:00
  6.5,                                                    // 06:30
]; // Total: 48 half-hour slots

const formatTimeSlot = (hourDecimal: number) => {
  const h = Math.floor(hourDecimal);
  const m = (hourDecimal % 1) * 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Consistent color palette for subjects (20 colors)
const SUBJECT_COLORS = [
  "#dbeafe", "#fef3c7", "#d1fae5", "#fce7f3", "#e0e7ff",
  "#ccfbf1", "#fef9c3", "#ede9fe", "#ffedd5", "#f1f5f9",
  "#cffafe", "#fecdd3", "#bbf7d0", "#fde68a", "#c4b5fd",
  "#fca5a5", "#86efac", "#fcd34d", "#93c5fd", "#f9a8d4",
];

const getSubjectColor = (subjectId: string | null) => {
  if (!subjectId) return "";
  let hash = 0;
  for (let i = 0; i < subjectId.length; i++) hash = subjectId.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

// Subject name to color mapping for the grid
const getSubjectDisplayColor = (subjectName: string | null) => {
  if (!subjectName) return "";
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

interface TimetableGridProps {
  timetableId: number;
  subjects: any[];
  staff: any[];
  onBack: () => void;
  timetableInfo?: any; // Pass timetable info from parent if available
}

export function TimetableGrid({ timetableId, subjects, staff, onBack, timetableInfo: passedTimetableInfo }: TimetableGridProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [timetableInfo, setTimetableInfo] = useState<any>(passedTimetableInfo || {});
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<any>(null);
  const [form, setForm] = useState({ subjectId: "", teacherId: "", room: "" });
  const [copyAcrossWeek, setCopyAcrossWeek] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyForm, setCopyForm] = useState({ toClassId: "", toTermId: "", name: "" });
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [showWorkload, setShowWorkload] = useState(false);
  const [relatedTimetables, setRelatedTimetables] = useState<any[]>([]);
  const [selectedPatternId, setSelectedPatternId] = useState<number>(timetableId);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState("");
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneMessage, setCloneMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [availableTimetables, setAvailableTimetables] = useState<any[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setSelectedPatternId(timetableId);
  }, [timetableId]);

  useEffect(() => {
    loadAvailableTimetables();
  }, []);

  const loadAvailableTimetables = async () => {
    try {
      const res = await api.get("/academics/timetables");
      const all = res.data?.data || [];
      // Exclude current timetable
      const others = all.filter((t: any) => t.id !== timetableId);
      setAvailableTimetables(others);
    } catch (e) {
      console.error("Failed to load timetables", e);
    }
  };

  const handleClone = async () => {
    if (!cloneSourceId) {
      setCloneMessage({ text: "Please select a timetable to clone from", type: 'error' });
      return;
    }

    setCloneLoading(true);
    setCloneMessage(null);

    try {
      const { data } = await api.post(`/academics/timetables/${timetableId}/clone`, {
        source_timetable_id: Number(cloneSourceId),
      });

      if (data.success) {
        setCloneMessage({ text: `✅ Cloned ${data.data.clonedEntries} periods from source timetable`, type: 'success' });
        loadEntries();
        setTimeout(() => {
          setShowCloneModal(false);
          setCloneMessage(null);
          setCloneSourceId("");
        }, 1500);
      }
    } catch (err: any) {
      setCloneMessage({ text: err.response?.data?.message || "Clone failed", type: 'error' });
    } finally {
      setCloneLoading(false);
    }
  };

  const handleImportCSV = async (csvContent: string) => {
    setImportLoading(true);
    setImportMessage(null);

    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        setImportMessage({ text: "CSV must have at least a header and one data row", type: 'error' });
        setImportLoading(false);
        return;
      }

      // Parse CSV
      const header = lines[0].toLowerCase().split(',').map(h => h.trim());
      const dayIdx = header.findIndex(h => h.includes('day'));
      const startIdx = header.findIndex(h => h.includes('start') || h.includes('begin'));
      const endIdx = header.findIndex(h => h.includes('end'));
      const subjectIdx = header.findIndex(h => h.includes('subject'));
      const teacherIdx = header.findIndex(h => h.includes('teacher'));
      const roomIdx = header.findIndex(h => h.includes('room'));

      let imported = 0;
      let errors = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length < 3) continue;

        const day = cols[dayIdx >= 0 ? dayIdx : 0];
        const startTime = cols[startIdx >= 0 ? startIdx : 1];
        const endTime = cols[endIdx >= 0 ? endIdx : 2];
        const subjectName = subjectIdx >= 0 ? cols[subjectIdx] : '';
        const teacherName = teacherIdx >= 0 ? cols[teacherIdx] : '';
        const room = roomIdx >= 0 ? cols[roomIdx] : '';

        // Find matching subject
        const subject = subjects.find(s =>
          s.name?.toLowerCase() === subjectName?.toLowerCase() ||
          s.code?.toLowerCase() === subjectName?.toLowerCase()
        );

        // Find matching teacher
        const teacher = staff.find(t =>
          `${t.first_name || ''} ${t.last_name || ''}`.toLowerCase().includes(teacherName?.toLowerCase()) ||
          `${t.first_name || ''} ${t.last_name || ''}`.toLowerCase() === teacherName?.toLowerCase()
        );

        try {
          await api.post(`/academics/timetables/${timetableId}/entries`, {
            dayOfWeek: day,
            startTime: startTime.includes(':') ? `${startTime}:00` : `${startTime.padStart(2, '0')}:00:00`,
            endTime: endTime.includes(':') ? `${endTime}:00` : `${endTime.padStart(2, '0')}:00:00`,
            subjectId: subject?.id || null,
            teacherId: teacher?.id || teacher?.staff_id || null,
            room: room || null,
          });
          imported++;
        } catch (e) {
          errors++;
        }
      }

      setImportMessage({
        text: `✅ Imported ${imported} periods${errors > 0 ? `, ${errors} skipped` : ''}`,
        type: 'success',
      });
      loadEntries();
      setTimeout(() => {
        setShowImportModal(false);
        setImportMessage(null);
      }, 2000);
    } catch (err: any) {
      setImportMessage({ text: err.response?.data?.message || "Import failed", type: 'error' });
    } finally {
      setImportLoading(false);
    }
  };

  const handleSmartGenerate = async () => {
    setGenerateLoading(true);
    setGenerateMessage(null);

    try {
      const { data } = await api.post(`/academics/timetables/${timetableId}/generate`);

      if (data.success) {
        setGenerateMessage({
          text: `✅ Generated ${data.data.generatedEntries} periods (~${data.data.periodsPerSubject} per subject/week)`,
          type: 'success',
        });
        loadEntries();
        setTimeout(() => {
          setShowGenerateModal(false);
          setGenerateMessage(null);
        }, 2000);
      }
    } catch (err: any) {
      setGenerateMessage({
        text: err.response?.data?.message || "Generation failed. Ensure teachers/subjects are assigned to this class.",
        type: 'error',
      });
    } finally {
      setGenerateLoading(false);
    }
  };

  const loadEntries = async (id?: number) => {
    const tid = id || selectedPatternId;
    setLoading(true);
    try {
      const res = await api.get(`/academics/timetables/${tid}`);
      const data = res.data?.data || {};
      setEntries(data.entries || []);
      setTimetableInfo(data);
    } catch (e) {
      console.error("Failed to load timetable", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedPatternId(timetableId);
  }, [timetableId]);

  useEffect(() => {
    loadEntries();
    Promise.all([
      api.get("/academics/classes").then(r => r.data?.data || []),
      api.get("/academics/terms").then(r => r.data?.data || []),
      api.get("/academics/timetables").then(r => r.data?.data || []),
    ]).then(([cls, trms, tts]) => {
      setClasses(cls);
      setTerms(trms);
      // Find related timetables (same class and term)
      const current = tts.find((t: any) => t.id === timetableId);
      if (current) {
        const related = tts.filter((t: any) => 
          t.class_id === current.class_id && 
          t.term_id === current.term_id && 
          t.id !== current.id &&
          t.is_active
        );
        setRelatedTimetables(related);
      }
    }).catch(console.error);
  }, [timetableId]);

  const getEntryForCell = (day: string, hour: number) => {
    return entries.find((e: any) => {
      if (e.day_of_week !== day || !e.start_time) return false;
      const [h, m] = e.start_time.split(":").map(Number);
      const entryHour = h + (m / 60);
      return entryHour === hour;
    });
  };

  // Calculate teacher workload (exclude unassigned/break slots)
  const teacherWorkload = useMemo(() => {
    const workload: Record<string, { name: string, periods: number, totalMinutes: number }> = {};
    entries.forEach((e: any) => {
      if (!e.teacher_id) return; // Skip breaks/non-teaching
      const key = e.teacher_id;
      if (!workload[key]) {
        workload[key] = { name: `${e.teacher_first_name || ''} ${e.teacher_last_name || ''}`.trim() || 'Unknown', periods: 0, totalMinutes: 0 };
      }
      const [sh, sm] = (e.start_time || "00:00:00").split(":").map(Number);
      const [eh, em] = (e.end_time || "00:00:00").split(":").map(Number);
      const minutes = (eh * 60 + em) - (sh * 60 + sm);
      workload[key].periods++;
      workload[key].totalMinutes += minutes;
    });
    return Object.values(workload).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [entries]);

  // Calculate subject workload (exclude breaks/non-teaching)
  const subjectWorkload = useMemo(() => {
    const workload: Record<string, { name: string, periods: number, totalMinutes: number, color: string }> = {};
    entries.forEach((e: any) => {
      if (e.room && e.room.startsWith("BREAK:")) return; // Skip breaks
      if (!e.subject_name && !e.subject_id) return; // Skip non-teaching
      const key = e.subject_id || e.subject_name || "unknown";
      if (!workload[key]) {
        workload[key] = { name: e.subject_name || 'Unknown', periods: 0, totalMinutes: 0, color: getSubjectDisplayColor(e.subject_name) };
      }
      const [sh, sm] = (e.start_time || "00:00:00").split(":").map(Number);
      const [eh, em] = (e.end_time || "00:00:00").split(":").map(Number);
      const minutes = (eh * 60 + em) - (sh * 60 + sm);
      workload[key].periods++;
      workload[key].totalMinutes += minutes;
    });
    return Object.values(workload).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [entries]);

  const BREAK_OPTIONS = [
    { value: "break_morning", label: "🌅 Morning Break" },
    { value: "break_lunch", label: "🍽️ Lunch Break" },
    { value: "break_afternoon", label: "☕ Afternoon Break" },
    { value: "break_prayer", label: "🙏 Prayer Break" },
    { value: "break_assembly", label: "📣 Assembly" },
  ];

  const getBreakLabel = (subjectId: string, room?: string) => {
    // Check room for BREAK: prefix (how breaks are stored)
    if (room && room.startsWith("BREAK:")) {
      const breakType = room.replace("BREAK:", "");
      const found = BREAK_OPTIONS.find(b => b.value === breakType);
      return found ? found.label : breakType;
    }
    const found = BREAK_OPTIONS.find(b => b.value === subjectId);
    return found ? found.label : null;
  };

  const handleCellClick = async (day: string, hour: number, existingEntry?: any) => {
    if (existingEntry) {
      setEditingCell({ ...existingEntry, hour });
      // Check if this is a break (room starts with "BREAK:")
      if (existingEntry.room && existingEntry.room.startsWith("BREAK:")) {
        const breakType = existingEntry.room.replace("BREAK:", "");
        setForm({
          subjectId: breakType,
          teacherId: "",
          room: "",
        });
      } else {
        setForm({
          subjectId: existingEntry.subject_id || "",
          teacherId: existingEntry.teacher_id || "",
          room: existingEntry.room || "",
        });
      }
    } else {
      setEditingCell({ day, hour });
      setForm({ subjectId: "", teacherId: "", room: "" });
    }
  };

  const handleSave = async () => {
    if (!editingCell) return;
    try {
      const isBreak = form.subjectId && form.subjectId.startsWith("break_");
      const hourDecimal = editingCell.hour;
      const h = Math.floor(hourDecimal);
      const m = (hourDecimal % 1) * 60;
      const endH = m >= 30 ? h + 1 : h;
      const endM = m >= 30 ? 0 : 30;
      
      const payload = {
        dayOfWeek: editingCell.day_of_week || editingCell.day,
        startTime: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`,
        endTime: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`,
        subjectId: isBreak ? null : (form.subjectId || null),
        teacherId: isBreak ? null : (form.teacherId || null),
        room: isBreak ? `BREAK:${form.subjectId}` : (form.room || null),
      };

      if (editingCell.id) {
        await api.put(`/academics/timetables/${timetableId}/entries/${editingCell.id}`, payload);
      } else {
        await api.post(`/academics/timetables/${timetableId}/entries`, payload);
      }

      // Copy across weekdays (Mon-Fri) if checked
      if (copyAcrossWeek) {
        const day = editingCell.day_of_week || editingCell.day;
        const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const otherDays = weekdays.filter(d => d !== day);
        for (const otherDay of otherDays) {
          try {
            await api.post(`/academics/timetables/${timetableId}/entries`, {
              ...payload,
              dayOfWeek: otherDay,
            });
          } catch (e) { /* skip conflicts */ }
        }
      }

      setEditingCell(null);
      setCopyAcrossWeek(false);
      loadEntries();
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleDelete = async () => {
    if (!editingCell?.id || !window.confirm("Remove this period?")) return;
    try {
      await api.delete(`/academics/timetables/${timetableId}/entries/${editingCell.id}`);
      setEditingCell(null);
      loadEntries();
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    if (!copyForm.toClassId || !copyForm.toTermId || !copyForm.name) {
      alert("Please fill all fields");
      return;
    }
    try {
      await api.post(`/academics/timetables/${timetableId}/copy`, {
        toClassId: Number(copyForm.toClassId),
        toTermId: Number(copyForm.toTermId),
        name: copyForm.name,
      });
      setShowCopyDialog(false);
      alert("Timetable copied successfully!");
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading timetable...</div>;

  const totalTeachingMinutes = teacherWorkload.reduce((sum, t) => sum + t.totalMinutes, 0);
  const totalTeachingHours = Math.floor(totalTeachingMinutes / 60);
  const totalTeachingMins = totalTeachingMinutes % 60;

  return (
    <div className="space-y-4 print:space-y-2">
      {/* Timetable header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">{timetableInfo.name || 'Timetable'}</h2>
              {relatedTimetables.length > 0 && (
                <select
                  value={selectedPatternId}
                  onChange={e => {
                    const id = Number(e.target.value);
                    setSelectedPatternId(id);
                    loadEntries(id);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                >
                  <option value={timetableId}>{timetableInfo.name || 'Current'}</option>
                  {relatedTimetables.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">🏫 {timetableInfo.class_name || '—'}</span>
              <span className="flex items-center gap-1">📅 {timetableInfo.term_name || '—'}</span>
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{teacherWorkload.length} teachers</span>
              <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">{totalTeachingHours}h {totalTeachingMins}m teaching</span>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={() => setShowGenerateModal(true)} className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-md text-xs font-medium hover:bg-violet-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto-Generate
            </button>
            <button onClick={() => setShowCloneModal(true)} className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-md text-xs font-medium hover:bg-teal-200 flex items-center gap-1">
              <Copy className="w-3 h-3" /> Clone
            </button>
            <button onClick={() => setShowImportModal(true)} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium hover:bg-indigo-200 flex items-center gap-1">
              <Upload className="w-3 h-3" /> Import CSV
            </button>
            <button onClick={() => setShowWorkload(!showWorkload)} className={`px-3 py-1.5 text-xs font-medium rounded-md ${showWorkload ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
              📊 Workload
            </button>
            <button onClick={() => setShowCopyDialog(true)} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-xs font-medium hover:bg-green-200">
              📋 Copy
            </button>
            <button onClick={handlePrint} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200">
              🖨️ Print
            </button>
            <button onClick={onBack} className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50">← Back</button>
          </div>
        </div>
        {relatedTimetables.length === 0 && (
          <p className="text-xs text-gray-400 mt-2">💡 Create additional timetables (Week A, Week B) from the list to switch between them here.</p>
        )}
      </div>

      {/* Workload Summary */}
      {showWorkload && (
        <div className="bg-white rounded-lg shadow p-4 print:hidden">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Timetable Workload Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Teacher Workload</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {teacherWorkload.map((t, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100">
                    <span className="text-gray-900">{t.name}</span>
                    <span className="text-gray-500">{Math.floor(t.totalMinutes / 60)}h {t.totalMinutes % 60}m ({t.periods} slots)</span>
                  </div>
                ))}
                {teacherWorkload.length === 0 && <p className="text-sm text-gray-400">No teaching periods assigned yet.</p>}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Subject Distribution</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {subjectWorkload.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100">
                    <span className="flex items-center gap-2">
                      {s.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />}
                      <span className="text-gray-900">{s.name}</span>
                    </span>
                    <span className="text-gray-500">{Math.floor(s.totalMinutes / 60)}h {s.totalMinutes % 60}m</span>
                  </div>
                ))}
                {subjectWorkload.length === 0 && <p className="text-sm text-gray-400">No teaching subjects assigned yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print header */}
      <div className="hidden print:block text-center mb-4">
        <h1 className="text-xl font-bold">{timetableInfo.name || 'Timetable'}</h1>
        <p className="text-sm text-gray-500">{timetableInfo.class_name || '—'} — {timetableInfo.term_name || '—'}</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-280px)] print:max-h-none print:overflow-visible">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 sticky top-0 z-20">
                <th className="border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 w-20 sticky left-0 bg-gray-100 z-30">Time</th>
                {DAYS.map(day => (
                  <th key={day} className="border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour, idx) => {
                const isMidnight = hour === 0; // Add separator before 00:00
                return (
                  <React.Fragment key={hour}>
                    {isMidnight && (
                      <tr className="bg-gray-800">
                        <td colSpan={8} className="text-center text-white text-[10px] font-bold py-1 print:text-[6px]">
                          ═══ MIDNIGHT — NEXT DAY ═══
                        </td>
                      </tr>
                    )}
                    <tr className={hour % 1 === 0 ? "" : "bg-gray-50/50"}>
                      <td className="border border-gray-200 px-2 py-1 text-xs text-gray-500 text-center font-medium sticky left-0 bg-white z-10 print:sticky-none text-[8px]">
                        {formatTimeSlot(hour)}
                      </td>
                  {DAYS.map(day => {
                    const entry = getEntryForCell(day, hour);
                    const isBreak = entry && getBreakLabel(entry.subject_id, entry.room);
                    const breakLabel = isBreak ? getBreakLabel(entry.subject_id, entry.room) : null;
                    const subjectColor = !isBreak ? getSubjectDisplayColor(entry?.subject_name) : "";
                    const cellBgStyle = subjectColor ? { backgroundColor: subjectColor } : {};
                    return (
                      <td
                        key={`${day}-${hour}`}
                        onClick={() => handleCellClick(day, hour, entry)}
                        className={`border border-gray-200 px-2 py-0.5 text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                          entry
                            ? isBreak
                              ? "bg-amber-100 print:bg-amber-100"
                              : "print:color-adjust-exact"
                            : ""
                        }`}
                        style={{ minHeight: 32, ...cellBgStyle }}
                      >
                        {entry ? (
                          <div>
                            {breakLabel ? (
                              <div className="text-center font-medium text-amber-800 text-[11px]">
                                {breakLabel}
                              </div>
                            ) : (
                              <>
                                <div className="font-medium text-gray-900">{entry.subject_name || "—"}</div>
                                <div className="text-gray-500 text-[10px] print:text-gray-600">
                                  {entry.teacher_first_name} {entry.teacher_last_name}
                                </div>
                                {entry.room && (
                                  <div className="text-gray-400 text-[9px] mt-0.5">📍 {entry.room}</div>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-300 text-center py-3 print:hidden">+</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {/* Edit Cell Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingCell.id ? "Edit Period" : `Add Period — ${editingCell.day} ${formatTimeSlot(editingCell.hour)}-${formatTimeSlot(editingCell.hour + 0.5)}`}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject / Break</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={form.subjectId}
                  onChange={e => setForm({ ...form, subjectId: e.target.value, teacherId: form.subjectId.startsWith("break_") ? "" : form.teacherId })}
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  <optgroup label="--- Breaks & Non-Teaching ---">
                    {BREAK_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </optgroup>
                </select>
              </div>
              {(!form.subjectId || !form.subjectId.startsWith("break_")) && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Teacher</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={form.teacherId}
                      onChange={e => setForm({ ...form, teacherId: e.target.value })}
                    >
                      <option value="">Select teacher...</option>
                      {staff.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Room</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={form.room}
                      onChange={e => setForm({ ...form, room: e.target.value })}
                      placeholder="e.g. Room 101"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={copyAcrossWeek}
                    onChange={e => setCopyAcrossWeek(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-xs font-medium text-gray-700">📅 Copy this slot Mon–Fri</span>
                </label>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <div>
                {editingCell.id && (
                  <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingCell(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Timetable Modal */}
      {showCopyDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Copy Timetable</h3>
            <p className="text-sm text-gray-500 mb-4">
              Copy from <strong>{timetableInfo.class_name}</strong> ({timetableInfo.term_name}) to another class/term.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Class *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={copyForm.toClassId}
                  onChange={e => setCopyForm({ ...copyForm, toClassId: e.target.value })}
                >
                  <option value="">Select class...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Term *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={copyForm.toTermId}
                  onChange={e => setCopyForm({ ...copyForm, toTermId: e.target.value })}
                >
                  <option value="">Select term...</option>
                  {terms.map(t => <option key={t.id} value={t.id}>{t.name} ({t.academic_year_name || ""})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New Timetable Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={copyForm.name}
                  onChange={e => setCopyForm({ ...copyForm, name: e.target.value })}
                  placeholder="e.g. Term 2 Timetable"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCopyDialog(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">Cancel</button>
              <button onClick={handleCopy} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm">Copy Timetable</button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Copy className="w-5 h-5 text-teal-600" />
              Clone Timetable
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clone From</label>
                <select
                  value={cloneSourceId}
                  onChange={(e) => setCloneSourceId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select a timetable...</option>
                  {availableTimetables.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name || 'Timetable'} — {t.class_name || '—'} ({t.term_name || '—'})
                    </option>
                  ))}
                </select>
              </div>
              {cloneMessage && (
                <div className={`p-2 rounded text-sm flex items-center gap-2 ${
                  cloneMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {cloneMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {cloneMessage.text}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowCloneModal(false); setCloneMessage(null); setCloneSourceId(""); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">Cancel</button>
              <button onClick={handleClone} disabled={cloneLoading} className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm flex items-center gap-1">
                {cloneLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Cloning...</> : 'Clone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              Auto-Generate Timetable
            </h3>
            <div className="space-y-4">
              <div className="bg-violet-50 p-4 rounded-lg">
                <p className="text-sm text-violet-800">
                  The algorithm will automatically create a balanced timetable based on:
                </p>
                <ul className="text-xs text-violet-700 mt-2 space-y-1">
                  <li>✓ Subjects & teachers assigned to this class</li>
                  <li>✓ Teacher availability (no double-booking)</li>
                  <li>✓ Even distribution across the week</li>
                  <li>✓ Standard school hours (7:30 AM – 3:10 PM)</li>
                  <li>✓ Built-in morning & lunch breaks</li>
                </ul>
              </div>
              {generateMessage && (
                <div className={`p-2 rounded text-sm flex items-center gap-2 ${
                  generateMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {generateMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {generateMessage.text}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowGenerateModal(false); setGenerateMessage(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">Cancel</button>
              <button onClick={handleSmartGenerate} disabled={generateLoading} className="px-4 py-2 bg-violet-600 text-white rounded-md text-sm flex items-center gap-1">
                {generateLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</> : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Import CSV
            </h3>
            <div className="space-y-4">
              <CSVImportForm onImport={handleImportCSV} />
              {importMessage && (
                <div className={`p-2 rounded text-sm flex items-center gap-2 ${
                  importMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {importMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {importMessage.text}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowImportModal(false); setImportMessage(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// CSV Import Form Component
function CSVImportForm({ onImport }: { onImport: (csv: string) => void }) {
  const [csvText, setCsvText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvText(ev.target?.result as string);
    };
    reader.readAsText(f);
  };

  const handleDownloadTemplate = () => {
    const template = 'Day,Start Time,End Time,Subject,Teacher,Room\nMonday,07:30,08:00,English,Grace Nankunda,102\nTuesday,08:30,09:00,Mathematics,John Smith,105';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (csvText.trim()) {
      onImport(csvText);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={handleDownloadTemplate} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
        <Download className="w-3 h-3" /> Download CSV Template
      </button>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input type="file" accept=".csv" onChange={handleFileUpload} className="text-sm" />
        <p className="text-xs text-gray-500 mt-2">Upload a CSV file with columns: Day, Start Time, End Time, Subject, Teacher, Room</p>
      </div>
      <textarea
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
        rows={6}
        placeholder="Or paste CSV content here...&#10;Day,Start Time,End Time,Subject,Teacher,Room&#10;Monday,07:30,08:00,English,Grace,102"
      />
      <button onClick={handleImport} disabled={!csvText.trim()} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50">
        Import
      </button>
    </div>
  );
}

// Add print styles to hide sidebar, header, and everything except the timetable
const style = document.createElement('style');
style.id = 'timetable-print-styles';
style.textContent = `
@media print {
  /* Hide sidebar */
  aside, [class*="sidebar"], [class*="Sidebar"] { display: none !important; }
  
  /* Hide top header/nav bar */
  header, [class*="topbar"], [class*="TopBar"], [class*="top-nav"] { display: none !important; }
  
  /* Hide all interactive elements and print:hidden items */
  .print\\:hidden, button, select, input, textarea { display: none !important; }
  .print\\:block { display: block !important; }
  
  /* Show the print header */
  .hidden.print\\:block { display: block !important; margin-bottom: 8px !important; }
  .hidden.print\\:block h1 { font-size: 16px !important; margin: 0 !important; }
  .hidden.print\\:block p { font-size: 10px !important; margin: 0 !important; }
  
  /* Table styling - 24 rows will span 2 pages */
  table { font-size: 8px !important; width: 100% !important; border-collapse: collapse !important; }
  th, td { padding: 3px 2px !important; border: 0.5px solid #ccc !important; line-height: 1.15 !important; }
  th { font-size: 7px !important; padding: 4px !important; background: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  
  /* Midnight separator */
  .bg-gray-800 { background: #374151 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .text-white { color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  
  /* Cell colors - preserved for print */
  .bg-blue-100, [style*="background-color"] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .bg-amber-100 { background: #fef3c7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .bg-gray-50\\/50 { background: #f9fafb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  
  /* Page setup - landscape, minimal margins */
  @page { margin: 6mm; size: landscape; }
  
  /* Remove shadows and decorations */
  .bg-white { box-shadow: none !important; border: none !important; }
  .overflow-x-auto { overflow: visible !important; }
  .space-y-4 { margin: 0 !important; }
  .rounded-lg { border-radius: 0 !important; }
  .shadow { box-shadow: none !important; }
  
  /* Remove sticky positioning */
  .sticky { position: static !important; z-index: auto !important; }
  
  /* Keep room info visible */
  .text-gray-400 { display: block !important; font-size: 7px !important; }
}
`;
if (!document.getElementById('timetable-print-styles')) {
  document.head.appendChild(style);
}

export default TimetableGrid;
