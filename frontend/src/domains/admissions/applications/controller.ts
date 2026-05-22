import api from "@/utils/api.js";

// ==================== APPLICATIONS ====================

export const getApplicationsList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/admissions/applications", { params: queryParams }).then(res => res.data);
};

export const getApplicationById = (id: number) => {
  return api.get(`/admissions/applications/${id}`).then(res => res.data);
};

export const saveApplication = (data: any) => {
  return data.id
    ? api.put(`/admissions/applications/${data.id}`, data)
    : api.post("/admissions/applications", data);
};

export const removeApplication = (id: number) => {
  return api.delete(`/admissions/applications/${id}`);
};

// Convert Enquiry to Application
export const convertEnquiryToApplication = (data: any) => {
  return api.post("/admissions/applications/convert-from-enquiry", data);
};

// Get Statistics
export const getAdmissionStatistics = (params?: {
  startDate?: string;
  endDate?: string;
  statusId?: string;
}) => {
  return api.get("/admissions/applications/statistics", { params }).then(res => res.data);
};

// Get Dashboard Statistics (for charts)
export const getDashboardStats = () => {
  return api.get("/admissions/applications/dashboard-stats").then(res => res.data);
};

// ==================== APPLICANTS ====================

export const getApplicantsList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/admissions/applications/applicants", { params: queryParams }).then(res => res.data);
};

export const getApplicantById = (id: number) => {
  return api.get(`/admissions/applications/applicants/${id}`).then(res => res.data);
};

export const saveApplicant = (data: any) => {
  return data.id
    ? api.put(`/admissions/applications/applicants/${data.id}`, data)
    : api.post("/admissions/applications/applicants", data);
};

export const removeApplicant = (id: number) => {
  return api.delete(`/admissions/applications/applicants/${id}`);
};

// ==================== LOOKUP TABLES ====================

export const getAdmissionStatuses = () => {
  return api.get("/admissions/applications/statuses").then(res => res.data);
};

export const getApplicationTypes = () => {
  return api.get("/admissions/applications/types").then(res => res.data);
};
