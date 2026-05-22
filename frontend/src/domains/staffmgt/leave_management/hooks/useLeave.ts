import { useState, useEffect, useCallback } from "react";
import * as controller from "../controller.js";
import type { LeaveFilters, LeaveRequest, LeaveType, LeaveQuota, LeaveStatistics } from "../types.js";

// Main hook for leave requests list
export function useLeaveRequests({ autoFetch = true, filters }: { autoFetch?: boolean; filters?: LeaveFilters } = {}) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchRequests = useCallback(async (overrideFilters?: LeaveFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...(overrideFilters || filters || {}) };
      const res = await controller.loadLeaveRequests(params);
      const data = res?.data || (Array.isArray(res) ? res : []);
      setRequests(data);
      setPagination(res?.pagination || res?.meta || { page: 1, limit: 20, total: data.length, totalPages: 1 });
    } catch (err: any) {
      setError(err);
      console.error("Error fetching leave requests:", err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    if (autoFetch) fetchRequests();
  }, [autoFetch, fetchRequests]);

  return {
    requests,
    loading,
    error,
    pagination,
    refresh: fetchRequests,
    save: controller.saveLeaveRequest,
    remove: controller.removeLeaveRequest,
    approve: controller.approveLeave,
    reject: controller.rejectLeave,
  };
}

// Hook for leave types
export function useLeaveTypes({ autoFetch = true }: { autoFetch?: boolean } = {}) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await controller.loadLeaveTypes();
      setLeaveTypes(res?.data || res || []);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching leave types:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchTypes();
  }, [autoFetch, fetchTypes]);

  return {
    leaveTypes,
    loading,
    error,
    refresh: fetchTypes,
  };
}

// Hook for leave quotas
export function useLeaveQuotas({ autoFetch = true, staffId, year }: { autoFetch?: boolean; staffId?: number; year?: number } = {}) {
  const [quotas, setQuotas] = useState<LeaveQuota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuotas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await controller.loadLeaveQuotas({ staff_id: staffId, year });
      setQuotas(res?.data || res || []);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching leave quotas:", err);
    } finally {
      setLoading(false);
    }
  }, [staffId, year]);

  useEffect(() => {
    if (autoFetch) fetchQuotas();
  }, [autoFetch, fetchQuotas]);

  return {
    quotas,
    loading,
    error,
    refresh: fetchQuotas,
  };
}

// Hook for leave statistics
export function useLeaveStatistics({ autoFetch = true, dateFrom, dateTo }: { autoFetch?: boolean; dateFrom?: string; dateTo?: string } = {}) {
  const [statistics, setStatistics] = useState<LeaveStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await controller.loadLeaveStatistics({ date_from: dateFrom, date_to: dateTo });
      setStatistics(res?.data || res);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching leave statistics:", err);
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

// Hook for staff leave balance
export function useLeaveBalance(staffId: number, { autoFetch = true }: { autoFetch?: boolean } = {}) {
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await controller.loadLeaveBalance(staffId);
      setBalance(res?.data || res);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching leave balance:", err);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    if (autoFetch && staffId) fetchBalance();
  }, [autoFetch, staffId, fetchBalance]);

  return {
    balance,
    loading,
    error,
    refresh: fetchBalance,
  };
}
