import api from "@/utils/api.js";

export const getTermsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/terms", { params: queryParams }).then(res => res.data);
};

export const getTermsMeta = () => 
  api.get("/academics/terms/permissions-meta").then(res => res.data);

export const getTermsSidebar = () => 
  api.get("/academics/terms/sidebar").then(res => res.data);

export const saveTerms = (data: any) =>
  data.id ? api.put(`${"/academics/terms"}/${data.id}`, data) : api.post("/academics/terms", data);

export const removeTerms = (id: any) =>
  api.delete(`${"/academics/terms"}/${id}`);

export const bulkCreateTerms = (data: any[]) =>
  api.post("/academics/terms/bulk", data).then(res => res.data);