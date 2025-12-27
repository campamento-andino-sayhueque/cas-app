import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type useAuth } from "../hooks/useAuth";
import { Toaster } from "../components/ui/sonner";
import { useEffect } from "react";
import { toast } from "sonner";
import { requestForToken, onMessageListener } from "../lib/firebase";

export interface RouterContext {
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRoute<RouterContext>({
  component: RootRouteComponent,
});

function RootRouteComponent() {
  useEffect(() => {
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
        description: "Recibi novedades del campamento",
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
  }, []);

  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
      <Toaster />
    </>
  );
}
