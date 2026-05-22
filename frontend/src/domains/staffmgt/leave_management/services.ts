import api from "@/utils/api.js";

// Leave Requests
export const getLeaveRequests = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch'].includes(key))
  ) : {};
  return api.get("/staffmgt/leave-requests", { params: queryParams }).then(res => res.data);
};

export const getLeaveRequest = (id: number) =>
  api.get(`/staffmgt/leave-requests/${id}`).then(res => res.data);

export const saveLeaveRequest = (data: any) =>
  data.id ? api.put(`/staffmgt/leave-requests/${data.id}`, data) : api.post("/staffmgt/leave-requests", data);

export const removeLeaveRequest = (id: number) =>
  api.delete(`/staffmgt/leave-requests/${id}`);

export const approveLeaveRequest = (id: number, approved_by: number) =>
  api.post("/staffmgt/leave-requests/approve", { leave_request_id: id, approved_by }).then(res => res.data);

export const rejectLeaveRequest = (id: number, approved_by: number, reason: string) =>
  api.post("/staffmgt/leave-requests/reject", { leave_request_id: id, approved_by, reason }).then(res => res.data);

// Leave Types
export const getLeaveTypes = () =>
  api.get("/staffmgt/leave-types").then(res => res.data);

export const saveLeaveType = (data: any) =>
  data.id ? api.put(`/staffmgt/leave-types/${data.id}`, data) : api.post("/staffmgt/leave-types", data);

// Leave Quotas
export const getLeaveQuotas = (params?: { staff_id?: number; year?: number }) =>
  api.get("/staffmgt/leave-quotas", { params }).then(res => res.data);

export const saveLeaveQuota = (data: any) =>
  data.id ? api.put(`/staffmgt/leave-quotas/${data.id}`, data) : api.post("/staffmgt/leave-quotas", data);

// Analytics and Summaries
export const getLeaveStatistics = (params?: { date_from?: string; date_to?: string }) =>
  api.get("/staffmgt/leave-requests/statistics", { params }).then(res => res.data);

export const getStaffLeaveSummary = (staff_id: number, year?: number) =>
  api.get(`/staffmgt/leave-requests/staff-summary/${staff_id}`, { params: { year } }).then(res => res.data);

export const getLeaveCalendar = (params?: { month?: number; year?: number; staff_id?: number }) =>
  api.get("/staffmgt/leave-requests/calendar", { params }).then(res => res.data);

export const getLeaveBalance = (staff_id: number) =>
  api.get(`/staffmgt/leave-requests/balance/${staff_id}`).then(res => res.data);
