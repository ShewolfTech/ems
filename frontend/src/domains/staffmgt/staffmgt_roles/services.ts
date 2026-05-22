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

export const getStaffmgtRolesList = (params?: any) => {
  return api.get("/staffmgt/staffmgt-roles", { params: cleanParams(params) }).then(res => res.data);
};

export const getStaffmgtRolesMeta = () => 
  api.get("/staffmgt/staffmgt-roles/permissions-meta").then(res => res.data);

export const getStaffmgtRolesSidebar = () => 
  api.get("/staffmgt/staffmgt-roles/sidebar").then(res => res.data);

export const saveStaffmgtRoles = (data: any) => 
  data.id ? api.put(`${"/staffmgt/staffmgt-roles"}/${data.id}`, data) : api.post("/staffmgt/staffmgt-roles", data);

export const removeStaffmgtRoles = (id: any) => 
  api.delete(`${"/staffmgt/staffmgt-roles"}/${id}`);