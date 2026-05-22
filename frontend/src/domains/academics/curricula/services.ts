import api from "@/utils/api.js";

export const getCurriculaList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/curricula", { params: queryParams }).then(res => res.data);
};

export const getCurriculaMeta = () => 
  api.get("/academics/curricula/permissions-meta").then(res => res.data);

export const getCurriculaSidebar = () => 
  api.get("/academics/curricula/sidebar").then(res => res.data);

export const saveCurricula = (data: any) =>
  data.id ? api.put(`${"/academics/curricula"}/${data.id}`, data) : api.post("/academics/curricula", data);

export const removeCurricula = (id: any) =>
  api.delete(`${"/academics/curricula"}/${id}`);

export const bulkCreateCurricula = (data: any[]) =>
  api.post("/academics/curricula/bulk", data).then(res => res.data);