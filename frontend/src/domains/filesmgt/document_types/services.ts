import api from "@/utils/api.js";

export const getDocumentTypesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/filesmgt/document-types", { params: queryParams }).then(res => res.data);
};

export const getDocumentTypesMeta = () => 
  api.get("/filesmgt/document-types/permissions-meta").then(res => res.data);

export const getDocumentTypesSidebar = () => 
  api.get("/filesmgt/document-types/sidebar").then(res => res.data);

export const saveDocumentTypes = (data: any) => 
  data.id ? api.put(`${"/filesmgt/document-types"}/${data.id}`, data) : api.post("/filesmgt/document-types", data);

export const removeDocumentTypes = (id: any) => 
  api.delete(`${"/filesmgt/document-types"}/${id}`);