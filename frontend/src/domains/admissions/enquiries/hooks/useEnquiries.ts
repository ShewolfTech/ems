import { useState, useEffect } from 'react';
import { 
  getEnquiriesList, 
  getEnquiryById, 
  getEnquiriesStatistics,
  getEnquiryTypes,
  getEnquirySources,
  saveEnquiry,
  deleteEnquiry,
  assignEnquiry,
  updateEnquiryStatus,
  getEnquiryNotes,
  saveEnquiryNote,
} from '../controller.js';
import type { Enquiry, EnquiryFilters, EnquiryStatistics, EnquiryType, EnquirySource, EnquiryNote } from '../types.js';

export const useEnquiries = (filters?: EnquiryFilters) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const response = await getEnquiriesList(filters);
      if (response.success) {
        setEnquiries(response.data.data || []);
        setPagination({
          page: response.data.pagination?.page || 1,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0,
        });
      }
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [filters?.status, filters?.priority, filters?.page]);

  return {
    enquiries,
    loading,
    error,
    pagination,
    refresh: loadEnquiries,
  };
};

export const useEnquiry = (id: number) => {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadEnquiry = async () => {
      try {
        setLoading(true);
        const response = await getEnquiryById(id);
        if (response.success) {
          setEnquiry(response.data);
        }
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEnquiry();
    }
  }, [id]);

  return { enquiry, loading, error };
};

export const useEnquiryStatistics = (dateFrom?: string, dateTo?: string) => {
  const [statistics, setStatistics] = useState<EnquiryStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        const response = await getEnquiriesStatistics(dateFrom, dateTo);
        if (response.success) {
          setStatistics(response.data);
        }
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [dateFrom, dateTo]);

  return { statistics, loading, error };
};

export const useEnquiryTypes = () => {
  const [types, setTypes] = useState<EnquiryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const response = await getEnquiryTypes();
      if (response.success) {
        setTypes(response.data || []);
      }
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  return { types, loading, error, refresh: loadTypes };
};

export const useEnquirySources = () => {
  const [sources, setSources] = useState<EnquirySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSources = async () => {
    try {
      setLoading(true);
      const response = await getEnquirySources();
      if (response.success) {
        setSources(response.data || []);
      }
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  return { sources, loading, error, refresh: loadSources };
};

export const useEnquiryNotes = (enquiryId: number) => {
  const [notes, setNotes] = useState<EnquiryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await getEnquiryNotes(enquiryId);
      if (response.success) {
        setNotes(response.data || []);
      }
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enquiryId) {
      loadNotes();
    }
  }, [enquiryId]);

  const addNote = async (note: string, noteType: string = 'general') => {
    await saveEnquiryNote(enquiryId, { note, note_type: noteType });
    await loadNotes();
  };

  return { notes, loading, error, refresh: loadNotes, addNote };
};
