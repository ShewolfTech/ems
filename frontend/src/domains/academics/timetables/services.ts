import api from "@/utils/api.js";

export const getTimetablesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/timetables", { params: queryParams }).then(res => res.data);
};

export const getTimetablesMeta = () => 
  api.get("/academics/timetables/permissions-meta").then(res => res.data);

export const getTimetablesSidebar = () => 
  api.get("/academics/timetables/sidebar").then(res => res.data);

export const saveTimetables = (data: any) => 
  data.id ? api.put(`${"/academics/timetables"}/${data.id}`, data) : api.post("/academics/timetables", data);

export const removeTimetables = (id: any) => 
  api.delete(`${"/academics/timetables"}/${id}`);