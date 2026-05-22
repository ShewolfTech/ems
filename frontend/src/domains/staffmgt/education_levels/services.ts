import api from "@/utils/api.js";

export const getEducationLevelsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/staffmgt/education-levels", { params: queryParams }).then(res => res.data);
};

export const getEducationLevelsMeta = () => 
  api.get("/staffmgt/education-levels/permissions-meta").then(res => res.data);

export const getEducationLevelsSidebar = () => 
  api.get("/staffmgt/education-levels/sidebar").then(res => res.data);

export const saveEducationLevels = (data: any) => 
  data.id ? api.put(`${"/staffmgt/education-levels"}/${data.id}`, data) : api.post("/staffmgt/education-levels", data);

export const removeEducationLevels = (id: any) => 
  api.delete(`${"/staffmgt/education-levels"}/${id}`);