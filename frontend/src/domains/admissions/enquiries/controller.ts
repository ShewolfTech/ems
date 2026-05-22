import api from "@/utils/api.js";

export const getEnquiriesList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/admissions/enquiries", { params: queryParams }).then(res => res.data);
};

export const getEnquiryById = (id: number) => {
  return api.get(`/admissions/enquiries/${id}`).then(res => res.data);
};

export const getEnquiriesMeta = () => {
  return api.get("/admissions/enquiries/permissions-meta").then(res => res.data);
};

export const getEnquiriesSidebar = () => {
  return api.get("/admissions/enquiries/sidebar").then(res => res.data);
};

export const getEnquiriesStatistics = (dateFrom?: string, dateTo?: string) => {
  const params: any = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  return api.get("/admissions/enquiries/statistics", { params }).then(res => res.data);
};

export const saveEnquiry = (data: any) => {
  return data.id 
    ? api.put(`/admissions/enquiries/${data.id}`, data) 
    : api.post("/admissions/enquiries", data);
};

export const removeEnquiry = (id: number) => {
  return api.delete(`/admissions/enquiries/${id}`);
};

// Alias for deleteEnquiry
export const deleteEnquiry = removeEnquiry;

export const assignEnquiry = (id: number, assignedTo: number) => {
  return api.post(`/admissions/enquiries/${id}/assign`, { assigned_to: assignedTo });
};

export const updateEnquiryStatus = (id: number, status: string) => {
  return api.post(`/admissions/enquiries/${id}/status`, { status });
};

export const convertEnquiryToStudent = (id: number, studentId: number) => {
  return api.post(`/admissions/enquiries/${id}/convert`, { student_id: studentId });
};

// Enquiry Types (now called Categories)
export const getEnquiryTypes = () => {
  return api.get("/admissions/enquiries/categories").then(res => res.data);
};

export const saveEnquiryType = (data: any) => {
  return data.id
    ? api.put(`/admissions/enquiries/categories/${data.id}`, data)
    : api.post("/admissions/enquiries/categories", data);
};

export const removeEnquiryType = (id: number) => {
  return api.delete(`/admissions/enquiries/categories/${id}`);
};

// Enquiry Sources
export const getEnquirySources = () => {
  return api.get("/admissions/enquiries/sources").then(res => res.data);
};

export const saveEnquirySource = (data: any) => {
  return data.id 
    ? api.put(`/admissions/enquiries/sources/${data.id}`, data) 
    : api.post("/admissions/enquiries/sources", data);
};

export const removeEnquirySource = (id: number) => {
  return api.delete(`/admissions/enquiries/sources/${id}`);
};

// Enquiry Notes
export const getEnquiryNotes = (enquiryId: number) => {
  return api.get(`/admissions/enquiries/${enquiryId}/notes`).then(res => res.data);
};

export const saveEnquiryNote = (enquiryId: number, data: any) => {
  return api.post(`/admissions/enquiries/${enquiryId}/notes`, { ...data, enquiry_id: enquiryId });
};

export const removeEnquiryNote = (id: number) => {
  return api.delete(`/admissions/enquiries/notes/${id}`);
};

// Enquiry Attachments
export const getEnquiryAttachments = (enquiryId: number) => {
  return api.get(`/admissions/enquiries/${enquiryId}/attachments`).then(res => res.data);
};

export const saveEnquiryAttachment = (enquiryId: number, data: any) => {
  return api.post(`/admissions/enquiries/${enquiryId}/attachments`, { ...data, enquiry_id: enquiryId });
};

export const removeEnquiryAttachment = (id: number) => {
  return api.delete(`/admissions/enquiries/attachments/${id}`);
};

// Users (for assignment) - from profiles domain
export const getUsersList = () => {
  return api.get("/profiles/users").then(res => res.data);
};
