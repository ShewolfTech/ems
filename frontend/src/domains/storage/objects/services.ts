import api from "@/utils/api.js";

export const getObjectsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/storage/objects", { params: queryParams }).then(res => res.data);
};

export const getObjectsMeta = () => 
  api.get("/storage/objects/permissions-meta").then(res => res.data);

export const getObjectsSidebar = () => 
  api.get("/storage/objects/sidebar").then(res => res.data);

export const saveObjects = (data: any) => 
  data.id ? api.put(`${"/storage/objects"}/${data.id}`, data) : api.post("/storage/objects", data);

export const removeObjects = (id: any) => 
  api.delete(`${"/storage/objects"}/${id}`);