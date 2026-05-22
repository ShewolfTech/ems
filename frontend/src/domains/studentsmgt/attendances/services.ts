import api from "@/utils/api.js";

export const getAttendancesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/studentsmgt/attendances", { params: queryParams }).then(res => res.data);
};

export const getAttendancesMeta = () => 
  api.get("/studentsmgt/attendances/permissions-meta").then(res => res.data);

export const getAttendancesSidebar = () => 
  api.get("/studentsmgt/attendances/sidebar").then(res => res.data);

export const saveAttendances = (data: any) => 
  data.id ? api.put(`${"/studentsmgt/attendances"}/${data.id}`, data) : api.post("/studentsmgt/attendances", data);

export const removeAttendances = (id: any) => 
  api.delete(`${"/studentsmgt/attendances"}/${id}`);