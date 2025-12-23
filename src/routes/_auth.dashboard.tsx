import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardComponent,
});


function DashboardComponent() {
 

  return (
    <>Hola estas en el dashboard</>
  )
}
