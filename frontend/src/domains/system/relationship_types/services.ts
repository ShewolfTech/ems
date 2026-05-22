import api from "@/utils/api.js";

export const getRelationshipTypesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/relationship-types", { params: queryParams }).then(res => res.data);
};

export const getRelationshipTypesMeta = () => 
  api.get("/system/relationship-types/permissions-meta").then(res => res.data);

export const getRelationshipTypesSidebar = () => 
  api.get("/system/relationship-types/sidebar").then(res => res.data);

export const saveRelationshipTypes = (data: any) => 
  data.id ? api.put(`${"/system/relationship-types"}/${data.id}`, data) : api.post("/system/relationship-types", data);

export const removeRelationshipTypes = (id: any) => 
  api.delete(`${"/system/relationship-types"}/${id}`);