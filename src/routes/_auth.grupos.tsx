import { createFileRoute, redirect } from '@tanstack/react-router'
import { User } from 'oidc-client-ts';

export const Route = createFileRoute('/_auth/grupos')({
  beforeLoad: ({ context }) => {
     const user = context.auth.user as User | null;
     const groups = (user?.profile as any)?.groups || [];
     if (!groups.includes('CONSEJO')) {
         console.warn('User not in CONSEJO group', groups);
         // throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/grupos"! (Restricted to CONSEJO)</div>
}
