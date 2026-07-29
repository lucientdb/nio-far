import { useState, useCallback } from "react";
import { parseApiError, type ApiError } from "@/lib/errorHandler";

type UseApiCallResult<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
};

/**
 * Hook personnalisé pour gérer les appels API avec loading, erreur et retry
 * 
 * @example
 * const { data, loading, error, execute } = useApiCall(getJobs);
 * 
 * useEffect(() => {
 *   execute();
 * }, []);
 */
export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiCallResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        setLoading(false);
        return result;
      } catch (err: any) {
        const parsedError = parseApiError(err);
        setError(parsedError);
        setLoading(false);
        console.error("API Error:", parsedError);
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
