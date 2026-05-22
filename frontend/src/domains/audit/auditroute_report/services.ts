import api from "@/utils/api.js";

export const getAuditrouteReportList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/audit/auditroute-report", { params: queryParams }).then(res => res.data);
};

export const getAuditrouteReportMeta = () => 
  api.get("/audit/auditroute-report/permissions-meta").then(res => res.data);

export const getAuditrouteReportSidebar = () => 
  api.get("/audit/auditroute-report/sidebar").then(res => res.data);

export const saveAuditrouteReport = (data: any) => 
  data.id ? api.put(`${"/audit/auditroute-report"}/${data.id}`, data) : api.post("/audit/auditroute-report", data);

export const removeAuditrouteReport = (id: any) => 
  api.delete(`${"/audit/auditroute-report"}/${id}`);