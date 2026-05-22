import api from "@/utils/api.js";

export const getSystemRolerouteAccessViewList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/roleroute-access-view", { params: queryParams }).then(res => res.data);
};

export const getSystemRolerouteAccessViewMeta = () => 
  api.get("/system/roleroute-access-view/permissions-meta").then(res => res.data);

export const getSystemRolerouteAccessViewSidebar = () => 
  api.get("/system/roleroute-access-view/sidebar").then(res => res.data);

export const saveSystemRolerouteAccessView = (data: any) => 
  data.id ? api.put(`${"/system/roleroute-access-view"}/${data.id}`, data) : api.post("/system/roleroute-access-view", data);

export const removeSystemRolerouteAccessView = (id: any) => 
  api.delete(`${"/system/roleroute-access-view"}/${id}`);