import api from "@/utils/api.js";

// Get all interviews
export const getInterviewsList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/admissions/interviews", { params: queryParams }).then(res => res.data);
};

// Get interview by ID
export const getInterviewById = (id: number) => {
  return api.get(`/admissions/interviews/${id}`).then(res => res.data);
};

// Schedule/Create interview
export const saveInterview = (data: any) => {
  return data.id
    ? api.put(`/admissions/interviews/${data.id}`, data)
    : api.post("/admissions/interviews", data);
};

// Complete interview with outcome
export const completeInterview = (id: number, data: any) => {
  return api.post(`/admissions/interviews/${id}/complete`, data).then(res => res.data);
};

// Delete/Cancel interview
export const removeInterview = (id: number) => {
  return api.delete(`/admissions/interviews/${id}`);
};

// Get interview statistics
export const getInterviewStatistics = () => {
  return api.get("/admissions/interviews/statistics").then(res => res.data);
};

// Get pending interviews (applications needing interview scheduling)
export const getPendingInterviews = () => {
  return api.get("/admissions/interviews/pending").then(res => res.data);
};
