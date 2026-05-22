import api from "@/utils/api.js";

export const getSubjectsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/subjects", { params: queryParams }).then(res => res.data);
};

export const getSubjectsMeta = () => 
  api.get("/academics/subjects/permissions-meta").then(res => res.data);

export const getSubjectsSidebar = () => 
  api.get("/academics/subjects/sidebar").then(res => res.data);

export const saveSubjects = (data: any) =>
  data.id ? api.put(`${"/academics/subjects"}/${data.id}`, data) : api.post("/academics/subjects", data);

export const removeSubjects = (id: any) =>
  api.delete(`${"/academics/subjects"}/${id}`);

export const bulkCreateSubjects = (data: any[]) =>
  api.post("/academics/subjects/bulk", data).then(res => res.data);