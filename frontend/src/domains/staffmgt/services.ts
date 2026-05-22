import api from "@/utils/api";
import { 
  StaffMember, 
  StaffAttendance, 
  LeaveRequest, 
  StaffContract,
  JobPosting
} from "./types.js";

const BASE_PATH = "/staffmgt";

export const StaffService = {
  // --- Staff Directory ---
  getStaff: (filters?: any) => 
    api.get<StaffMember[]>(`${BASE_PATH}/staff`, { params: filters }),
    
  getStaffById: (id: number) => 
    api.get<StaffMember>(`${BASE_PATH}/staff/${id}`),

  // --- Attendance ---
  getAttendance: (params: { staff_id?: number; start_date?: string; end_date?: string }) =>
    api.get<StaffAttendance[]>(`${BASE_PATH}/attendance`, { params }),

  clockIn: (deviceId?: string) => 
    api.post(`${BASE_PATH}/attendance/clock-in`, { device_id: deviceId }),

  clockOut: () => 
    api.post(`${BASE_PATH}/attendance/clock-out`),

  getAttendanceSummary: (date?: string) =>
    api.get(`${BASE_PATH}/attendance/summary`, { params: { date } }),

  // --- Leave Management ---
  getLeaveRequests: (filters?: any) =>
    api.get<LeaveRequest[]>(`${BASE_PATH}/leave/requests`, { params: filters }),

  submitLeaveRequest: (data: Partial<LeaveRequest>) =>
    api.post(`${BASE_PATH}/leave/requests`, data),

  approveLeave: (id: number) =>
    api.post(`${BASE_PATH}/leave/requests/${id}/approve`),

  rejectLeave: (id: number, reason: string) =>
    api.post(`${BASE_PATH}/leave/requests/${id}/reject`, { reason }),
    
  getLeaveQuotas: (staffId: number, year: number) =>
    api.get(`${BASE_PATH}/leave/quotas`, { params: { staff_id: staffId, year } }),

  // --- Contracts ---
  getContracts: (staffId?: number) =>
    api.get<StaffContract[]>(`${BASE_PATH}/contracts`, { params: { staff_id: staffId } }),

  createContract: (data: Partial<StaffContract>) =>
    api.post(`${BASE_PATH}/contracts`, data),

  renewContract: (id: number, data: { new_end_date: string; new_salary: number }) =>
    api.post(`${BASE_PATH}/contracts/${id}/renew`, data),

  // --- Hiring ---
  getJobs: (status?: string) =>
    api.get<JobPosting[]>(`${BASE_PATH}/jobs`, { params: { status } }),

  createJob: (data: Partial<JobPosting>) =>
    api.post(`${BASE_PATH}/jobs`, data),

  // --- Performance ---
  getPerformanceReviews: (staffId?: number) =>
    api.get(`${BASE_PATH}/performance/reviews`, { params: { staff_id: staffId } }),

  createPerformanceReview: (data: any) =>
    api.post(`${BASE_PATH}/performance/reviews`, data),

  // --- Payroll ---
  getPayrollRecords: () =>
    api.get(`${BASE_PATH}/payroll`),
    
  updatePayroll: (id: number, data: any) =>
    api.put(`${BASE_PATH}/payroll/${id}`, data),

  // --- Configuration ---
  getDepartments: () =>
    api.get(`${BASE_PATH}/departments`),
    
  getStaffRoles: () =>
    api.get(`${BASE_PATH}/roles`),
    
  getEmploymentTypes: () =>
    api.get(`${BASE_PATH}/employment-types`),
    
  getEducationLevels: () =>
    api.get(`${BASE_PATH}/education-levels`),
};

export default StaffService;