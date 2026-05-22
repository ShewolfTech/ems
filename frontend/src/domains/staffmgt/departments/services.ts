import api from "@/utils/api.js";

export const getDepartmentsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/staffmgt/departments", { params: queryParams }).then(res => res.data);
};

export const getDepartmentsMeta = () => 
  api.get("/staffmgt/departments/permissions-meta").then(res => res.data);

export const getDepartmentsSidebar = () => 
  api.get("/staffmgt/departments/sidebar").then(res => res.data);

export const saveDepartments = (data: any) => 
  data.id ? api.put(`${"/staffmgt/departments"}/${data.id}`, data) : api.post("/staffmgt/departments", data);

export const removeDepartments = (id: any) => 
  api.delete(`${"/staffmgt/departments"}/${id}`);