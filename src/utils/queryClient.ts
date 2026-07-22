import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import axios from "axios";

export const TTL = 5 * 60 * 60 * 1000; // 5 hours

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TTL,
      gcTime: TTL,
      retry: (failureCount, error) =>
        failureCount < 1 &&
        !(axios.isAxiosError(error) && (error.response?.status ?? 0) < 500),
      refetchOnWindowFocus: false,
    },
  },
});

export const persister = createSyncStoragePersister({
  key: "__portfolio_qc__",
  storage: window.localStorage,
});
