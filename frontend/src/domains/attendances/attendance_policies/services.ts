import api from "@/utils/api.js";

export const getAttendancePoliciesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/attendances/attendance-policies", { params: queryParams }).then(res => res.data);
};

export const getAttendancePoliciesMeta = () => 
  api.get("/attendances/attendance-policies/permissions-meta").then(res => res.data);

export const getAttendancePoliciesSidebar = () => 
  api.get("/attendances/attendance-policies/sidebar").then(res => res.data);

export const saveAttendancePolicies = (data: any) => 
  data.id ? api.put(`${"/attendances/attendance-policies"}/${data.id}`, data) : api.post("/attendances/attendance-policies", data);

export const removeAttendancePolicies = (id: any) => 
  api.delete(`${"/attendances/attendance-policies"}/${id}`);