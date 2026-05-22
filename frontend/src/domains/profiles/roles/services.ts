import api from "@/utils/api.js";

export const getRolesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/profiles/roles", { params: queryParams }).then(res => res.data);
};

export const getRolesMeta = () => 
  api.get("/profiles/roles/permissions-meta").then(res => res.data);

export const getRolesSidebar = () => 
  api.get("/profiles/roles/sidebar").then(res => res.data);

export const saveRoles = (data: any) => 
  data.id ? api.put(`${"/profiles/roles"}/${data.id}`, data) : api.post("/profiles/roles", data);

export const removeRoles = (id: any) => 
  api.delete(`${"/profiles/roles"}/${id}`);