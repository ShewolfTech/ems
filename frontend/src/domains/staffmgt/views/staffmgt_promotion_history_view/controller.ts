import * as service from "./services.js";

export const loadStaffmgtPromotionHistoryViewList = (p?: any) => service.getStaffmgtPromotionHistoryViewList(p);
export const loadStaffmgtPromotionHistoryViewMeta = () => service.getStaffmgtPromotionHistoryViewMeta();
export const loadStaffmgtPromotionHistoryViewSidebar = () => service.getStaffmgtPromotionHistoryViewSidebar();
export const saveStaffmgtPromotionHistoryView = (d: any) => service.saveStaffmgtPromotionHistoryView(d);
export const removeStaffmgtPromotionHistoryView = (id: any) => service.removeStaffmgtPromotionHistoryView(id);