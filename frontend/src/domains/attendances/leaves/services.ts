import api from "@/utils/api.js";

export const getLeavesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/attendances/leaves", { params: queryParams }).then(res => res.data);
};

export const getLeavesMeta = () => 
  api.get("/attendances/leaves/permissions-meta").then(res => res.data);

export const getLeavesSidebar = () => 
  api.get("/attendances/leaves/sidebar").then(res => res.data);

export const saveLeaves = (data: any) => 
  data.id ? api.put(`${"/attendances/leaves"}/${data.id}`, data) : api.post("/attendances/leaves", data);

export const removeLeaves = (id: any) => 
  api.delete(`${"/attendances/leaves"}/${id}`);