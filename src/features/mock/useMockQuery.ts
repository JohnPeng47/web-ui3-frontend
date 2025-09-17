import { useEffect, useState, useRef } from "react";
import { isMockDataEnabled } from "../../config";
import { mockRegistry } from "./MockQueryRegistry";
import type { MockQueryDataConfig, MockQueryProvider } from "./types";

interface MockQueryOptions {
  enabled?: boolean;
  refetchInterval?: number | ((query: any) => number | false);
  refetchIntervalInBackground?: boolean;
}

interface MockQueryResult<T> {
  data: T | undefined;
  status: "pending" | "error" | "success";
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function useMockQuery<T>(
  queryKey: string,
  mockConfig: MockQueryDataConfig<T>,
  options: MockQueryOptions = {}
): MockQueryResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [status, setStatus] = useState<"pending" | "error" | "success">("pending");
  const [error, setError] = useState<Error | null>(null);
  const providerRef = useRef<MockQueryProvider<T> | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize mock provider
  useEffect(() => {
    if (!isMockDataEnabled() || !options.enabled) return;

    try {
      let provider = mockRegistry.get<T>(queryKey);
      if (!provider) {
        provider = mockRegistry.register(queryKey, mockConfig);
      }

      providerRef.current = provider;

      // Subscribe to data changes
      const unsubscribe = provider.subscribe((newData) => {
        setData(newData);
        setStatus("success");
        setError(null);
      });

      // Start the mock provider
      provider.start();

      return () => {
        unsubscribe();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } catch (err) {
      setError(err as Error);
      setStatus("error");
    }
  }, [queryKey, options.enabled]);

  // Handle refetch intervals
  useEffect(() => {
    if (!isMockDataEnabled() || !options.enabled || !options.refetchInterval) return;

    const interval = typeof options.refetchInterval === "function"
      ? options.refetchInterval({ state: { data } })
      : options.refetchInterval;

    if (typeof interval === "number" && interval > 0) {
      intervalRef.current = setInterval(() => {
        // For mock data, we don't actually refetch, but we could trigger
        // provider restarts or other behaviors if needed
        if (providerRef.current && providerRef.current.getStatus() === "completed") {
          providerRef.current.reset(true);
        }
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [options.refetchInterval, options.enabled, data]);

  return {
    data,
    status,
    error,
    isLoading: status === "pending",
    isSuccess: status === "success",
    isError: status === "error"
  };
}

// Helper hook to conditionally use mock or real query
export function useConditionalQuery<T>(
  queryKey: string,
  realQueryHook: () => any,
  mockConfig: MockQueryDataConfig<T>,
  options: MockQueryOptions = {}
) {
  const mockResult = useMockQuery(queryKey, mockConfig, options);
  const realResult = realQueryHook();

  if (isMockDataEnabled()) {
    return mockResult;
  }

  return realResult;
}
