import api from "@/utils/api.js";

export const getAttendanceRecordsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/attendances/attendance-records", { params: queryParams }).then(res => res.data);
};

export const getAttendanceRecordsMeta = () => 
  api.get("/attendances/attendance-records/permissions-meta").then(res => res.data);

export const getAttendanceRecordsSidebar = () => 
  api.get("/attendances/attendance-records/sidebar").then(res => res.data);

export const saveAttendanceRecords = (data: any) => 
  data.id ? api.put(`${"/attendances/attendance-records"}/${data.id}`, data) : api.post("/attendances/attendance-records", data);

export const removeAttendanceRecords = (id: any) => 
  api.delete(`${"/attendances/attendance-records"}/${id}`);