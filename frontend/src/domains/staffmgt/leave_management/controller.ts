import * as service from "./services.js";

export const loadLeaveRequests = (p?: any) => service.getLeaveRequests(p);
export const loadLeaveRequest = (id: number) => service.getLeaveRequest(id);
export const saveLeaveRequest = (d: any) => service.saveLeaveRequest(d);
export const removeLeaveRequest = (id: number) => service.removeLeaveRequest(id);
export const approveLeave = (id: number, approved_by: number) => service.approveLeaveRequest(id, approved_by);
export const rejectLeave = (id: number, approved_by: number, reason: string) => service.rejectLeaveRequest(id, approved_by, reason);

export const loadLeaveTypes = () => service.getLeaveTypes();
export const saveLeaveType = (d: any) => service.saveLeaveType(d);

export const loadLeaveQuotas = (p?: any) => service.getLeaveQuotas(p);
export const saveLeaveQuota = (d: any) => service.saveLeaveQuota(d);

export const loadLeaveStatistics = (p?: any) => service.getLeaveStatistics(p);
export const loadStaffLeaveSummary = (staff_id: number, year?: number) => service.getStaffLeaveSummary(staff_id, year);
export const loadLeaveCalendar = (p?: any) => service.getLeaveCalendar(p);
export const loadLeaveBalance = (staff_id: number) => service.getLeaveBalance(staff_id);
