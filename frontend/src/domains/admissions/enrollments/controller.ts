import api from "@/utils/api.js";

export const getEnrollmentsList = (params?: any) =>
  api.get("/admissions/enrollments", { params }).then(res => res.data);

export const getEnrollmentById = (id: string) =>
  api.get(`/admissions/enrollments/${id}`).then(res => res.data);

export const createEnrollment = (data: any) =>
  api.post("/admissions/enrollments", data).then(res => res.data);

export const confirmEnrollment = (id: string, documents_submitted?: string[]) =>
  api.post(`/admissions/enrollments/${id}/confirm`, { documents_submitted }).then(res => res.data);

export const updateEnrollment = (id: string, data: any) =>
  api.put(`/admissions/enrollments/${id}`, data).then(res => res.data);

export const removeEnrollment = (id: string) =>
  api.delete(`/admissions/enrollments/${id}`).then(res => res.data);

export const getEnrollmentStatistics = () =>
  api.get("/admissions/enrollments/statistics").then(res => res.data);
