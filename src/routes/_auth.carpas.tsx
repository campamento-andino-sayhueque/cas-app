import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/carpas')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/carpas"!</div>
}
