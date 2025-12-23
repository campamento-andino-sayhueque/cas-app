import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import { type RouterContext } from "./__root";

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
      console.log("Not authenticated, redirecting to login...");
      auth.signinRedirect().catch((err) => {
        console.error("Failed to redirect to login:", err);
      });
    } else if (auth.isAuthenticated) {
      console.log("Authenticated, redirecting to dashboard...");
      window.location.href = "/dashboard";
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          {auth.error ? "Authentication Error" : "Redireccionando..."}
        </h2>
        
        {auth.error ? (
          <div className="text-red-500 mb-4 text-sm">
            <p>Hubo un problema al conectar con Keycloak.</p>
            <p className="mt-2 text-xs opacity-70">{auth.error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-md text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              {auth.isLoading 
                ? "Cargando sesión..." 
                : "Conectando con el servidor de identidad..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
