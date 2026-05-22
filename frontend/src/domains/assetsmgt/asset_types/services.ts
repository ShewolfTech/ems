import api from "@/utils/api.js";

export const getAssetTypesList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/assetsmgt/asset-types", { params: queryParams }).then(res => res.data);
};

export const getAssetTypesMeta = () => 
  api.get("/assetsmgt/asset-types/permissions-meta").then(res => res.data);

export const getAssetTypesSidebar = () => 
  api.get("/assetsmgt/asset-types/sidebar").then(res => res.data);

export const saveAssetTypes = (data: any) => 
  data.id ? api.put(`${"/assetsmgt/asset-types"}/${data.id}`, data) : api.post("/assetsmgt/asset-types", data);

export const removeAssetTypes = (id: any) => 
  api.delete(`${"/assetsmgt/asset-types"}/${id}`);