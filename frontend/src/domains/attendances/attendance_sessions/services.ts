import api from "@/utils/api.js";

export const getAttendanceSessionsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/attendances/attendance-sessions", { params: queryParams }).then(res => res.data);
};

export const getAttendanceSessionsMeta = () => 
  api.get("/attendances/attendance-sessions/permissions-meta").then(res => res.data);

export const getAttendanceSessionsSidebar = () => 
  api.get("/attendances/attendance-sessions/sidebar").then(res => res.data);

export const saveAttendanceSessions = (data: any) => 
  data.id ? api.put(`${"/attendances/attendance-sessions"}/${data.id}`, data) : api.post("/attendances/attendance-sessions", data);

export const removeAttendanceSessions = (id: any) => 
  api.delete(`${"/attendances/attendance-sessions"}/${id}`);