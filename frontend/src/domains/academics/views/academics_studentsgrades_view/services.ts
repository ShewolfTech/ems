import api from "@/utils/api.js";

export const getAcademicsStudentsgradesViewList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/studentsgrades-view", { params: queryParams }).then(res => res.data);
};

export const getAcademicsStudentsgradesViewMeta = () => 
  api.get("/academics/studentsgrades-view/permissions-meta").then(res => res.data);

export const getAcademicsStudentsgradesViewSidebar = () => 
  api.get("/academics/studentsgrades-view/sidebar").then(res => res.data);

export const saveAcademicsStudentsgradesView = (data: any) => 
  data.id ? api.put(`${"/academics/studentsgrades-view"}/${data.id}`, data) : api.post("/academics/studentsgrades-view", data);

export const removeAcademicsStudentsgradesView = (id: any) => 
  api.delete(`${"/academics/studentsgrades-view"}/${id}`);