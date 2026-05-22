import api from "@/utils/api.js";

export const getContractsList = (params?: any) => {
  const qp = params ? Object.fromEntries(Object.entries(params).filter(([k]: any) => !['autoFetch', 'onSuccess'].includes(k))) : {};
  return api.get("/staffmgt/contracts", { params: qp }).then(res => res.data);
};

export const getContract = (id: any) => api.get(`/staffmgt/contracts/${id}`).then(res => res.data);

export const saveContract = (data: any) => 
  data.id ? api.put(`/staffmgt/contracts/${data.id}`, data) : api.post("/staffmgt/contracts", data);

export const removeContract = (id: any) => api.delete(`/staffmgt/contracts/${id}`);