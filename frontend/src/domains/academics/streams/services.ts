import api from "@/utils/api.js";

export const getStreamsList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/streams", { params: queryParams }).then(res => res.data);
};

export const saveStreams = (data: any) =>
  data.id ? api.put(`/academics/streams/${data.id}`, data) : api.post("/academics/streams", data);

export const removeStreams = (id: any) =>
  api.delete(`/academics/streams/${id}`);

export const bulkCreateStreams = (data: any[]) =>
  api.post("/academics/streams/bulk", data).then(res => res.data);
