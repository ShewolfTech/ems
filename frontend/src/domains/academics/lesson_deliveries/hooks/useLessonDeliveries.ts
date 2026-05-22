import { useState, useEffect, useCallback } from "react";
import * as controller from "../controller.js";

export function useLessonDeliveries({ autoFetch = true, params }: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });

  const reload = useCallback(
    async (p?: any) => {
      setLoading(true);
      try {
        const res = await controller.loadLessonDeliveriesList(p || params);
        setData(res?.data || (Array.isArray(res) ? res : []));
        setMeta(res?.meta || { page: 1, totalPages: 1 });
      } catch (err) {
        console.error("Error in useLessonDeliveries:", err);
      } finally {
        setLoading(false);
      }
    },
    [JSON.stringify(params)],
  );

  useEffect(() => {
    if (autoFetch) reload();
  }, [autoFetch, reload]);

  return {
    data,
    loading,
    meta,
    reload,
    save: controller.saveLessonDelivery,
    remove: controller.removeLessonDelivery,
    loadMeta: controller.loadLessonDeliveryStats,
  };
}

export function useTodaysLessons({ autoFetch = true, params }: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(
    async (p?: any) => {
      setLoading(true);
      try {
        const res = await controller.loadTodaysLessonDeliveries(p || params);
        setData(res?.data || (Array.isArray(res) ? res : []));
      } catch (err) {
        console.error("Error in useTodaysLessons:", err);
      } finally {
        setLoading(false);
      }
    },
    [JSON.stringify(params)],
  );

  useEffect(() => {
    if (autoFetch) reload();
  }, [autoFetch, reload]);

  return {
    data,
    loading,
    reload,
    markDelivered: controller.quickMarkDelivered,
    markCancelled: controller.quickMarkCancelled,
    markPostponed: controller.quickMarkPostponed,
  };
}

export function useLessonsByDate({ autoFetch = false, date }: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(
    async (selectedDate?: string) => {
      if (!selectedDate && !date) return;
      setLoading(true);
      try {
        const res = await controller.loadLessonsByDate(selectedDate || date);
        setData(res?.data || (Array.isArray(res) ? res : []));
      } catch (err) {
        console.error("Error in useLessonsByDate:", err);
      } finally {
        setLoading(false);
      }
    },
    [date],
  );

  useEffect(() => {
    if (autoFetch && date) reload();
  }, [autoFetch, date, reload]);

  return {
    data,
    loading,
    reload,
  };
}

export function useDeliveryHistory(lessonId: number | string, { autoFetch = true }: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await controller.loadDeliveryHistoryForLesson(lessonId);
      setData(res?.data || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error("Error in useDeliveryHistory:", err);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (autoFetch) reload();
  }, [autoFetch, reload]);

  return {
    data,
    loading,
    reload,
  };
}
