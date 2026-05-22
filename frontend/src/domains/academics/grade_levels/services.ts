import api from "@/utils/api.js";

export const getGradeLevelsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/grade-levels", { params: queryParams }).then(res => res.data);
};

export const getGradeLevelsMeta = () => 
  api.get("/academics/grade-levels/permissions-meta").then(res => res.data);

export const getGradeLevelsSidebar = () => 
  api.get("/academics/grade-levels/sidebar").then(res => res.data);

export const saveGradeLevels = (data: any) =>
  data.id ? api.put(`${"/academics/grade-levels"}/${data.id}`, data) : api.post("/academics/grade-levels", data);

export const removeGradeLevels = (id: any) =>
  api.delete(`${"/academics/grade-levels"}/${id}`);

export const bulkCreateGradeLevels = (data: any[]) =>
  api.post("/academics/grade-levels/bulk", data).then(res => res.data);