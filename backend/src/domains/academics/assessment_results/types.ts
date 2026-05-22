export type AssessmentResultType = {
  id?: number;
  school_id?: number;
  assessment_id: number;
  student_id: number;
  score: number;
  grade_letter?: string | null;
  grade_point?: number | null;
  remarks?: string | null;
  graded_by?: number | null;
  is_final?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  student_name?: string;
  student_first_name?: string;
  student_last_name?: string;
  student_reg_no?: string;
  assessment_title?: string;
  assessment_max_score?: number;
};

export type BulkGradeEntryInput = {
  assessment_id: number;
  grades: Array<{
    student_id: number;
    score: number;
    remarks?: string;
  }>;
};

export type BulkGradeResult = {
  created: number;
  updated: number;
  errors: string[];
};
