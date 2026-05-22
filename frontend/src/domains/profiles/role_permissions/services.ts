import api from "@/utils/api.js";

export const getRolePermissionsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/profiles/role-permissions", { params: queryParams }).then(res => res.data);
};

export const getRolePermissionsMeta = () => 
  api.get("/profiles/role-permissions/permissions-meta").then(res => res.data);

export const getRolePermissionsSidebar = () => 
  api.get("/profiles/role-permissions/sidebar").then(res => res.data);

export const saveRolePermissions = (data: any) => 
  data.id ? api.put(`${"/profiles/role-permissions"}/${data.id}`, data) : api.post("/profiles/role-permissions", data);

export const removeRolePermissions = (id: any) => 
  api.delete(`${"/profiles/role-permissions"}/${id}`);