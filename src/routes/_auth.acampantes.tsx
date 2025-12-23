import { createFileRoute, redirect } from '@tanstack/react-router'
import { type RouterContext } from './__root'

export const Route = createFileRoute('/_auth/acampantes')({
  beforeLoad: ({ context }) => {
    const { auth } = context as RouterContext;
    if (!auth.hasRole('ADMIN') || !auth.hasRole('DIRIGENTES')) {
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
