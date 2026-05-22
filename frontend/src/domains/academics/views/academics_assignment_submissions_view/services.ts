import api from "@/utils/api.js";

export const getAcademicsAssignmentSubmissionsViewList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/assignment-submissions-view", { params: queryParams }).then(res => res.data);
};

export const getAcademicsAssignmentSubmissionsViewMeta = () => 
  api.get("/academics/assignment-submissions-view/permissions-meta").then(res => res.data);

export const getAcademicsAssignmentSubmissionsViewSidebar = () => 
  api.get("/academics/assignment-submissions-view/sidebar").then(res => res.data);

export const saveAcademicsAssignmentSubmissionsView = (data: any) => 
  data.id ? api.put(`${"/academics/assignment-submissions-view"}/${data.id}`, data) : api.post("/academics/assignment-submissions-view", data);

export const removeAcademicsAssignmentSubmissionsView = (id: any) => 
  api.delete(`${"/academics/assignment-submissions-view"}/${id}`);