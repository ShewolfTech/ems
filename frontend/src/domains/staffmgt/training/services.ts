import api from "@/utils/api.js";

export const getTrainingList = (params?: any) => {
  const qp = params ? Object.fromEntries(Object.entries(params).filter(([k]: any) => !['autoFetch', 'onSuccess'].includes(k))) : {};
  return api.get("/staffmgt/training", { params: qp }).then(res => res.data);
};

export const getTraining = (id: any) => api.get(`/staffmgt/training/${id}`).then(res => res.data);

export const saveTraining = (data: any) => 
  data.id ? api.put(`/staffmgt/training/${data.id}`, data) : api.post("/staffmgt/training", data);

export const removeTraining = (id: any) => api.delete(`/staffmgt/training/${id}`);