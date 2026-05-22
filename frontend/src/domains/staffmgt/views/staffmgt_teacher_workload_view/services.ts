import api from "@/utils/api.js";

export const getStaffmgtTeacherWorkloadViewList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/staffmgt/teacher-workload-view", { params: queryParams }).then(res => res.data);
};

export const getStaffmgtTeacherWorkloadViewMeta = () => 
  api.get("/staffmgt/teacher-workload-view/permissions-meta").then(res => res.data);

export const getStaffmgtTeacherWorkloadViewSidebar = () => 
  api.get("/staffmgt/teacher-workload-view/sidebar").then(res => res.data);

export const saveStaffmgtTeacherWorkloadView = (data: any) => 
  data.id ? api.put(`${"/staffmgt/teacher-workload-view"}/${data.id}`, data) : api.post("/staffmgt/teacher-workload-view", data);

export const removeStaffmgtTeacherWorkloadView = (id: any) => 
  api.delete(`${"/staffmgt/teacher-workload-view"}/${id}`);