import api from "@/utils/api.js";

export const getUserPermissionsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/profiles/user-permissions", { params: queryParams }).then(res => res.data);
};

export const getUserPermissionsMeta = () => 
  api.get("/profiles/user-permissions/permissions-meta").then(res => res.data);

export const getUserPermissionsSidebar = () => 
  api.get("/profiles/user-permissions/sidebar").then(res => res.data);

export const saveUserPermissions = (data: any) => 
  data.id ? api.put(`${"/profiles/user-permissions"}/${data.id}`, data) : api.post("/profiles/user-permissions", data);

export const removeUserPermissions = (id: any) => 
  api.delete(`${"/profiles/user-permissions"}/${id}`);