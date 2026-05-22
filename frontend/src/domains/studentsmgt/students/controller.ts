import * as service from "./services.js";

export const loadStudentsList = (p?: any) => service.getStudentsList(p);
export const loadStudentsMeta = () => service.getStudentsMeta();
export const loadStudentsSidebar = () => service.getStudentsSidebar();
export const saveStudents = (d: any) => service.saveStudents(d);
export const removeStudents = (id: any) => service.removeStudents(id);

// Statistics
export const loadStudentStatistics = () => service.getStudentStatistics();

// Guardians
export const loadGuardians = (studentId: number | string) => service.getGuardians(studentId);
export const saveGuardian = (studentId: number | string, d: any) => service.saveGuardian(studentId, d);
export const removeGuardian = (id: number | string) => service.removeGuardian(id);

// Status Management
export const changeStudentStatus = (studentId: number | string, d: any) => service.changeStudentStatus(studentId, d);
export const loadStudentStatusHistory = (studentId: number | string) => service.getStudentStatusHistory(studentId);