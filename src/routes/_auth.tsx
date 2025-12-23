import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import MobileHeader from "../components/MobileHeader";
import MobileFooter from "../components/MobileFooter";

export const Route = createFileRoute('/_auth')({
    beforeLoad: ({ context, location }) => {
        if (!context.auth.isAuthenticated) {
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
