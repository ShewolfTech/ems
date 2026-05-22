import api from "@/utils/api.js";

export const getIntegrationsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/integrations", { params: queryParams }).then(res => res.data);
};

export const getIntegrationsMeta = () => 
  api.get("/system/integrations/permissions-meta").then(res => res.data);

export const getIntegrationsSidebar = () => 
  api.get("/system/integrations/sidebar").then(res => res.data);

export const saveIntegrations = (data: any) => 
  data.id ? api.put(`${"/system/integrations"}/${data.id}`, data) : api.post("/system/integrations", data);

export const removeIntegrations = (id: any) => 
  api.delete(`${"/system/integrations"}/${id}`);