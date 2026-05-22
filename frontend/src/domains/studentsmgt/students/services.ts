import api from "@/utils/api.js";

export const getStudentsList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/studentsmgt/students", { params: queryParams }).then(res => res.data);
};

export const getStudentsMeta = () =>
  api.get("/studentsmgt/students/permissions-meta").then(res => res.data);

export const getStudentsSidebar = () =>
  api.get("/studentsmgt/students/sidebar").then(res => res.data);

export const saveStudents = (data: any) =>
  data.id ? api.put(`/studentsmgt/students/${data.id}`, data) : api.post("/studentsmgt/students", data);

export const removeStudents = (id: any) =>
  api.delete(`/studentsmgt/students/${id}`);

// Statistics
export const getStudentStatistics = () =>
  api.get("/studentsmgt/students/statistics").then(res => res.data);

// Guardians
export const getGuardians = (studentId: number | string) =>
  api.get(`/studentsmgt/students/${studentId}/guardians`).then(res => res.data);

export const saveGuardian = (studentId: number | string, data: any) =>
  data.id
    ? api.put(`/studentsmgt/students/guardians/${data.id}`, data)
    : api.post(`/studentsmgt/students/${studentId}/guardians`, data);

export const removeGuardian = (id: number | string) =>
  api.delete(`/studentsmgt/students/guardians/${id}`);

// Status Management
export const changeStudentStatus = (studentId: number | string, data: any) =>
  api.post(`/studentsmgt/students/${studentId}/change-status`, data).then(res => res.data);

export const getStudentStatusHistory = (studentId: number | string) =>
  api.get(`/studentsmgt/students/${studentId}/status-history`).then(res => res.data);