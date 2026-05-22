import api from "@/utils/api.js";

export const getJobsList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/staffmgt/hiring/jobs", { params: queryParams }).then(res => res.data);
};

export const getJob = (id: any) => api.get(`/staffmgt/hiring/jobs/${id}`).then(res => res.data);

export const saveJob = (data: any) => 
  data.id ? api.put(`/staffmgt/hiring/jobs/${data.id}`, data) : api.post("/staffmgt/hiring/jobs", data);

export const removeJob = (id: any) => api.delete(`/staffmgt/hiring/jobs/${id}`);