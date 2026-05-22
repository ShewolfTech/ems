import api from "@/utils/api.js";

export const getUserRolesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/profiles/user-roles", { params: queryParams }).then(res => res.data);
};

export const getUserRolesMeta = () => 
  api.get("/profiles/user-roles/permissions-meta").then(res => res.data);

export const getUserRolesSidebar = () => 
  api.get("/profiles/user-roles/sidebar").then(res => res.data);

export const saveUserRoles = (data: any) => 
  data.id ? api.put(`${"/profiles/user-roles"}/${data.id}`, data) : api.post("/profiles/user-roles", data);

export const removeUserRoles = (id: any) => 
  api.delete(`${"/profiles/user-roles"}/${id}`);