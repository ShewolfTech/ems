import * as service from "./services.js";

export const loadStaffmgtTeacherWorkloadViewList = (p?: any) => service.getStaffmgtTeacherWorkloadViewList(p);
export const loadStaffmgtTeacherWorkloadViewMeta = () => service.getStaffmgtTeacherWorkloadViewMeta();
export const loadStaffmgtTeacherWorkloadViewSidebar = () => service.getStaffmgtTeacherWorkloadViewSidebar();
export const saveStaffmgtTeacherWorkloadView = (d: any) => service.saveStaffmgtTeacherWorkloadView(d);
export const removeStaffmgtTeacherWorkloadView = (id: any) => service.removeStaffmgtTeacherWorkloadView(id);