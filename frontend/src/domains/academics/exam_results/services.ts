import api from "@/utils/api.js";

export const getExamResultsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/exam-results", { params: queryParams }).then(res => res.data);
};

export const getExamResultsMeta = () => 
  api.get("/academics/exam-results/permissions-meta").then(res => res.data);

export const getExamResultsSidebar = () => 
  api.get("/academics/exam-results/sidebar").then(res => res.data);

export const saveExamResults = (data: any) => 
  data.id ? api.put(`${"/academics/exam-results"}/${data.id}`, data) : api.post("/academics/exam-results", data);

export const removeExamResults = (id: any) => 
  api.delete(`${"/academics/exam-results"}/${id}`);