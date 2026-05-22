// Types for Lesson Deliveries domain
export type LessonDeliveryStatus = 'planned' | 'delivered' | 'cancelled' | 'postponed';

export type LessonDelivery = {
  id?: number;
  lesson_id: number;
  scheduled_date: string;
  delivered_at?: string | null;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  status: LessonDeliveryStatus;
  teacher_notes?: string | null;
  objectives_covered?: boolean | null;
  challenges_faced?: string | null;
  follow_up_needed?: boolean;
  follow_up_notes?: string | null;
  resources_used?: any[];
  homework_assigned?: any[];
  attendance_count?: number;
  total_students?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined fields from API
  class_name?: string;
  class_code?: string;
  subject_name?: string;
  subject_code?: string;
  teacher_name?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  lesson_title?: string;
  lesson_description?: string;
  start_time?: string;
  end_time?: string;
};

export type CreateLessonDelivery = Omit<LessonDelivery, 'id' | 'created_at' | 'updated_at'>;
export type UpdateLessonDelivery = Partial<LessonDelivery>;

export type QuickMarkDeliveryInput = {
  teacher_notes?: string;
  objectives_covered?: boolean;
  resources_used?: any[];
  homework_assigned?: any[];
  challenges_faced?: string;
  follow_up_needed?: boolean;
  follow_up_notes?: string;
};

export const LessonDeliveryMetadata = {
  resource: "lesson_deliveries",
  label: "Lesson Deliveries",
  fields: [
    { name: "lesson_id", label: "Lesson", uiType: "relation", relation: "lessons", required: true },
    { name: "scheduled_date", label: "Scheduled Date", uiType: "date", required: true },
    { name: "status", label: "Status", uiType: "select", required: true, options: ["planned", "delivered", "cancelled", "postponed"] },
    { name: "teacher_notes", label: "Teacher Notes", uiType: "textarea" },
    { name: "objectives_covered", label: "Objectives Covered", uiType: "boolean" },
    { name: "challenges_faced", label: "Challenges", uiType: "textarea" },
    { name: "follow_up_needed", label: "Follow Up Needed", uiType: "boolean" },
    { name: "follow_up_notes", label: "Follow Up Notes", uiType: "textarea" },
    { name: "resources_used", label: "Resources Used", uiType: "json" },
    { name: "homework_assigned", label: "Homework Assigned", uiType: "json" },
    { name: "attendance_count", label: "Attendance Count", uiType: "number" },
    { name: "total_students", label: "Total Students", uiType: "number" },
  ]
};
