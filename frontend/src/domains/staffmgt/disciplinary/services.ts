import api from "@/utils/api.js";

export const getDisciplinaryList = (params?: any) => {
  const qp = params ? Object.fromEntries(Object.entries(params).filter(([k]: any) => !['autoFetch', 'onSuccess'].includes(k))) : {};
  return api.get("/staffmgt/disciplinary", { params: qp }).then(res => res.data);
};

export const getDisciplinary = (id: any) => api.get(`/staffmgt/disciplinary/${id}`).then(res => res.data);

export const saveDisciplinary = (data: any) => 
  data.id ? api.put(`/staffmgt/disciplinary/${data.id}`, data) : api.post("/staffmgt/disciplinary", data);

export const removeDisciplinary = (id: any) => api.delete(`/staffmgt/disciplinary/${id}`);