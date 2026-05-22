import { useState, useEffect, useCallback } from "react";
import * as controller from "../controller.js";

export function useAttendanceSessions({ autoFetch = true, params }: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });

  const reload = useCallback(
    async (p?: any) => {
      setLoading(true);
      try {
        const res = await controller.loadAttendanceSessionsList(p || params);
        // Handle wrapped response { success: true, data: [...] }
        setData(res?.data || (Array.isArray(res) ? res : []));
        setMeta(res?.meta || { page: 1, totalPages: 1 });
      } catch (err) {
        console.error("Error in useAttendanceSessions:", err);
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
    save: controller.saveAttendanceSessions,
    remove: controller.removeAttendanceSessions,
    loadMeta: controller.loadAttendanceSessionsMeta,
    loadSidebar: controller.loadAttendanceSessionsSidebar,
  };
}
