import api from "@/utils/api.js";

export const getAuditlogsReportList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/audit/auditlogs-report", { params: queryParams }).then(res => res.data);
};

export const getAuditlogsReportMeta = () => 
  api.get("/audit/auditlogs-report/permissions-meta").then(res => res.data);

export const getAuditlogsReportSidebar = () => 
  api.get("/audit/auditlogs-report/sidebar").then(res => res.data);

export const saveAuditlogsReport = (data: any) => 
  data.id ? api.put(`${"/audit/auditlogs-report"}/${data.id}`, data) : api.post("/audit/auditlogs-report", data);

export const removeAuditlogsReport = (id: any) => 
  api.delete(`${"/audit/auditlogs-report"}/${id}`);