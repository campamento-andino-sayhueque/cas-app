import { createFileRoute, redirect } from '@tanstack/react-router'
import { type RouterContext } from './__root'

export const Route = createFileRoute('/_auth/acampantes')({
  beforeLoad: ({ context }) => {
    const { auth } = context as RouterContext;

    // Wait for auth to finish loading before making a decision
    if (auth.isLoading) return;

    // Check permissions (ADMIN is a role, DIRIGENTES is a group in your Keycloak)
    if (!auth.hasRole('ADMIN') && !auth.hasGroup('DIRIGENTES')) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/acampantes"!</div>
}
