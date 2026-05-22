import api from "@/utils/api.js";

export const getInterviewsList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/admissions/interviews", { params: queryParams }).then(res => res.data);
};

export const getInterviewById = (id: number) => {
  return api.get(`/admissions/interviews/${id}`).then(res => res.data);
};

export const saveInterview = (data: any) => {
  return data.id
    ? api.put(`/admissions/interviews/${data.id}`, data)
    : api.post("/admissions/interviews", data);
};

export const completeInterview = (id: number, data: any) => {
  return api.post(`/admissions/interviews/${id}/complete`, data).then(res => res.data);
};

export const removeInterview = (id: number) => {
  return api.delete(`/admissions/interviews/${id}`);
};

export const getInterviewStatistics = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return api.get("/admissions/interviews/statistics", { params }).then(res => res.data);
};

export const getPendingInterviews = () => {
  return api.get("/admissions/interviews/pending").then(res => res.data);
};
