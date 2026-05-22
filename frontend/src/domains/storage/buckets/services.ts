import api from "@/utils/api.js";

export const getBucketsList = (params?: any) => {
  // Filter out internal hook params that break Backend Zod validation
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/storage/buckets", { params: queryParams }).then(res => res.data);
};

export const getBucketsMeta = () => 
  api.get("/storage/buckets/permissions-meta").then(res => res.data);

export const getBucketsSidebar = () => 
  api.get("/storage/buckets/sidebar").then(res => res.data);

export const saveBuckets = (data: any) => 
  data.id ? api.put(`${"/storage/buckets"}/${data.id}`, data) : api.post("/storage/buckets", data);

export const removeBuckets = (id: any) => 
  api.delete(`${"/storage/buckets"}/${id}`);