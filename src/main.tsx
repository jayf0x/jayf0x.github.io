import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import { router } from "./router";
import { persister, queryClient, TTL } from "./utils/queryClient";

import "./styles/index.css";
import { isDev } from "./utils/dev";

if (isDev()) {
  const { scan } = await import("react-scan");
  scan({ enabled: true });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: TTL }}
    >
      <RouterProvider router={router} />;
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
