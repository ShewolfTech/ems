import api from "@/utils/api.js";

export const getLessonDeliveriesList = (params?: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/lesson-deliveries", { params: queryParams }).then(res => res.data);
};

export const getLessonDeliveryById = (id: number | string) =>
  api.get(`/academics/lesson-deliveries/${id}`).then(res => res.data);

export const getLessonDeliveryStats = (params?: any) =>
  api.get("/academics/lesson-deliveries/stats", { params }).then(res => res.data);

export const getTodaysLessonDeliveries = (params?: any) =>
  api.get("/academics/lesson-deliveries/today", { params }).then(res => res.data);

export const getLessonsByDate = (date: string, params?: any) =>
  api.get("/academics/lesson-deliveries/by-date", { params: { date, ...params } }).then(res => res.data);

export const getDeliveryHistoryForLesson = (lessonId: number | string) =>
  api.get(`/academics/lesson-deliveries/lesson/${lessonId}/history`).then(res => res.data);

export const saveLessonDelivery = (data: any) =>
  data.id
    ? api.put(`/academics/lesson-deliveries/${data.id}`, data)
    : api.post("/academics/lesson-deliveries", data);

export const removeLessonDelivery = (id: any) =>
  api.delete(`/academics/lesson-deliveries/${id}`);

// Quick mark actions
export const markDelivered = (id: number | string, data: any) =>
  api.post(`/academics/lesson-deliveries/${id}/mark-delivered`, data);

export const markCancelled = (id: number | string, data: any) =>
  api.post(`/academics/lesson-deliveries/${id}/mark-cancelled`, data);

export const markPostponed = (id: number | string, data: any) =>
  api.post(`/academics/lesson-deliveries/${id}/mark-postponed`, data);

// Auto-generate from timetables
export const generateDeliveriesFromTimetables = (data: {
  start_date: string;
  end_date: string;
  class_id?: number;
  teacher_id?: number;
}) =>
  api.post("/academics/lesson-deliveries/generate", data);
