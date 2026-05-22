import api from "@/utils/api.js";

export const getFilesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/filesmgt/files", { params: queryParams }).then(res => res.data);
};

export const getFilesMeta = () => 
  api.get("/filesmgt/files/permissions-meta").then(res => res.data);

export const getFilesSidebar = () => 
  api.get("/filesmgt/files/sidebar").then(res => res.data);

export const saveFiles = (data: any) => 
  data.id ? api.put(`${"/filesmgt/files"}/${data.id}`, data) : api.post("/filesmgt/files", data);

export const removeFiles = (id: any) => 
  api.delete(`${"/filesmgt/files"}/${id}`);