import api from "@/utils/api.js";

export const getReportCardsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/report-cards", { params: queryParams }).then(res => res.data);
};

export const getReportCardsMeta = () => 
  api.get("/academics/report-cards/permissions-meta").then(res => res.data);

export const getReportCardsSidebar = () => 
  api.get("/academics/report-cards/sidebar").then(res => res.data);

export const saveReportCards = (data: any) => 
  data.id ? api.put(`${"/academics/report-cards"}/${data.id}`, data) : api.post("/academics/report-cards", data);

export const removeReportCards = (id: any) => 
  api.delete(`${"/academics/report-cards"}/${id}`);