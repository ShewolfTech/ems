import api from "@/utils/api.js";

export const getWebhooksList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/system/webhooks", { params: queryParams }).then(res => res.data);
};

export const getWebhooksMeta = () => 
  api.get("/system/webhooks/permissions-meta").then(res => res.data);

export const getWebhooksSidebar = () => 
  api.get("/system/webhooks/sidebar").then(res => res.data);

export const saveWebhooks = (data: any) => 
  data.id ? api.put(`${"/system/webhooks"}/${data.id}`, data) : api.post("/system/webhooks", data);

export const removeWebhooks = (id: any) => 
  api.delete(`${"/system/webhooks"}/${id}`);