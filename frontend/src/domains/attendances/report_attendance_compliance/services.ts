import api from "@/utils/api.js";

export const getReportAttendanceComplianceList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/attendances/report-attendance-compliance", { params: queryParams }).then(res => res.data);
};

export const getReportAttendanceComplianceMeta = () => 
  api.get("/attendances/report-attendance-compliance/permissions-meta").then(res => res.data);

export const getReportAttendanceComplianceSidebar = () => 
  api.get("/attendances/report-attendance-compliance/sidebar").then(res => res.data);

export const saveReportAttendanceCompliance = (data: any) => 
  data.id ? api.put(`${"/attendances/report-attendance-compliance"}/${data.id}`, data) : api.post("/attendances/report-attendance-compliance", data);

export const removeReportAttendanceCompliance = (id: any) => 
  api.delete(`${"/attendances/report-attendance-compliance"}/${id}`);