export interface Decision {
  id?: number;
  application_id: number;
  decision_type: 'offered' | 'waitlisted' | 'rejected';
  offer_details?: {
    grade_offered: string;
    stream_offered: string;
    academic_year: string;
    fees_category: string;
  };
  rejection_reason?: string;
  waitlist_position?: number;
  decision_date?: string;
  decision_by?: number;
}

export interface Enrollment {
  id?: number;
  application_id: number;
  student_id?: number;
  enrollment_date: string;
  academic_year: string;
  grade_id?: number;
  stream_id?: number;
  fees_category: string;
  enrollment_status: 'pending_documents' | 'fees_pending' | 'completed';
  documents_submitted?: string[];
}

export interface PipelineStats {
  total: number;
  pending: number;
  under_review: number;
  interview_scheduled: number;
  offered: number;
  waitlisted: number;
  rejected: number;
  enrolled: number;
  conversion_rate: string;
}
