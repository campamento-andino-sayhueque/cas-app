import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/pagos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/pagos"!</div>
}
