import { Link, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { Wallet, ChevronRight, Settings } from "lucide-react";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  const { hasRole, hasGroup } = useAuth();
  
  // Check if user has admin/treasurer/reviewer roles
  const canAccessTesoreria = hasRole('admin') || hasRole('tesorero') || hasRole('revisor');
  
  // Check if user can manage payment plans (CONSEJO group)
  const canManagePlanes = hasGroup('CONSEJO') || hasRole('admin');

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al campamento</p>
      </div>

      {/* Admin Quick Access */}
      {canAccessTesoreria && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Administración</h2>
          
          <Link 
            to="/tesoreria"
            className="flex items-center justify-between p-4 border rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-violet-900 dark:text-violet-100">
                  Tesorería
                </h3>
                <p className="text-sm text-violet-700 dark:text-violet-300">
                  Gestión de pagos e inscripciones
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Definición de Planes - Only for CONSEJO members */}
          {canManagePlanes && (
            <Link 
              to="/definicion-planes"
              className="flex items-center justify-between p-4 border rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    Definición de Planes
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Configuración de planes de pago
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </section>
      )}

      {/* Placeholder for other dashboard content */}
      <section className="bg-muted/30 rounded-lg p-8 text-center text-muted-foreground">
        <p>Más contenido del dashboard próximamente</p>
      </section>
    </div>
  );
}
