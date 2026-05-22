import api from "@/utils/api.js";

export const getGradingConfigurations = (params?: any) => {
  return api.get("/academics/grading-configurations", { params }).then(res => res.data);
};

export const getGradingConfiguration = (id: string) => {
  return api.get(`/academics/grading-configurations/${id}`).then(res => res.data);
};

export const getDefaultGradingConfiguration = (params?: any) => {
  return api.get("/academics/grading-configurations/default", { params }).then(res => res.data);
};

export const saveGradingConfiguration = (data: any) => {
  return data.id 
    ? api.put(`/academics/grading-configurations/${data.id}`, data).then(res => res.data)
    : api.post("/academics/grading-configurations", data).then(res => res.data);
};

export const deleteGradingConfiguration = (id: string) => {
  return api.delete(`/academics/grading-configurations/${id}`).then(res => res.data);
};

export const calculateStudentGrade = (params: any) => {
  return api.get("/academics/grading-configurations/calculate-grade", { params }).then(res => res.data);
};
