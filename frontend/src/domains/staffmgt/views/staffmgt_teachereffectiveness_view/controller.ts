import * as service from "./services.js";

export const loadStaffmgtTeachereffectivenessViewList = (p?: any) => service.getStaffmgtTeachereffectivenessViewList(p);
export const loadStaffmgtTeachereffectivenessViewMeta = () => service.getStaffmgtTeachereffectivenessViewMeta();
export const loadStaffmgtTeachereffectivenessViewSidebar = () => service.getStaffmgtTeachereffectivenessViewSidebar();
export const saveStaffmgtTeachereffectivenessView = (d: any) => service.saveStaffmgtTeachereffectivenessView(d);
export const removeStaffmgtTeachereffectivenessView = (id: any) => service.removeStaffmgtTeachereffectivenessView(id);