import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import api from "@/utils/api.js";

export function AssessmentCalendarPage() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/academics/assessments");
      setAssessments(data.data || []);
    } catch (err) {
      console.error("Failed to load assessments", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const assessmentsByDate: Record<string, any[]> = {};
  for (const assessment of assessments) {
    if (assessment.date) {
      const dateStr = assessment.date.split('T')[0];
      if (!assessmentsByDate[dateStr]) assessmentsByDate[dateStr] = [];
      assessmentsByDate[dateStr].push(assessment);
    }
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = [];
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />);
  }

  // Days of the month
  const today = new Date().toISOString().split('T')[0];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAssessments = assessmentsByDate[dateStr] || [];
    const isToday = dateStr === today;

    days.push(
      <div
        key={day}
        className={`h-24 border p-1 ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
      >
        <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
          {day}
        </div>
        <div className="space-y-0.5 overflow-hidden max-h-[72px]">
          {dayAssessments.slice(0, 2).map((a: any, idx: number) => (
            <div
              key={idx}
              className="text-[9px] px-1 py-0.5 rounded truncate bg-teal-100 text-teal-800"
              title={a.title}
            >
              {a.title}
            </div>
          ))}
          {dayAssessments.length > 2 && (
            <div className="text-[9px] text-gray-400">+{dayAssessments.length - 2} more</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Assessment Calendar</h1>
              <p className="text-sm text-gray-500">View upcoming assessment dates</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">{monthName}</h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                {day}
              </div>
            ))}
            {days}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-100 rounded" />
              <span>Assessment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded" />
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentCalendarPage;
