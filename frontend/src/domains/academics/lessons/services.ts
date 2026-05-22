import api from "@/utils/api.js";

export const getLessonsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/lessons", { params: queryParams }).then(res => res.data);
};

export const getLessonsMeta = () => 
  api.get("/academics/lessons/permissions-meta").then(res => res.data);

export const getLessonsSidebar = () => 
  api.get("/academics/lessons/sidebar").then(res => res.data);

export const saveLessons = (data: any) => 
  data.id ? api.put(`${"/academics/lessons"}/${data.id}`, data) : api.post("/academics/lessons", data);

export const removeLessons = (id: any) => 
  api.delete(`${"/academics/lessons"}/${id}`);