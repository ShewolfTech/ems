import api from "@/utils/api.js";

export const getReportLeaveSummaryList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/attendances/report-leave-summary", { params: queryParams }).then(res => res.data);
};

export const getReportLeaveSummaryMeta = () => 
  api.get("/attendances/report-leave-summary/permissions-meta").then(res => res.data);

export const getReportLeaveSummarySidebar = () => 
  api.get("/attendances/report-leave-summary/sidebar").then(res => res.data);

export const saveReportLeaveSummary = (data: any) => 
  data.id ? api.put(`${"/attendances/report-leave-summary"}/${data.id}`, data) : api.post("/attendances/report-leave-summary", data);

export const removeReportLeaveSummary = (id: any) => 
  api.delete(`${"/attendances/report-leave-summary"}/${id}`);