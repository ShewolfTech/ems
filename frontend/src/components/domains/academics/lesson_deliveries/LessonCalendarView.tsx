import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLessonsByDate } from "@/domains/academics/lesson_deliveries/hooks/useLessonDeliveries.js";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  FileText,
} from "lucide-react";

export function LessonCalendarView() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data, loading, reload } = useLessonsByDate({ date: selectedDate });

  useEffect(() => {
    reload(selectedDate);
  }, [selectedDate]);

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'postponed':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      planned: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-yellow-100 text-yellow-800',
    };
    return config[status] || config.planned;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Lesson Calendar</h3>
            <p className="text-sm text-gray-500">View what was taught on any day</p>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Today
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <button
          onClick={goToPreviousDay}
          className="p-2 hover:bg-white rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h4 className="text-lg font-semibold">{formatDate(selectedDate)}</h4>
        <button
          onClick={goToNextDay}
          className="p-2 hover:bg-white rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Lessons List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            <p>Loading...</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No lessons recorded for this date</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((lesson: any) => (
              <div
                key={lesson.delivery_id}
                className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(lesson.status)}
                      <h5 className="font-bold text-gray-900">{lesson.subject_name || lesson.subject_code || 'Lesson'}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lesson.status)}`}>
                        {lesson.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Class:</span> {lesson.class_name || lesson.class_code}
                      </div>
                      <div>
                        <span className="font-medium">Teacher:</span> {lesson.teacher_name}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {lesson.start_time} - {lesson.end_time}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher Notes */}
                {lesson.teacher_notes && (
                  <div className="mt-3 bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {lesson.teacher_notes}
                    </p>
                  </div>
                )}

                {/* Objectives Covered */}
                {lesson.objectives_covered !== null && lesson.objectives_covered !== undefined && (
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${lesson.objectives_covered ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {lesson.objectives_covered ? '✓ Objectives covered' : '✗ Objectives not covered'}
                    </span>
                  </div>
                )}

                {/* Resources Used */}
                {lesson.resources_used && lesson.resources_used.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Resources Used:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {lesson.resources_used.map((resource: string, idx: number) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Homework Assigned */}
                {lesson.homework_assigned && lesson.homework_assigned.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Homework Assigned:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {lesson.homework_assigned.map((hw: string, idx: number) => (
                        <span key={idx} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          {hw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenges */}
                {lesson.challenges_faced && (
                  <div className="mt-3 bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Challenges:</span> {lesson.challenges_faced}
                    </p>
                  </div>
                )}

                {/* Follow Up */}
                {lesson.follow_up_needed && (
                  <div className="mt-2 bg-orange-50 p-3 rounded">
                    <p className="text-sm text-orange-800">
                      <span className="font-medium">⚠ Follow-up needed:</span> {lesson.follow_up_notes || 'Yes'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonCalendarView;
