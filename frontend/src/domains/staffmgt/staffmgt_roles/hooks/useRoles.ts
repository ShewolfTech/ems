import { useState, useEffect } from 'react';
import { 
  getStaffmgtRolesList, 
  saveStaffmgtRoles, 
  removeStaffmgtRoles,
  Role
} from '../services.js';

type UseRolesOptions = {
  autoFetch?: boolean;
  filters?: Partial<Role>;
};

type ServiceResult = {
  data?: Role[];
  loading: boolean;
  error?: string;
  reload: () => void;
};

export function useRoles(options: UseRolesOptions = {}): ServiceResult {
  const { autoFetch = true, filters } = options;
  const [data, setData] = useState<Role[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getStaffmgtRolesList(filters);
      setData(response?.data || response);
      setError(undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roles');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const reload = () => {
    fetchData();
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [autoFetch]);

  return { data, loading, error, reload };
}