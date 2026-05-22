import api from "@/utils/api.js";

export const getUsersList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/profiles/users", { params: queryParams }).then(res => res.data);
};

export const getUsersMeta = () => 
  api.get("/profiles/users/permissions-meta").then(res => res.data);

export const getUsersSidebar = () => 
  api.get("/profiles/users/sidebar").then(res => res.data);

export const saveUsers = (data: any) => 
  data.id ? api.put(`${"/profiles/users"}/${data.id}`, data) : api.post("/profiles/users", data);

export const removeUsers = (id: any) => 
  api.delete(`${"/profiles/users"}/${id}`);