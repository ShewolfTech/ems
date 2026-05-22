import { useState, useEffect, useCallback } from "react";
import * as controller from "../controller.js";
import type { Staff, StaffFilters, StaffStatistics, StaffOption } from "../types.js";

// Main hook for staff list with pagination and filtering
export function useStaff({ autoFetch = true, filters }: { autoFetch?: boolean; filters?: StaffFilters } = {}) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchStaff = useCallback(async (overrideFilters?: StaffFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...(overrideFilters || filters || {}) };
      const res = await controller.loadStaffList(params);
      // Handle wrapped response
      const staffData = res?.data || (Array.isArray(res) ? res : []);
      setStaff(staffData);
      setPagination(res?.pagination || res?.meta || { page: 1, limit: 20, total: staffData.length, totalPages: 1 });
    } catch (err: any) {
      setError(err);
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    if (autoFetch) fetchStaff();
  }, [autoFetch, fetchStaff]);

  return {
    staff,
    loading,
    error,
    pagination,
    refresh: fetchStaff,
    save: controller.saveStaff,
    remove: controller.removeStaff,
  };
}

// Hook for single staff member details
export function useStaffMember(id: number | string | undefined, { autoFetch = true }: { autoFetch?: boolean } = {}) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStaff = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await controller.loadStaffList({ id });
      const staffData = res?.data?.[0] || (Array.isArray(res) ? res[0] : null);
      setStaff(staffData);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching staff member:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoFetch && id) fetchStaff();
  }, [autoFetch, id, fetchStaff]);

  return {
    staff,
    loading,
    error,
    refresh: fetchStaff,
  };
}

// Hook for staff statistics
export function useStaffStatistics({ autoFetch = true }: { autoFetch?: boolean } = {}) {
  const [statistics, setStatistics] = useState<StaffStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await controller.getStaffStatistics();
      setStatistics(res?.data || res);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching statistics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchStatistics();
  }, [autoFetch, fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refresh: fetchStatistics,
  };
}

// Hook for departments dropdown
export function useDepartments({ autoFetch = true }: { autoFetch?: boolean } = {}) {
  const [departments, setDepartments] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await controller.getDepartments();
      setDepartments(res?.data || res || []);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchDepartments();
  }, [autoFetch, fetchDepartments]);

  return {
    departments,
    loading,
    error,
    refresh: fetchDepartments,
  };
}

// Hook for roles dropdown
export function useStaffRoles({ autoFetch = true }: { autoFetch?: boolean } = {}) {
  const [roles, setRoles] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await controller.getStaffRoles();
      setRoles(res?.data || res || []);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchRoles();
  }, [autoFetch, fetchRoles]);

  return {
    roles,
    loading,
    error,
    refresh: fetchRoles,
  };
}

// Legacy export for backward compatibility
export function useStaffLegacy({ autoFetch = true, params }: any = {}) {
  const { staff, loading, pagination, refresh, save, remove } = useStaff({ autoFetch, filters: params });
  return {
    data: staff,
    loading,
    meta: pagination,
    reload: refresh,
    save,
    remove,
  };
}
