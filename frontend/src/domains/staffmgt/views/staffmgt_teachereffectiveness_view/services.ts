import api from "@/utils/api.js";

export const getStaffmgtTeachereffectivenessViewList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/staffmgt/teachereffectiveness-view", { params: queryParams }).then(res => res.data);
};

export const getStaffmgtTeachereffectivenessViewMeta = () => 
  api.get("/staffmgt/teachereffectiveness-view/permissions-meta").then(res => res.data);

export const getStaffmgtTeachereffectivenessViewSidebar = () => 
  api.get("/staffmgt/teachereffectiveness-view/sidebar").then(res => res.data);

export const saveStaffmgtTeachereffectivenessView = (data: any) => 
  data.id ? api.put(`${"/staffmgt/teachereffectiveness-view"}/${data.id}`, data) : api.post("/staffmgt/teachereffectiveness-view", data);

export const removeStaffmgtTeachereffectivenessView = (id: any) => 
  api.delete(`${"/staffmgt/teachereffectiveness-view"}/${id}`);