import api from "@/utils/api.js";

export const getAssetAssignmentsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/assetsmgt/asset-assignments", { params: queryParams }).then(res => res.data);
};

export const getAssetAssignmentsMeta = () => 
  api.get("/assetsmgt/asset-assignments/permissions-meta").then(res => res.data);

export const getAssetAssignmentsSidebar = () => 
  api.get("/assetsmgt/asset-assignments/sidebar").then(res => res.data);

export const saveAssetAssignments = (data: any) => 
  data.id ? api.put(`${"/assetsmgt/asset-assignments"}/${data.id}`, data) : api.post("/assetsmgt/asset-assignments", data);

export const removeAssetAssignments = (id: any) => 
  api.delete(`${"/assetsmgt/asset-assignments"}/${id}`);