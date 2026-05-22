import api from "@/utils/api.js";

export const getNotificationsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/communications/notifications", { params: queryParams }).then(res => res.data);
};

export const getNotificationsMeta = () => 
  api.get("/communications/notifications/permissions-meta").then(res => res.data);

export const getNotificationsSidebar = () => 
  api.get("/communications/notifications/sidebar").then(res => res.data);

export const saveNotifications = (data: any) => 
  data.id ? api.put(`${"/communications/notifications"}/${data.id}`, data) : api.post("/communications/notifications", data);

export const removeNotifications = (id: any) => 
  api.delete(`${"/communications/notifications"}/${id}`);