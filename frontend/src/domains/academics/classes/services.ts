import api from "@/utils/api.js";

export const getClassesList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/classes", { params: queryParams }).then(res => res.data);
};

export const getClassWithStudents = (id: string) =>
  api.get(`/academics/classes/${id}`).then(res => res.data);

export const getClassAttendance = (id: string) =>
  api.get(`/academics/classes/${id}/attendance`).then(res => res.data);

export const markClassAttendance = (data: { sessionId: number; records: Array<{ studentId: number; status: string; remark?: string }> }) =>
  api.post("/academics/classes/attendance/mark", data).then(res => res.data);

export const getClassTeachers = (id: string) =>
  api.get(`/academics/classes/${id}/teachers`).then(res => res.data);

export const assignTeacher = (id: string, data: { teacherId: number; subjectId?: number; isPrimary?: boolean }) =>
  api.post(`/academics/classes/${id}/teachers`, data).then(res => res.data);

export const removeTeacher = (id: string, teacherId: number) =>
  api.delete(`/academics/classes/${id}/teachers/${teacherId}`).then(res => res.data);

export const getClassesMeta = () =>
  api.get("/academics/classes/permissions-meta").then(res => res.data);

export const getClassesSidebar = () =>
  api.get("/academics/classes/sidebar").then(res => res.data);

export const saveClasses = (data: any) =>
  data.id ? api.put(`/academics/classes/${data.id}`, data) : api.post("/academics/classes", data);

export const removeClasses = (id: any) =>
  api.delete(`/academics/classes/${id}`);

export const bulkCreateClasses = (data: any[]) =>
  api.post("/academics/classes/bulk", data).then(res => res.data);