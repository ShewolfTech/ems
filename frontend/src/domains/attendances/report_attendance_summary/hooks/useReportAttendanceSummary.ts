import { useState, useEffect, useCallback } from "react";
import * as controller from "../controller.js";

export function useReportAttendanceSummary({
  autoFetch = true,
  params,
}: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });

  const reload = useCallback(
    async (p?: any) => {
      setLoading(true);
      try {
        const res = await controller.loadReportAttendanceSummaryList(
          p || params,
        );
        // Handle wrapped response { success: true, data: [...] }
        setData(res?.data || (Array.isArray(res) ? res : []));
        setMeta(res?.meta || { page: 1, totalPages: 1 });
      } catch (err) {
        console.error("Error in useReportAttendanceSummary:", err);
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
    save: controller.saveReportAttendanceSummary,
    remove: controller.removeReportAttendanceSummary,
    loadMeta: controller.loadReportAttendanceSummaryMeta,
    loadSidebar: controller.loadReportAttendanceSummarySidebar,
  };
}
