import api from "@/utils/api.js";

export const getExamsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/exams", { params: queryParams }).then(res => res.data);
};

export const getExamsMeta = () =>
  api.get("/academics/exams/permissions-meta").then(res => res.data);

export const getExamsSidebar = () =>
  api.get("/academics/exams/sidebar").then(res => res.data);

export const saveExams = (data: any) =>
  data.id ? api.put(`${"/academics/exams"}/${data.id}`, data) : api.post("/academics/exams", data);

export const removeExams = (id: any) =>
  api.delete(`${"/academics/exams"}/${id}`);

export const getExamAnalytics = (params?: any) => {
  return api.get("/academics/exams/analytics", { params }).then(res => res.data);
};

export const bulkCreateExamResults = (data: any) => {
  return api.post("/academics/exams/bulk-results", data).then(res => res.data);
};