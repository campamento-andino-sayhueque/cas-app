import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getRouter } from "./router";
import { OidcInitializationGate } from "./oidc";
import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";

// Set dynamic title based on environment
// In local dev: import.meta.env.DEV is true
// In Firebase dev: VITE_APP_ENV should be 'dev' (set during build)
const isDev = import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'dev';
document.title = isDev ? 'CAS [DEV]' : 'CAS';

const router = getRouter();
const queryClient = new QueryClient();

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <OidcInitializationGate>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </OidcInitializationGate>
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

