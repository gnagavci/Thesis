import { useEffect, useState, useRef, useCallback } from "react";

export function usePolling(fetchFn, options = {}) {
  const {
    interval = 5000,
    enabled = true,
    onSuccess,
    onError,
    retryAttempts = 3,
    backoffMultiplier = 1.5,
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const clearPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (!enabled || !isMountedRef.current) return;

    try {
      setLoading(true);
      const result = await fetchFn();

      if (isMountedRef.current) {
        setData(result);
        setError(null);
        setRetryCount(0);
        setLoading(false);

        if (onSuccess) {
          onSuccess(result);
        }

        // Schedule next poll with base interval
        timeoutRef.current = setTimeout(poll, interval);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);

        if (onError) {
          onError(err);
        }

        // Implement exponential backoff for retries
        if (retryCount < retryAttempts) {
          const backoffDelay =
            interval * Math.pow(backoffMultiplier, retryCount);
          setRetryCount((prev) => prev + 1);
          timeoutRef.current = setTimeout(poll, backoffDelay);
        }
      }
    }
  }, [
    fetchFn,
    interval,
    enabled,
    onSuccess,
    onError,
    retryCount,
    retryAttempts,
    backoffMultiplier,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      poll();
    }

    return () => {
      isMountedRef.current = false;
      clearPolling();
    };
  }, [enabled, poll, clearPolling]);

  const refetch = useCallback(() => {
    clearPolling();
    setRetryCount(0);
    poll();
  }, [poll, clearPolling]);

  return { data, error, loading, refetch };
}
