import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Award,
  Clock,
  MapPin,
  Users,
  Eye,
  FileText,
} from "lucide-react";
import api from "@/utils/api.js";

interface Exam {
  id: number;
  title: string;
  class_name: string;
  class_code: string;
  subject_name: string;
  subject_code: string;
  term_name: string;
  exam_date: string;
  start_time: string | null;
  end_time: string | null;
  max_score: number;
  weight: number;
  conductors: Array<{ name: string; role: string }>;
}

export function ExamCalendarPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showExamDetail, setShowExamDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [examsRes, classesRes, termsRes, subjectsRes] = await Promise.all([
        api.get("/academics/exams"),
        api.get("/academics/classes"),
        api.get("/academics/terms"),
        api.get("/academics/subjects"),
      ]);
      setExams(examsRes.data?.data || []);
      setClasses(classesRes.data?.data || []);
      setTerms(termsRes.data?.data || []);
      setSubjects(subjectsRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = useMemo(() => {
    let filtered = exams;
    if (selectedClass) {
      filtered = filtered.filter((e) => String(e.class_id) === String(selectedClass));
    }
    if (selectedTerm) {
      filtered = filtered.filter((e) => String(e.term_id) === String(selectedTerm));
    }
    if (selectedSubject) {
      filtered = filtered.filter((e) => String(e.subject_id) === String(selectedSubject));
    }
    return filtered;
  }, [exams, selectedClass, selectedTerm, selectedSubject]);

  const examsByDate: Record<string, Exam[]> = {};
  for (const exam of filteredExams) {
    if (exam.exam_date) {
      const dateStr = exam.exam_date.split("T")[0];
      if (!examsByDate[dateStr]) examsByDate[dateStr] = [];
      examsByDate[dateStr].push(exam);
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/50 border border-slate-100" />);
  }

  const today = new Date().toISOString().split("T")[0];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayExams = examsByDate[dateStr] || [];
    const isToday = dateStr === today;
    const dateObj = new Date(dateStr);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    days.push(
      <div
        key={day}
        className={`h-32 border border-slate-100 p-2 transition-colors ${
          isToday
            ? "bg-teal-50 border-teal-300 ring-2 ring-teal-200"
            : isWeekend
            ? "bg-slate-50/30"
            : "bg-white hover:bg-slate-50"
        }`}
      >
        <div className={`text-xs font-bold mb-2 ${isToday ? "text-teal-700" : "text-slate-500"}`}>
          {day}
        </div>
        <div className="space-y-1 overflow-hidden max-h-[96px] overflow-y-auto">
          {dayExams.slice(0, 3).map((exam: Exam, idx: number) => {
            const timeStr =
              exam.start_time && exam.end_time
                ? `${exam.start_time.substring(0, 5)}-${exam.end_time.substring(0, 5)}`
                : "";
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedExam(exam);
                  setShowExamDetail(true);
                }}
                className="w-full text-left text-[10px] px-2 py-1.5 rounded-lg truncate bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors border border-purple-200"
                title={`${exam.title}\n${exam.class_name} - ${exam.subject_name}\n${timeStr}`}
              >
                <div className="font-semibold truncate">{exam.title}</div>
                {timeStr && (
                  <div className="text-[9px] text-purple-600 truncate">{timeStr}</div>
                )}
              </button>
            );
          })}
          {dayExams.length > 3 && (
            <div className="text-[10px] text-slate-500 font-medium text-center">
              +{dayExams.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  }

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1));
  const goToToday = () => setCurrentDate(new Date());

  // Stats
  const totalExams = filteredExams.length;
  const upcomingExams = filteredExams.filter((e) => {
    const examDate = new Date(e.exam_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return examDate >= today;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-600">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/academics/exams")}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-teal-600" />
                Exam Calendar
              </h1>
              <p className="text-slate-600 mt-1">View and manage examination schedules</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition-colors text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Total Exams</p>
                <p className="text-2xl font-bold text-slate-900">{totalExams}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-teal-600" />
              <div>
                <p className="text-sm text-slate-600">Upcoming</p>
                <p className="text-2xl font-bold text-slate-900">{upcomingExams}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Current Month</p>
            <p className="text-lg font-bold text-slate-900">{monthName}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">This Month's Exams</p>
            <p className="text-2xl font-bold text-slate-900">
              {Object.entries(examsByDate).filter(([dateStr]) => {
                const [dYear, dMonth] = dateStr.split("-").map(Number);
                return dYear === year && dMonth === month + 1;
              }).reduce((sum, [, dayExams]) => sum + (dayExams as Exam[]).length, 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All terms</option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-slate-50">
            <button
              onClick={goToPrevMonth}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">{monthName}</h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div className="grid grid-cols-7">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-xs font-bold text-slate-500 bg-slate-50 border-b border-slate-200 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
            {days}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded" />
              <span className="text-slate-700">Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-50 border-2 border-teal-300 rounded" />
              <span className="text-slate-700">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-50/30 border border-slate-200 rounded" />
              <span className="text-slate-700">Weekend</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Detail Modal */}
      {showExamDetail && selectedExam && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowExamDetail(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedExam.title}</h2>
                  <p className="text-teal-100">
                    {selectedExam.class_name} • {selectedExam.subject_name}
                  </p>
                </div>
                <button
                  onClick={() => setShowExamDetail(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(selectedExam.exam_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-xs text-slate-500">Time</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedExam.start_time && selectedExam.end_time
                        ? `${selectedExam.start_time.substring(0, 5)} - ${selectedExam.end_time.substring(0, 5)}`
                        : "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Award className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-xs text-slate-500">Max Score</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedExam.max_score}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-xs text-slate-500">Weight</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {parseFloat(selectedExam.weight).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <p className="text-xs font-semibold text-slate-700">Invigilation Staff</p>
                </div>
                {selectedExam.conductors && selectedExam.conductors.length > 0 ? (
                  <div className="space-y-2">
                    {selectedExam.conductors.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-slate-900">{c.name}</span>
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                          {c.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No staff assigned</p>
                )}
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Term</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedExam.term_name || "Not specified"}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  setShowExamDetail(false);
                  navigate(`/academics/exams/${selectedExam.id}`);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button
                onClick={() => setShowExamDetail(false)}
                className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-white transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamCalendarPage;
