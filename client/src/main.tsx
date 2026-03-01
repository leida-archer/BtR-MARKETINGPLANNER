import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { api } from "./lib/api";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

// Prefetch core data — runs immediately, cached for all pages
queryClient.prefetchQuery({ queryKey: ["posts"], queryFn: () => api.getPosts() });
queryClient.prefetchQuery({ queryKey: ["events"], queryFn: api.getEvents });
queryClient.prefetchQuery({ queryKey: ["assets"], queryFn: api.getAssets });
// Dashboard is the default route — prefetch analytics too
queryClient.prefetchQuery({ queryKey: ["analytics", "stats"], queryFn: api.getStats });
queryClient.prefetchQuery({ queryKey: ["analytics", "heatmap"], queryFn: () => api.getHeatmap(90) });
queryClient.prefetchQuery({ queryKey: ["analytics", "conflicts"], queryFn: api.getConflicts });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
