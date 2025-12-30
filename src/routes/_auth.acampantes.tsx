import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/_auth/acampantes')({
  beforeLoad: () => {
    // Authorization check is done in the component since we need the hook
  },
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth();

  // Check permissions (ADMIN is a role, DIRIGENTES is a group)
  if (!auth.hasRole('ADMIN') && !auth.hasGroup('DIRIGENTES')) {
    return <div className="p-6 text-center text-muted-foreground">No tienes acceso a esta página.</div>
  }

  return <div>Hello "/_auth/acampantes"!</div>
}
