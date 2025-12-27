import { createFileRoute, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileFooter from "../components/MobileFooter";
import { type RouterContext } from "./__root";
import { useUsuarioActual } from "../hooks/useUsuarioActual";

// VIP roles that skip onboarding
const VIP_ROLES = ["dirigente"];

export const Route = createFileRoute('/_auth')({
    beforeLoad: ({ context }) => {
        const { auth } = context as RouterContext;
        // Only redirect if we are sure the user is NOT authenticated and NOT loading
        if (!auth.isLoading && !auth.isAuthenticated) {
            throw redirect({
                to: '/',
            })
        }
    },
    component: AuthLayout,
})

function AuthLayout() {
    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { data: usuario, isLoading: isLoadingUsuario } = useUsuarioActual();
  
    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            auth.originalAuth.signinRedirect();
        }
    }, [auth.isLoading, auth.isAuthenticated, auth.originalAuth]);

    // Check if user needs onboarding redirect
    useEffect(() => {
        // Don't do anything while loading
        if (auth.isLoading || isLoadingUsuario || !auth.isAuthenticated) return;
        
        // Don't redirect if already on onboarding page
        if (location.pathname === "/onboarding") return;
        
        // Check if user is VIP (has dirigente role)
        const isVip = VIP_ROLES.some(role => auth.hasRole(role));
        
        // If VIP, no need to check onboarding
        if (isVip) return;
        
        // If user data loaded and profile is incomplete, redirect to onboarding
        if (usuario && !usuario.perfilCompleto) {
            navigate({ to: "/onboarding" });
        }
    }, [auth.isLoading, auth.isAuthenticated, auth.hasRole, isLoadingUsuario, usuario, location.pathname, navigate]);

    if (auth.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        )
    }

    // If not loading and not authenticated, we expect the effect or beforeLoad to handle redirect.
    if (!auth.isAuthenticated) {
        return null;
    }

    // Show loading while checking usuario data for non-VIP users
    const isVip = VIP_ROLES.some(role => auth.hasRole(role));
    if (!isVip && isLoadingUsuario && location.pathname !== "/onboarding") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        )
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

