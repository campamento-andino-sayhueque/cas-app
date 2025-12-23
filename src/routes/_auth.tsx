import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileFooter from "../components/MobileFooter";
import { type RouterContext } from "./__root";

export const Route = createFileRoute('/_auth')({
    beforeLoad: ({ context }) => {
        const authContext = context as RouterContext;
        // Only redirect if we are sure the user is NOT authenticated and NOT loading
        if (!authContext.auth.isLoading && !authContext.auth.isAuthenticated) {
            throw redirect({
                to: '/',
                search: {
                    // redirect: location.href,
                },
            })
        }
    },
    component: AuthLayout,
})

function AuthLayout() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
        // Double check in component effect to catch cases where state changes after beforeLoad
         auth.signinRedirect();
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.signinRedirect]);

  if (auth.isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
      )
  }

  // If not loading and not authenticated, we expect the effect or beforeLoad to handle redirect.
  // We can return null or a loading state while redirect happens.
  if (!auth.isAuthenticated) {
      return null;
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="h-full grid grid-rows-[auto_auto_1fr] md:grid-rows-[auto_1fr]">
        <MobileHeader />
        <MobileFooter />
        <main className="overflow-auto pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
