import api from "@/utils/api.js";

export const getSchoolsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/schools", { params: queryParams }).then(res => res.data);
};

export const getSchoolsMeta = () => 
  api.get("/system/schools/permissions-meta").then(res => res.data);

export const getSchoolsSidebar = () => 
  api.get("/system/schools/sidebar").then(res => res.data);

export const saveSchools = (data: any) => 
  data.id ? api.put(`${"/system/schools"}/${data.id}`, data) : api.post("/system/schools", data);

export const removeSchools = (id: any) => 
  api.delete(`${"/system/schools"}/${id}`);