import api from "@/utils/api.js";

export const getDistrictsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/districts", { params: queryParams }).then(res => res.data);
};

export const getDistrictsMeta = () => 
  api.get("/system/districts/permissions-meta").then(res => res.data);

export const getDistrictsSidebar = () => 
  api.get("/system/districts/sidebar").then(res => res.data);

export const saveDistricts = (data: any) => 
  data.id ? api.put(`${"/system/districts"}/${data.id}`, data) : api.post("/system/districts", data);

export const removeDistricts = (id: any) => 
  api.delete(`${"/system/districts"}/${id}`);