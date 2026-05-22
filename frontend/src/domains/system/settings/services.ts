import api from "@/utils/api.js";

export const getSettingsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/settings", { params: queryParams }).then(res => res.data);
};

export const getSettingsMeta = () => 
  api.get("/system/settings/permissions-meta").then(res => res.data);

export const getSettingsSidebar = () => 
  api.get("/system/settings/sidebar").then(res => res.data);

export const saveSettings = (data: any) => 
  data.id ? api.put(`${"/system/settings"}/${data.id}`, data) : api.post("/system/settings", data);

export const removeSettings = (id: any) => 
  api.delete(`${"/system/settings"}/${id}`);