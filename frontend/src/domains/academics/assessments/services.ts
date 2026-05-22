import api from "@/utils/api.js";

export const getAssessmentsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/assessments", { params: queryParams }).then(res => res.data);
};

export const getAssessmentsMeta = () => 
  api.get("/academics/assessments/permissions-meta").then(res => res.data);

export const getAssessmentsSidebar = () => 
  api.get("/academics/assessments/sidebar").then(res => res.data);

export const saveAssessments = (data: any) =>
  data.id ? api.put(`${"/academics/assessments"}/${data.id}`, data) : api.post("/academics/assessments", data);

export const removeAssessments = (id: any) =>
  api.delete(`${"/academics/assessments"}/${id}`);

export const bulkCreateAssessmentResults = (data: any[]) =>
  api.post("/academics/assessment-results/bulk", data).then(res => res.data);