import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { seedIfEmpty } from "./lib/db";
import { initAssetStorage, revokeAllBlobUrls } from "./lib/assetStorage";

// Seed localStorage with demo data on first visit
seedIfEmpty();

// Initialize IndexedDB (migrates base64 assets on first load after upgrade)
initAssetStorage();

// Clean up blob URLs on page unload to free memory
window.addEventListener("beforeunload", revokeAllBlobUrls);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>
);
