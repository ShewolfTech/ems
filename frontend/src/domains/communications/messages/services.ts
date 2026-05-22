import api from "@/utils/api.js";

export const getMessagesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/communications/messages", { params: queryParams }).then(res => res.data);
};

export const getMessagesMeta = () => 
  api.get("/communications/messages/permissions-meta").then(res => res.data);

export const getMessagesSidebar = () => 
  api.get("/communications/messages/sidebar").then(res => res.data);

export const saveMessages = (data: any) => 
  data.id ? api.put(`${"/communications/messages"}/${data.id}`, data) : api.post("/communications/messages", data);

export const removeMessages = (id: any) => 
  api.delete(`${"/communications/messages"}/${id}`);