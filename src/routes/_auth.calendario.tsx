import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/calendario')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/calendario"!</div>
}
