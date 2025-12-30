import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "../components/ui/sonner";
import { useEffect } from "react";
import { toast } from "sonner";
import { requestForToken, onMessageListener } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";

export const Route = createRootRoute({
  component: RootRouteComponent,
});

function RootRouteComponent() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Solo mostrar si el usuario está autenticado
    if (!isAuthenticated) return;

    // Only set up the listener, don't auto-request token which might be blocked
    const unsubscribe = onMessageListener((payload: any) => {
      console.log("Foreground message received:", payload);
      toast(payload.notification?.title || "New Message", {
        description: payload.notification?.body,
      });
    });

    // Check if permission is already granted, if so, get token.
    // If 'default', show a toast asking for permission.
    if (Notification.permission === "granted") {
      requestForToken();
    } else if (Notification.permission === "default") {
      toast("Activar notificaciones?", {
        id: "activate-notifications",
        description: "Recibí novedades del campamento",
        action: {
          label: "Activar",
          onClick: () => requestForToken(),
        },
        duration: 8000,
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated]);

  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
      <Toaster />
    </>
  );
}
