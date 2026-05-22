// Types for Assignments module

/**
 * Represents the full Assignments record
 */
export interface AssignmentsType {
  id?: number;
  school_id?: number;
  class_id?: number | null;
  subject_id?: number | null;
  term_id?: number | null;
  title: string;
  description?: string | null;
  due_date: string | Date;
  max_score: number;
  weight?: number;
  status_id?: number | null;
  teacher_id?: number | null;
  teacher_comments?: Record<string, any> | null;
  is_active?: boolean;
  is_deleted?: boolean;
  created_by?: number;
  updated_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Represents the data required to create a new Assignment
 */
export interface CreateAssignmentInput {
  class_id?: number | null;
  subject_id?: number | null;
  term_id?: number | null;
  title: string;
  description?: string | null;
  due_date: string | Date;
  max_score: number;
  weight?: number;
  status_id?: number | null;
  teacher_id?: number | null;
  teacher_comments?: Record<string, any> | null;
  is_active?: boolean;
}

/**
 * Represents the data required to update an existing Assignment
 */
export interface UpdateAssignmentInput extends Partial<CreateAssignmentInput> {
  id: number;
}

/**
 * Represents an assignment submission record
 */
export interface AssignmentSubmissionType {
  id?: number;
  school_id?: number;
  assignment_id: number;
  student_id: number;
  score?: number | null;
  grade_letter?: string | null;
  grade_point?: number | null;
  remarks?: string | null;
  submission_date?: string | Date;
  graded_by?: number | null;
  graded_on?: Date | null;
  status_id?: number | null;
  teacher_comments?: Record<string, any> | null;
  file_url?: string | null;
  content?: string | null;
  is_deleted?: boolean;
  created_by?: number;
  updated_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Bulk submission input for bulkCreateSubmissions
 */
export interface BulkSubmissionInput {
  student_id: number;
  score: number;
  grade_letter?: string | null;
  grade_point?: number | null;
  remarks?: string | null;
  submission_date?: string | Date;
}

/**
 * Bulk submissions payload
 */
export interface BulkSubmissionsPayload {
  assignment_id: number;
  max_score: number;
  submissions: BulkSubmissionInput[];
}
