import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

/**
 * Reusable data fetching hook with loading, error, and refetch capabilities.
 * Used across Citizen Dashboard, Staff Dashboard, Admin Stats, Issue Detail, and Notifications.
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(url, { params: options.params });
      if (isMountedRef.current) {
        if (res.data.success !== undefined) {
          setData(res.data.data !== undefined ? res.data.data : res.data);
        } else {
          setData(res.data);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Failed to fetch data';
        setError(errorMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [url, JSON.stringify(options.params)]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
};

export default useFetch;
