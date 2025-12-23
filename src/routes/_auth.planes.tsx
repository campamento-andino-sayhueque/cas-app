import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/planes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/planes"!</div>
}
