import { createFileRoute } from '@tanstack/react-router'
// import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/_auth/acampantes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/acampantes"!</div>
}
