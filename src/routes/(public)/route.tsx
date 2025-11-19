import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PublicNavbar } from "@/components/PublicNavbar";

export const Route = createFileRoute("/(public)")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div>
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
