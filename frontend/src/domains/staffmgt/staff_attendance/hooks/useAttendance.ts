import { useState, useEffect, useCallback } from "react";
import * as controller from "../controller.js";
import type { AttendanceFilters, AttendanceRecord, DailySummary, AttendanceStatistics } from "../types.js";

// Main hook for attendance list
export function useAttendance({ autoFetch = true, filters }: { autoFetch?: boolean; filters?: AttendanceFilters } = {}) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchAttendance = useCallback(async (overrideFilters?: AttendanceFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...(overrideFilters || filters || {}) };
      const res = await controller.loadAttendanceList(params);
      const data = res?.data || (Array.isArray(res) ? res : []);
      setRecords(data);
      setPagination(res?.pagination || res?.meta || { page: 1, limit: 20, total: data.length, totalPages: 1 });
    } catch (err: any) {
      setError(err);
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    if (autoFetch) fetchAttendance();
  }, [autoFetch, fetchAttendance]);

  return {
    records,
    loading,
    error,
    pagination,
    refresh: fetchAttendance,
    save: controller.saveAttendance,
    remove: controller.removeAttendance,
  };
}

// Hook for today's summary
export function useTodaySummary({ autoFetch = true }: { autoFetch?: boolean } = {}) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await controller.loadTodaySummary();
      setSummary(res?.data || res);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching today's summary:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchSummary();
  }, [autoFetch, fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary,
  };
}

// Hook for attendance statistics
export function useAttendanceStats({ autoFetch = true, dateFrom, dateTo }: { autoFetch?: boolean; dateFrom?: string; dateTo?: string } = {}) {
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await controller.loadAttendanceStatistics({ date_from: dateFrom, date_to: dateTo });
      setStatistics(res?.data || res);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching statistics:", err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (autoFetch) fetchStats();
  }, [autoFetch, fetchStats]);

  return {
    statistics,
    loading,
    error,
    refresh: fetchStats,
  };
}

// Clock in/out hooks
export function useClockInOut() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleClockIn = useCallback(async (data: { staff_id: number; device_id?: string; location?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await controller.doClockIn(data);
      return res;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClockOut = useCallback(async (data: { staff_id: number; device_id?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await controller.doClockOut(data);
      return res;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    clockIn: handleClockIn,
    clockOut: handleClockOut,
    loading,
    error,
  };
}
