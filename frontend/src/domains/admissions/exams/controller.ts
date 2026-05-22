import api from "@/utils/api.js";

// Get all entrance exams
export const getEntranceExams = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/admissions/exams", { params: queryParams }).then(res => res.data);
};

// Get exams by application
export const getExamsByApplication = (applicationId: number) => {
  return api.get(`/admissions/exams/application/${applicationId}`).then(res => res.data);
};

// Create exam result
export const createExamResult = (data: any) => {
  return api.post("/admissions/exams", data).then(res => res.data);
};

// Update exam result
export const updateExamResult = (id: number, data: any) => {
  return api.put(`/admissions/exams/${id}`, data).then(res => res.data);
};

// Delete exam result
export const deleteExamResult = (id: number) => {
  return api.delete(`/admissions/exams/${id}`);
};

// Exam Sessions
export const getExamSessions = () => {
  return api.get("/admissions/exams/sessions").then(res => res.data);
};

export const createSession = (data: any) => {
  return api.post("/admissions/exams/sessions", data).then(res => res.data);
};

// Exam Definitions
export const getExamDefinitions = () => {
  return api.get("/admissions/exams/definitions").then(res => res.data);
};

export const createDefinition = (data: any) => {
  return api.post("/admissions/exams/definitions", data).then(res => res.data);
};
