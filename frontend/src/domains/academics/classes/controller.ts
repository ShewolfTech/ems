import * as service from "./services.js";

export const loadClassesList = (p?: any) => service.getClassesList(p);
export const loadClassWithStudents = (id: string) => service.getClassWithStudents(id);
export const loadClassAttendance = (id: string) => service.getClassAttendance(id);
export const submitClassAttendance = (data: any) => service.markClassAttendance(data);
export const loadClassTeachers = (id: string) => service.getClassTeachers(id);
export const assignClassTeacher = (id: string, data: any) => service.assignTeacher(id, data);
export const removeClassTeacher = (id: string, teacherId: number) => service.removeTeacher(id, teacherId);
export const loadClassesMeta = () => service.getClassesMeta();
export const loadClassesSidebar = () => service.getClassesSidebar();
export const saveClasses = (d: any) => service.saveClasses(d);
export const removeClasses = (id: any) => service.removeClasses(id);