import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import { router } from "./router";
import "./styles/index.css";
import { hydrateCache, queryClient } from "./utils/queryClient";

if (import.meta.env.DEV) {
  const { scan } = await import("react-scan");
  scan({ enabled: true });
}

hydrateCache();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />;
    </QueryClientProvider>
  </React.StrictMode>,
);
