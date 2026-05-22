import api from "@/utils/api.js";

export const getPerformanceList = (params?: any) => {
  const qp = params ? Object.fromEntries(Object.entries(params).filter(([k]: any) => !['autoFetch', 'onSuccess'].includes(k))) : {};
  return api.get("/staffmgt/performance", { params: qp }).then(res => res.data);
};

export const getPerformance = (id: any) => api.get(`/staffmgt/performance/${id}`).then(res => res.data);

export const savePerformance = (data: any) => 
  data.id ? api.put(`/staffmgt/performance/${data.id}`, data) : api.post("/staffmgt/performance", data);

export const removePerformance = (id: any) => api.delete(`/staffmgt/performance/${id}`);