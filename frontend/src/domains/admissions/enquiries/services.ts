import api from "@/utils/api.js";
import type { Enquiry, EnquiryFilters, EnquiryFormData, EnquiryType, EnquirySource, EnquiryNote, EnquiryAttachment, EnquiryStatistics } from "./types.js";

export const getEnquiriesList = (params?: EnquiryFilters) => {
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

export const createEnquiry = (data: EnquiryFormData) => {
  return api.post("/admissions/enquiries", data).then(res => res.data);
};

export const updateEnquiry = (id: number, data: Partial<EnquiryFormData>) => {
  return api.put(`/admissions/enquiries/${id}`, data).then(res => res.data);
};

export const deleteEnquiry = (id: number) => {
  return api.delete(`/admissions/enquiries/${id}`).then(res => res.data);
};

// Enquiry Actions
export const assignEnquiry = (id: number, assignedTo: number) => {
  return api.post(`/admissions/enquiries/${id}/assign`, { assigned_to: assignedTo }).then(res => res.data);
};

export const updateEnquiryStatus = (id: number, status: string) => {
  return api.post(`/admissions/enquiries/${id}/status`, { status }).then(res => res.data);
};

export const convertEnquiryToStudent = (id: number, studentId: number) => {
  return api.post(`/admissions/enquiries/${id}/convert`, { student_id: studentId }).then(res => res.data);
};

// Enquiry Types
export const getEnquiryTypes = () => {
  return api.get("/admissions/enquiries/types").then(res => res.data);
};

export const createEnquiryType = (data: Partial<EnquiryType>) => {
  return api.post("/admissions/enquiries/types", data).then(res => res.data);
};

export const updateEnquiryType = (id: number, data: Partial<EnquiryType>) => {
  return api.put(`/admissions/enquiries/types/${id}`, data).then(res => res.data);
};

export const deleteEnquiryType = (id: number) => {
  return api.delete(`/admissions/enquiries/types/${id}`).then(res => res.data);
};

// Enquiry Sources
export const getEnquirySources = () => {
  return api.get("/admissions/enquiries/sources").then(res => res.data);
};

export const createEnquirySource = (data: Partial<EnquirySource>) => {
  return api.post("/admissions/enquiries/sources", data).then(res => res.data);
};

export const updateEnquirySource = (id: number, data: Partial<EnquirySource>) => {
  return api.put(`/admissions/enquiries/sources/${id}`, data).then(res => res.data);
};

export const deleteEnquirySource = (id: number) => {
  return api.delete(`/admissions/enquiries/sources/${id}`).then(res => res.data);
};

// Enquiry Notes
export const getEnquiryNotes = (enquiryId: number) => {
  return api.get(`/admissions/enquiries/${enquiryId}/notes`).then(res => res.data);
};

export const createEnquiryNote = (enquiryId: number, data: Partial<EnquiryNote>) => {
  return api.post(`/admissions/enquiries/${enquiryId}/notes`, { ...data, enquiry_id: enquiryId }).then(res => res.data);
};

export const updateEnquiryNote = (id: number, data: Partial<EnquiryNote>) => {
  return api.put(`/admissions/enquiries/notes/${id}`, data).then(res => res.data);
};

export const deleteEnquiryNote = (id: number) => {
  return api.delete(`/admissions/enquiries/notes/${id}`).then(res => res.data);
};

// Enquiry Attachments
export const getEnquiryAttachments = (enquiryId: number) => {
  return api.get(`/admissions/enquiries/${enquiryId}/attachments`).then(res => res.data);
};

export const createEnquiryAttachment = (enquiryId: number, data: Partial<EnquiryAttachment>) => {
  return api.post(`/admissions/enquiries/${enquiryId}/attachments`, { ...data, enquiry_id: enquiryId }).then(res => res.data);
};

export const deleteEnquiryAttachment = (id: number) => {
  return api.delete(`/admissions/enquiries/attachments/${id}`).then(res => res.data);
};
