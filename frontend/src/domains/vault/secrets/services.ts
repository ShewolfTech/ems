import api from "@/utils/api.js";

export const getSecretsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/vault/secrets", { params: queryParams }).then(res => res.data);
};

export const getSecretsMeta = () => 
  api.get("/vault/secrets/permissions-meta").then(res => res.data);

export const getSecretsSidebar = () => 
  api.get("/vault/secrets/sidebar").then(res => res.data);

export const saveSecrets = (data: any) => 
  data.id ? api.put(`${"/vault/secrets"}/${data.id}`, data) : api.post("/vault/secrets", data);

export const removeSecrets = (id: any) => 
  api.delete(`${"/vault/secrets"}/${id}`);