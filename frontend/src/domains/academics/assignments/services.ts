import api from "@/utils/api.js";

export const getAssignmentsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/assignments", { params: queryParams }).then(res => res.data);
};

export const getAssignmentById = (id: number | string) => {
  return api.get(`/academics/assignments/${id}`).then(res => res.data);
};

export const getAssignmentsMeta = () =>
  api.get("/academics/assignments/permissions-meta").then(res => res.data);

export const getAssignmentsSidebar = () =>
  api.get("/academics/assignments/sidebar").then(res => res.data);

export const saveAssignments = (data: any) =>
  data.id ? api.put(`/academics/assignments/${data.id}`, data) : api.post("/academics/assignments", data);

export const removeAssignments = (id: any) =>
  api.delete(`/academics/assignments/${id}`);

export const bulkCreateSubmissions = (data: any) =>
  api.post("/academics/assignments/bulk-submissions", data).then(res => res.data);

export const getAssignmentsAnalytics = (params: { class_id: number; term_id?: number }) =>
  api.get("/academics/assignments/analytics", { params }).then(res => res.data);