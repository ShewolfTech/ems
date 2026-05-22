import api from "@/utils/api.js";

export const getLeaveTypesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/attendances/leave-types", { params: queryParams }).then(res => res.data);
};

export const getLeaveTypesMeta = () => 
  api.get("/attendances/leave-types/permissions-meta").then(res => res.data);

export const getLeaveTypesSidebar = () => 
  api.get("/attendances/leave-types/sidebar").then(res => res.data);

export const saveLeaveTypes = (data: any) => 
  data.id ? api.put(`${"/attendances/leave-types"}/${data.id}`, data) : api.post("/attendances/leave-types", data);

export const removeLeaveTypes = (id: any) => 
  api.delete(`${"/attendances/leave-types"}/${id}`);