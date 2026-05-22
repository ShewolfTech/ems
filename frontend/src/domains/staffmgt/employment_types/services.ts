import api from "@/utils/api.js";

export const getEmploymentTypesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/staffmgt/employment-types", { params: queryParams }).then(res => res.data);
};

export const getEmploymentTypesMeta = () => 
  api.get("/staffmgt/employment-types/permissions-meta").then(res => res.data);

export const getEmploymentTypesSidebar = () => 
  api.get("/staffmgt/employment-types/sidebar").then(res => res.data);

export const saveEmploymentTypes = (data: any) => 
  data.id ? api.put(`${"/staffmgt/employment-types"}/${data.id}`, data) : api.post("/staffmgt/employment-types", data);

export const removeEmploymentTypes = (id: any) => 
  api.delete(`${"/staffmgt/employment-types"}/${id}`);