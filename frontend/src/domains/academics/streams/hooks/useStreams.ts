import { useState, useEffect, useCallback } from "react";
import * as controller from "../controller.js";

export function useStreams({ autoFetch = true, params }: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(
    async (p?: any) => {
      setLoading(true);
      try {
        const res = await controller.loadStreamsList(p || params);
        setData(res?.data || (Array.isArray(res) ? res : []));
      } catch (err) {
        console.error("Error in useStreams:", err);
      } finally {
        setLoading(false);
      }
    },
    [JSON.stringify(params)],
  );

  useEffect(() => {
    if (autoFetch) reload();
  }, [autoFetch, reload]);

  return { data, loading, reload, save: controller.saveStreams, remove: controller.removeStreams };
}
