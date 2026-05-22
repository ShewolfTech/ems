import api from "@/utils/api.js";

export const getCustomFieldsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/custom-fields", { params: queryParams }).then(res => res.data);
};

export const getCustomFieldsMeta = () => 
  api.get("/system/custom-fields/permissions-meta").then(res => res.data);

export const getCustomFieldsSidebar = () => 
  api.get("/system/custom-fields/sidebar").then(res => res.data);

export const saveCustomFields = (data: any) => 
  data.id ? api.put(`${"/system/custom-fields"}/${data.id}`, data) : api.post("/system/custom-fields", data);

export const removeCustomFields = (id: any) => 
  api.delete(`${"/system/custom-fields"}/${id}`);