import api from "@/utils/api.js";

export const getApiKeysList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/api-keys", { params: queryParams }).then(res => res.data);
};

export const getApiKeysMeta = () => 
  api.get("/system/api-keys/permissions-meta").then(res => res.data);

export const getApiKeysSidebar = () => 
  api.get("/system/api-keys/sidebar").then(res => res.data);

export const saveApiKeys = (data: any) => 
  data.id ? api.put(`${"/system/api-keys"}/${data.id}`, data) : api.post("/system/api-keys", data);

export const removeApiKeys = (id: any) => 
  api.delete(`${"/system/api-keys"}/${id}`);