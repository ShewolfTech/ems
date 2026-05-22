import api from "@/utils/api.js";

export const getAssetMaintenanceLogsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/assetsmgt/asset-maintenance-logs", { params: queryParams }).then(res => res.data);
};

export const getAssetMaintenanceLogsMeta = () => 
  api.get("/assetsmgt/asset-maintenance-logs/permissions-meta").then(res => res.data);

export const getAssetMaintenanceLogsSidebar = () => 
  api.get("/assetsmgt/asset-maintenance-logs/sidebar").then(res => res.data);

export const saveAssetMaintenanceLogs = (data: any) => 
  data.id ? api.put(`${"/assetsmgt/asset-maintenance-logs"}/${data.id}`, data) : api.post("/assetsmgt/asset-maintenance-logs", data);

export const removeAssetMaintenanceLogs = (id: any) => 
  api.delete(`${"/assetsmgt/asset-maintenance-logs"}/${id}`);