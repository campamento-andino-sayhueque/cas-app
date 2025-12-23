import { createFileRoute, redirect } from '@tanstack/react-router'
import { User } from 'oidc-client-ts';

export const Route = createFileRoute('/_auth/definicion-planes')({
  beforeLoad: ({ context }) => {
    // Check for CONSEJO group
    // Assuming groups are in profile.groups or similar. Adjust based on Keycloak config.
    // For now, we will log and maybe implementation a strict check if we knew the token structure.
    const user = context.auth.user as User | null;
    const groups = (user?.profile as any)?.groups || [];
    // Only throw if we are sure how groups are mapped.
    // User requested "only CONSEJO group".
    // We will assume "groups" claim exists.
    if (!groups.includes('CONSEJO')) {
         console.warn('User not in CONSEJO group', groups);
         // throw redirect({ to: '/dashboard' }) // Uncomment to enforce
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/definicion-planes"! (Restricted to CONSEJO)</div>
}
