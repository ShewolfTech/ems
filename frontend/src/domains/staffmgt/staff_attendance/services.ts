import api from "@/utils/api.js";

// Attendance CRUD
export const getStaffAttendanceList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch'].includes(key))
  ) : {};
  return api.get("/staffmgt/staff-attendance", { params: queryParams }).then(res => res.data);
};

export const getStaffAttendance = (id: number) =>
  api.get(`/staffmgt/staff-attendance/${id}`).then(res => res.data);

export const saveStaffAttendance = (data: any) =>
  data.id ? api.put(`/staffmgt/staff-attendance/${data.id}`, data) : api.post("/staffmgt/staff-attendance", data);

export const removeStaffAttendance = (id: number) =>
  api.delete(`/staffmgt/staff-attendance/${id}`);

// Clock in/out
export const clockIn = (data: { staff_id: number; device_id?: string; location?: string }) =>
  api.post("/staffmgt/staff-attendance/clock-in", data).then(res => res.data);

export const clockOut = (data: { staff_id: number; device_id?: string }) =>
  api.post("/staffmgt/staff-attendance/clock-out", data).then(res => res.data);

// Summary and statistics
export const getTodaySummary = () =>
  api.get("/staffmgt/staff-attendance/today/summary").then(res => res.data);

export const getAttendanceStatistics = (params?: { date_from?: string; date_to?: string }) =>
  api.get("/staffmgt/staff-attendance/statistics", { params }).then(res => res.data);

export const getStaffMonthlySummary = (staff_id: number, month: number, year: number) =>
  api.get(`/staffmgt/staff-attendance/monthly-summary/${staff_id}/${month}/${year}`).then(res => res.data);

export const getAttendanceAnalytics = (params?: { period?: string; start_date?: string; end_date?: string }) =>
  api.get("/staffmgt/staff-attendance/analytics", { params }).then(res => res.data);
