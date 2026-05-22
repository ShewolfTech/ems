import api from "@/utils/api.js";

export const getWorkflowsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/workflows", { params: queryParams }).then(res => res.data);
};

export const getWorkflowsMeta = () => 
  api.get("/system/workflows/permissions-meta").then(res => res.data);

export const getWorkflowsSidebar = () => 
  api.get("/system/workflows/sidebar").then(res => res.data);

export const saveWorkflows = (data: any) => 
  data.id ? api.put(`${"/system/workflows"}/${data.id}`, data) : api.post("/system/workflows", data);

export const removeWorkflows = (id: any) => 
  api.delete(`${"/system/workflows"}/${id}`);