import api from "@/utils/api.js";

// Get staff list (for interviews, assignments, etc.)
export const getStaffList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/profiles/staff", { params: queryParams }).then(res => res.data);
};

// Get staff by ID
export const getStaffById = (id: number) => {
  return api.get(`/profiles/staff/${id}`).then(res => res.data);
};

// Save staff (create/update)
export const saveStaff = (data: any) => {
  return data.id
    ? api.put(`/profiles/staff/${data.id}`, data)
    : api.post("/profiles/staff", data);
};

// Remove staff
export const removeStaff = (id: number) => {
  return api.delete(`/profiles/staff/${id}`);
};
