import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth';

export const Route = createFileRoute('/_auth/grupos')({
  beforeLoad: () => {
    // Authorization check is done in the component
  },
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth();
  const groups = auth.user?.groups || [];

  if (!groups.some(g => g.toLowerCase().includes('consejo'))) {
    console.warn('User not in CONSEJO group', groups);
  }

  return <div>Hello "/_auth/grupos"! (Restricted to CONSEJO)</div>
}
