import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

import "./styles/global.css";
import "./styles/layout.css";
import "./styles/form.css";
import "./styles/buttons.css";
import "./styles/cards.css";
import "./styles/dashboardReports.css";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  
);
