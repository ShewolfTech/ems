import api from "@/utils/api.js";

export const getAcademicsClassscheduleViewList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/classschedule-view", { params: queryParams }).then(res => res.data);
};

export const getAcademicsClassscheduleViewMeta = () => 
  api.get("/academics/classschedule-view/permissions-meta").then(res => res.data);

export const getAcademicsClassscheduleViewSidebar = () => 
  api.get("/academics/classschedule-view/sidebar").then(res => res.data);

export const saveAcademicsClassscheduleView = (data: any) => 
  data.id ? api.put(`${"/academics/classschedule-view"}/${data.id}`, data) : api.post("/academics/classschedule-view", data);

export const removeAcademicsClassscheduleView = (id: any) => 
  api.delete(`${"/academics/classschedule-view"}/${id}`);