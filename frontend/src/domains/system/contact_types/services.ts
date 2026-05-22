import api from "@/utils/api.js";

export const getContactTypesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/contact-types", { params: queryParams }).then(res => res.data);
};

export const getContactTypesMeta = () => 
  api.get("/system/contact-types/permissions-meta").then(res => res.data);

export const getContactTypesSidebar = () => 
  api.get("/system/contact-types/sidebar").then(res => res.data);

export const saveContactTypes = (data: any) => 
  data.id ? api.put(`${"/system/contact-types"}/${data.id}`, data) : api.post("/system/contact-types", data);

export const removeContactTypes = (id: any) => 
  api.delete(`${"/system/contact-types"}/${id}`);