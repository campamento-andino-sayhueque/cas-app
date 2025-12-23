import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";

export const Route = createFileRoute("/callback")({
  component: CallbackComponent,
});

function CallbackComponent() {
  const { error, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate({ from: "/callback" });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
        // Successful login
      navigate({ to: "/dashboard", replace: true });
    }
    
    if (error) {
        console.error("Auth Callback Error:", error);
    }
  }, [isAuthenticated, isLoading, navigate, error]);

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-red-50 text-red-900 p-6 rounded-lg max-w-md w-full border border-red-200">
                <h3 className="text-lg font-bold mb-2">Error de Autenticación</h3>
                <p className="mb-4">No se pudo completar el inicio de sesión.</p>
                <div className="bg-white p-3 rounded border border-red-100 font-mono text-xs mb-4 overflow-auto">
                    {error.message}
                </div>
                <button 
                    onClick={() => navigate({ to: "/" })}
                    className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-900 rounded transition-colors"
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Completando inicio de sesión...</h3>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
