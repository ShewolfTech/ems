import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, BookOpen } from "lucide-react";
import api from "@/utils/api.js";

export function AssignmentCalendarPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/academics/assignments");
      setAssignments(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load assignments", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter((a: any) => {
      const dueDate = new Date(a.due_date);
      return (
        dueDate.getFullYear() === date.getFullYear() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getDate() === date.getDate()
      );
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isOverdue = (date: Date) => {
    return date < today;
  };

  const calendarDays = useMemo(() => {
    const days: { day: number; date: Date; assignments: any[] }[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, date: new Date(), assignments: [] });
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayAssignments = getAssignmentsForDate(date);
      days.push({ day, date, assignments: dayAssignments });
    }

    return days;
  }, [year, month, assignments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-4 text-lg font-semibold text-slate-600">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-teal-600" />
                Assignment Calendar
              </h1>
              <p className="text-slate-600 mt-1">Visual overview of assignment due dates</p>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {dayNames.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayInfo, idx) => {
              const hasAssignments = dayInfo.assignments.length > 0;
              const overdue = dayInfo.day > 0 && isOverdue(dayInfo.date);
              
              return (
                <div
                  key={idx}
                  className={`min-h-[120px] p-2 border-b border-r border-slate-100 ${
                    dayInfo.day === 0 ? 'bg-slate-50' :
                    isToday(dayInfo.day) ? 'bg-teal-50' : 'bg-white'
                  } ${overdue ? 'bg-red-50/30' : ''}`}
                >
                  {dayInfo.day > 0 && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                            isToday(dayInfo.day)
                              ? 'bg-teal-600 text-white'
                              : overdue
                              ? 'text-red-600 font-bold'
                              : 'text-slate-700'
                          }`}
                        >
                          {dayInfo.day}
                        </span>
                        {hasAssignments && (
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                            {dayInfo.assignments.length}
                          </span>
                        )}
                      </div>
                      
                      {/* Assignment Indicators */}
                      <div className="space-y-1">
                        {dayInfo.assignments.slice(0, 3).map((assignment: any, aIdx: number) => (
                          <div
                            key={aIdx}
                            className="text-xs p-1.5 rounded bg-teal-100 text-teal-800 truncate font-medium"
                            title={assignment.title}
                          >
                            {assignment.title}
                          </div>
                        ))}
                        {dayInfo.assignments.length > 3 && (
                          <div className="text-xs text-slate-500 font-semibold pl-1">
                            +{dayInfo.assignments.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-teal-600" />
              <h3 className="font-bold text-slate-900">Total Assignments</h3>
            </div>
            <p className="text-3xl font-bold text-teal-600">{assignments.length}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-green-600" />
              <h3 className="font-bold text-slate-900">This Month</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {assignments.filter((a: any) => {
                const d = new Date(a.due_date);
                return d.getMonth() === month && d.getFullYear() === year;
              }).length}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-red-600" />
              <h3 className="font-bold text-slate-900">Overdue</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {assignments.filter((a: any) => new Date(a.due_date) < today).length}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Legend</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-600 rounded-full" />
              <span className="text-sm text-slate-700">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-100 rounded" />
              <span className="text-sm text-slate-700">Assignment Due</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 rounded border border-red-200" />
              <span className="text-sm text-slate-700">Overdue</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentCalendarPage;
