import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
    return createRouter({
        routeTree,
        scrollRestoration: true,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        defaultStructuralSharing: true,
    });
};

export type AppRouter = ReturnType<typeof getRouter>;

declare module "@tanstack/react-router" {
    interface Register {
        router: AppRouter;
    }
}
