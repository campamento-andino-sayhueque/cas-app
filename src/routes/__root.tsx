import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type useAuth } from "../hooks/useAuth";
import { Toaster } from "../components/ui/sonner";

export interface RouterContext {
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRoute<RouterContext>({
  component: RootRouteComponent,
});

function RootRouteComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
      <Toaster />
    </>
  );
}
