import api from "@/utils/api.js";

export const getStaffmgtPromotionHistoryViewList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/staffmgt/promotion-history-view", { params: queryParams }).then(res => res.data);
};

export const getStaffmgtPromotionHistoryViewMeta = () => 
  api.get("/staffmgt/promotion-history-view/permissions-meta").then(res => res.data);

export const getStaffmgtPromotionHistoryViewSidebar = () => 
  api.get("/staffmgt/promotion-history-view/sidebar").then(res => res.data);

export const saveStaffmgtPromotionHistoryView = (data: any) => 
  data.id ? api.put(`${"/staffmgt/promotion-history-view"}/${data.id}`, data) : api.post("/staffmgt/promotion-history-view", data);

export const removeStaffmgtPromotionHistoryView = (id: any) => 
  api.delete(`${"/staffmgt/promotion-history-view"}/${id}`);