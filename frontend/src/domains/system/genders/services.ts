import api from "@/utils/api.js";

export const getGendersList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/genders", { params: queryParams }).then(res => res.data);
};

export const getGendersMeta = () => 
  api.get("/system/genders/permissions-meta").then(res => res.data);

export const getGendersSidebar = () => 
  api.get("/system/genders/sidebar").then(res => res.data);

export const saveGenders = (data: any) => 
  data.id ? api.put(`${"/system/genders"}/${data.id}`, data) : api.post("/system/genders", data);

export const removeGenders = (id: any) => 
  api.delete(`${"/system/genders"}/${id}`);