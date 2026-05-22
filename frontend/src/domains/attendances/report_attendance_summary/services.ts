import api from "@/utils/api.js";

export const getReportAttendanceSummaryList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/attendances/report-attendance-summary", { params: queryParams }).then(res => res.data);
};

export const getReportAttendanceSummaryMeta = () => 
  api.get("/attendances/report-attendance-summary/permissions-meta").then(res => res.data);

export const getReportAttendanceSummarySidebar = () => 
  api.get("/attendances/report-attendance-summary/sidebar").then(res => res.data);

export const saveReportAttendanceSummary = (data: any) => 
  data.id ? api.put(`${"/attendances/report-attendance-summary"}/${data.id}`, data) : api.post("/attendances/report-attendance-summary", data);

export const removeReportAttendanceSummary = (id: any) => 
  api.delete(`${"/attendances/report-attendance-summary"}/${id}`);