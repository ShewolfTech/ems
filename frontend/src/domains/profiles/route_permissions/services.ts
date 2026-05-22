import api from "@/utils/api.js";

export const getRoutePermissionsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/profiles/route-permissions", { params: queryParams }).then(res => res.data);
};

export const getRoutePermissionsMeta = () => 
  api.get("/profiles/route-permissions/permissions-meta").then(res => res.data);

export const getRoutePermissionsSidebar = () => 
  api.get("/profiles/route-permissions/sidebar").then(res => res.data);

export const saveRoutePermissions = (data: any) => 
  data.id ? api.put(`${"/profiles/route-permissions"}/${data.id}`, data) : api.post("/profiles/route-permissions", data);

export const removeRoutePermissions = (id: any) => 
  api.delete(`${"/profiles/route-permissions"}/${id}`);