import api from "@/utils/api.js";

// Decisions
export const makeDecision = (data: any) => {
  return api.post("/admissions/decisions/make-decision", data).then(res => res.data);
};

export const getDecision = (applicationId: number) => {
  return api.get(`/admissions/decisions/decision/${applicationId}`).then(res => res.data);
};

export const updateDecisionResponse = (decisionId: number, response: string, notes?: string) => {
  return api.post(`/admissions/decisions/decision/${decisionId}/respond`, {
    response,
    response_notes: notes,
  }).then(res => res.data);
};

// Enrollments
export const createEnrollment = (data: any) => {
  return api.post("/admissions/decisions/enroll", data).then(res => res.data);
};

export const completeEnrollment = (enrollmentId: number, data: {
  documentsSubmitted?: string[];
  studentData?: {
    middleName?: string;
    nationality?: string;
    address?: string;
    city?: string;
    district?: string;
    medicalConditions?: string;
    allergies?: string;
    bloodType?: string;
    specialNeeds?: string;
    guardians?: Array<{
      firstName: string;
      lastName: string;
      relationship: string;
      email?: string;
      phone?: string;
      isPrimary?: boolean;
      isEmergencyContact?: boolean;
      canPickup?: boolean;
    }>;
  };
}) => {
  return api.post(`/admissions/decisions/enrollment/${enrollmentId}/complete`, data).then(res => res.data);
};

export const getEnrollment = (applicationId: number) => {
  return api.get(`/admissions/decisions/enrollment/${applicationId}`).then(res => res.data);
};

// Statistics
export const getPipelineStats = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return api.get("/admissions/decisions/pipeline-stats", { params }).then(res => res.data);
};
