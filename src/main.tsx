import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles/index.css";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SpeedInsights } from "@vercel/speed-insights/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // staleTime: 1000 * 30,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
            <SpeedInsights />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);