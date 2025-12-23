import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }: any) => {
    if (context?.auth?.isAuthenticated) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: HomeComponent,
});

function HomeComponent() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Auto-redirect to login
      auth.signinRedirect().catch((err) => {
        console.error("Failed to redirect to login:", err);
      });
    } else if (auth.isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.signinRedirect]);

  if (auth.isAuthenticated) {
    return null; 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          {auth.error ? "Error de conexión" : "Redirigiendo al login..."}
        </h2>
        
        {auth.error ? (
           <div className="text-red-500 mb-4 max-w-sm mx-auto bg-white p-4 rounded shadow">
            <p className="font-bold">No se pudo conectar con Keycloak.</p>
            <p className="text-sm mt-2">{auth.error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900 dark:border-white mx-auto"></div>
        )}
      </div>
    </div>
  );
}
