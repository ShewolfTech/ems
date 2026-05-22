import api from "@/utils/api.js";

export const getIdAccessList = (params?: any) => {
  const qp = params ? Object.fromEntries(Object.entries(params).filter(([k]: any) => !['autoFetch', 'onSuccess'].includes(k))) : {};
  return api.get("/staffmgt/id-access", { params: qp }).then(res => res.data);
};
export const getIdAccess = (id: any) => api.get(`/staffmgt/id-access/${id}`).then(res => res.data);
export const saveIdAccess = (data: any) => data.id ? api.put(`/staffmgt/id-access/${data.id}`, data) : api.post("/staffmgt/id-access", data);
export const removeIdAccess = (id: any) => api.delete(`/staffmgt/id-access/${id}`);