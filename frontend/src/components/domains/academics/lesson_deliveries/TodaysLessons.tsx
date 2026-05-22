import React from "react";
import { useNavigate } from "react-router-dom";
import { useTodaysLessons } from "@/domains/academics/lesson_deliveries/hooks/useLessonDeliveries.js";
import { CheckCircle, XCircle, Clock, Loader2, ChevronRight } from "lucide-react";

interface TodaysLessonsProps {
  teacherId?: number;
  classId?: number;
}

const StatusIcon = ({ status }: { status: string }) => {
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

export function TodaysLessons({ teacherId, classId }: TodaysLessonsProps) {
  const navigate = useNavigate();
  const { data, loading, reload, markDelivered, markCancelled, markPostponed } = useTodaysLessons({
    autoFetch: true,
    params: { teacher_id: teacherId, class_id: classId },
  });

  const handleQuickMark = async (delivery: any, action: 'delivered' | 'cancelled' | 'postponed') => {
    try {
      if (action === 'delivered') {
        await markDelivered(delivery.delivery_id, { objectives_covered: true });
      } else if (action === 'cancelled') {
        await markCancelled(delivery.delivery_id, {});
      } else if (action === 'postponed') {
        await markPostponed(delivery.delivery_id, { follow_up_needed: true });
      }
      reload();
    } catch (err) {
      console.error("Failed to update delivery:", err);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Today's Lessons</h3>
          <p className="text-sm text-gray-500">{today}</p>
        </div>
        <button
          onClick={() => navigate("/academics/lesson-deliveries")}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No lessons scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((delivery: any) => (
            <div
              key={delivery.delivery_id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon status={delivery.status} />
                    <h4 className="font-semibold text-gray-900">{delivery.subject_name || delivery.subject_code || 'Lesson'}</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {delivery.class_name || delivery.class_code} • {delivery.teacher_name || 'Teacher'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {delivery.start_time} - {delivery.end_time}
                  </p>
                </div>
                {delivery.status === 'planned' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleQuickMark(delivery, 'delivered')}
                      className="p-1.5 bg-green-100 hover:bg-green-200 rounded text-green-700"
                      title="Mark as Delivered"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickMark(delivery, 'cancelled')}
                      className="p-1.5 bg-red-100 hover:bg-red-200 rounded text-red-700"
                      title="Mark as Cancelled"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickMark(delivery, 'postponed')}
                      className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-700"
                      title="Mark as Postponed"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {delivery.status === 'delivered' && delivery.objectives_covered && (
                <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  ✓ Objectives covered
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TodaysLessons;
