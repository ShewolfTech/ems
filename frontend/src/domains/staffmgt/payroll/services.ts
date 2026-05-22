import api from "@/utils/api.js";

export const getPayrollList = (params?: any) => {
  const qp = params ? Object.fromEntries(Object.entries(params).filter(([k]: any) => !['autoFetch', 'onSuccess'].includes(k))) : {};
  return api.get("/staffmgt/payroll", { params: qp }).then(res => res.data);
};

export const getPayroll = (id: any) => api.get(`/staffmgt/payroll/${id}`).then(res => res.data);

export const savePayroll = (data: any) => 
  data.id ? api.put(`/staffmgt/payroll/${data.id}`, data) : api.post("/staffmgt/payroll", data);

export const removePayroll = (id: any) => api.delete(`/staffmgt/payroll/${id}`);