import api from "@/utils/api.js";

export const getAttendanceStatusList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/studentsmgt/attendance-status", { params: queryParams }).then(res => res.data);
};

export const getAttendanceStatusMeta = () => 
  api.get("/studentsmgt/attendance-status/permissions-meta").then(res => res.data);

export const getAttendanceStatusSidebar = () => 
  api.get("/studentsmgt/attendance-status/sidebar").then(res => res.data);

export const saveAttendanceStatus = (data: any) => 
  data.id ? api.put(`${"/studentsmgt/attendance-status"}/${data.id}`, data) : api.post("/studentsmgt/attendance-status", data);

export const removeAttendanceStatus = (id: any) => 
  api.delete(`${"/studentsmgt/attendance-status"}/${id}`);