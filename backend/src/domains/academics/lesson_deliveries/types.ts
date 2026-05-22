// Types for Lesson Deliveries
export type LessonDeliveryStatus = 'planned' | 'delivered' | 'cancelled' | 'postponed';

export type LessonDeliveryType = {
  id?: number;
  school_id?: number;
  lesson_id: number;
  scheduled_date: Date | string;
  delivered_at?: Date | string | null;
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
  created_at?: Date | string;
  created_by?: number | null;
  updated_at?: Date | string;
  updated_by?: number | null;
  is_deleted?: boolean;
  deleted_at?: Date | string | null;
  deleted_by?: number | null;
  // Joined fields
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

export type CreateLessonDeliveryInput = Partial<LessonDeliveryType>;
export type UpdateLessonDeliveryInput = Partial<LessonDeliveryType>;

export type QuickMarkDeliveryInput = {
  teacher_notes?: string;
  objectives_covered?: boolean;
  resources_used?: any[];
  homework_assigned?: any[];
  challenges_faced?: string;
};

export type GenerateDeliveriesInput = {
  start_date: string;
  end_date: string;
  class_id?: number;
  teacher_id?: number;
};

export type TodaysLessonsParams = {
  teacher_id?: number;
  class_id?: number;
  date?: string;
};
