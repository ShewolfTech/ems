import { useState, useEffect, useCallback } from "react";
import * as service from "../services.js";

export function useContracts({ autoFetch = true, params }: any = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async (p?: any) => {
    setLoading(true);
    try {
      const res = await service.getContractsList(p || params);
      setData(res?.data || (Array.isArray(res) ? res : []));
    } catch (err) { console.error("Error:", err); }
    finally { setLoading(false); }
  }, [JSON.stringify(params)]);

  useEffect(() => { if (autoFetch) reload(); }, [autoFetch, reload]);
  return { data, loading, reload, save: service.saveContract, remove: service.removeContract };
}