import api from "@/utils/api.js";

export const getApplicationsList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/staffmgt/hiring/applications", { params: queryParams }).then(res => res.data);
};

export const getApplication = (id: any) => api.get(`/staffmgt/hiring/applications/${id}`).then(res => res.data);

export const saveApplication = (data: any) => 
  data.id ? api.put(`/staffmgt/hiring/applications/${data.id}`, data) : api.post("/staffmgt/hiring/applications", data);

export const removeApplication = (id: any) => api.delete(`/staffmgt/hiring/applications/${id}`);