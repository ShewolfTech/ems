import api from "@/utils/api.js";

export const getAssetsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/assetsmgt/assets", { params: queryParams }).then(res => res.data);
};

export const getAssetsMeta = () => 
  api.get("/assetsmgt/assets/permissions-meta").then(res => res.data);

export const getAssetsSidebar = () => 
  api.get("/assetsmgt/assets/sidebar").then(res => res.data);

export const saveAssets = (data: any) => 
  data.id ? api.put(`${"/assetsmgt/assets"}/${data.id}`, data) : api.post("/assetsmgt/assets", data);

export const removeAssets = (id: any) => 
  api.delete(`${"/assetsmgt/assets"}/${id}`);