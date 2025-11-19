import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { DashboardNavbar } from "@/components/DashboardNavbar";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }: any) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div>
      <DashboardNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
