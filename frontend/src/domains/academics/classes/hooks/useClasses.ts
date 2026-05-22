import { useState, useEffect, useCallback } from "react";
import * as controller from "../controller.js";

export function useClasses({ autoFetch = true, params }: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const reload = useCallback(
    async (p?: any) => {
      setLoading(true);
      try {
        const res = await controller.loadClassesList(p || params);
        setData(res?.data || (Array.isArray(res) ? res : []));
      } catch (err) {
        console.error("Error in useClasses:", err);
      } finally {
        setLoading(false);
      }
    },
    [JSON.stringify(params)],
  );

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await controller.loadClassWithStudents(id);
      setDetail(res?.data || null);
    } catch (err) {
      console.error("Error loading class detail:", err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) reload();
  }, [autoFetch, reload]);

  return {
    data,
    loading,
    detail,
    detailLoading,
    reload,
    loadDetail,
    save: controller.saveClasses,
    remove: controller.removeClasses,
  };
}
