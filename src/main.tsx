import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "react-oidc-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { oidcConfig } from "./auth/authConfig";
import { routeTree } from "./routeTree.gen";
import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";
import { type RouterContext } from "./routes/__root.tsx";

// Define the router context interface
// Create a new router instance with the context type and all options
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // The context is initially undefined, it will be provided by InnerApp
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

const queryClient = new QueryClient();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
    context: RouterContext;
  }
}

/**
 * This is our "bridge" component. It's rendered inside AuthProvider,
 * so it can safely call the useAuth() hook.
 */
function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProvider {...oidcConfig}>
        <QueryClientProvider client={queryClient}>
          <InnerApp />
        </QueryClientProvider>
      </AuthProvider>
    </StrictMode>,
  );
} // If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
