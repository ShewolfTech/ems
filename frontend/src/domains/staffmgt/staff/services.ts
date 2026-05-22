import api from "@/utils/api.js";

const cleanParams = (params?: any) => {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params)
      .filter(([key, value]) => 
        value !== undefined && 
        value !== null && 
        value !== "" && 
        !(typeof value === 'number' && isNaN(value)) &&
        !['autoFetch', 'onSuccess', 'onError'].includes(key)
      )
  );
};

export const getStaffList = async (params?: any) => {
  const response = await api.get("/staffmgt", { params: cleanParams(params) });
  const payload = response.data || {};
  return {
    items: payload.data || [],
    pagination: payload.pagination || { page: 1, limit: 15, total: 0, totalPages: 0 }
  };
};

export const getStaffStatistics = async () => {
  const response = await api.get("/staffmgt/statistics");
  return response.data?.data || {};
};

export const saveStaff = async (data: any) => {
  if (data?.id) {
    const response = await api.put(`/staffmgt/${data.id}`, data);
    return response.data;
  }
  const response = await api.post("/staffmgt", data);
  return response.data;
};

export const removeStaff = async (id: any) => {
  const response = await api.delete(`/staffmgt/${id}`);
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get("/staffmgt/departments");
  return response.data?.data || [];
};

export const getStaffRoles = async (params?: any) => {
  const response = await api.get("/staffmgt/staffmgt-roles", { params: cleanParams(params) });
  return response.data?.data || [];
};

export const getStaffMeta = async () => {
  const response = await api.get("/staffmgt/staff/permissions-meta");
  return response.data?.permissions_meta || [];
};

export const getStaffSidebar = async () => {
  const response = await api.get("/staffmgt/staff/sidebar");
  return response.data?.data || {};
};

export const transferStaff = async (data: any) => {
  const response = await api.post("/staffmgt/transfer", data);
  return response.data;
};

export const promoteStaff = async (data: any) => {
  const response = await api.post("/staffmgt/promote", data);
  return response.data;
};

export const getStaffDetail = async (id: string | number) => {
  const response = await api.get(`/staffmgt/${id}`);
  return response.data?.data || {};
};

export const getStaffTransferHistory = async (id: string | number) => {
  const response = await api.get(`/staffmgt/${id}/transfers`);
  return response.data?.data || [];
};

export const getStaffPromotionHistory = async (id: string | number) => {
  const response = await api.get(`/staffmgt/${id}/promotions`);
  return response.data?.data || [];
};