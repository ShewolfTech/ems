import api from "@/utils/api.js";

export const getCampusAccessLogsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/attendances/campus-access-logs", { params: queryParams }).then(res => res.data);
};

export const getCampusAccessLogsMeta = () => 
  api.get("/attendances/campus-access-logs/permissions-meta").then(res => res.data);

export const getCampusAccessLogsSidebar = () => 
  api.get("/attendances/campus-access-logs/sidebar").then(res => res.data);

export const saveCampusAccessLogs = (data: any) => 
  data.id ? api.put(`${"/attendances/campus-access-logs"}/${data.id}`, data) : api.post("/attendances/campus-access-logs", data);

export const removeCampusAccessLogs = (id: any) => 
  api.delete(`${"/attendances/campus-access-logs"}/${id}`);