import api from "@/utils/api.js";

export const getAcademicYearsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/academic-years", { params: queryParams }).then(res => res.data);
};

export const getAcademicYearsMeta = () =>
  api.get("/academics/academic-years/permissions-meta").then(res => res.data);

export const getAcademicYearsSidebar = () =>
  api.get("/academics/academic-years/sidebar").then(res => res.data);

export const saveAcademicYears = (data: any) =>
  data.id ? api.put(`${"/academics/academic-years"}/${data.id}`, data) : api.post("/academics/academic-years", data);

export const removeAcademicYears = (id: any) =>
  api.delete(`${"/academics/academic-years"}/${id}`);

export const bulkCreateAcademicYears = (data: any[]) =>
  api.post("/academics/academic-years/bulk", data).then(res => res.data);