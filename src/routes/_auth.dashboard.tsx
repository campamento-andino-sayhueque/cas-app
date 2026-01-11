import { Link, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { Wallet, ChevronRight, Settings, Users, Backpack, FileText } from "lucide-react";
import { FamiliaWidget } from "../components/familia/FamiliaWidget";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  const { hasRole, hasGroup } = useAuth();
  
  // Check if user has admin/treasurer/reviewer roles
  const canAccessTesoreria = hasRole('admin') || hasRole('tesorero') || hasRole('revisor');
  
  // Check if user can manage payment plans (CONSEJO group)
  const canManagePlanes = hasGroup('CONSEJO') || hasRole('admin');
  
  // Check if user can access user management (DIRIGENTE or CONSEJO)
  const canAccessUsuarios = hasRole('dirigente') || hasGroup('CONSEJO') || hasRole('admin');

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al campamento</p>
      </div>

      {/* Mi Grupo Familiar - visible para todos */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-muted-foreground">Mi Familia</h2>
        <FamiliaWidget />
      </section>

      {/* Mi Equipo - visible para todos */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-muted-foreground">Mi Equipo</h2>
        <Link 
          to="/equipo"
          className="flex items-center justify-between p-4 border rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border-teal-200 dark:border-teal-800 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
              <Backpack className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-teal-900 dark:text-teal-100">
                Checklist de Equipo
              </h3>
              <p className="text-sm text-teal-700 dark:text-teal-300">
                Preparación para el campamento
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Documentación - visible para todos */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-muted-foreground">Documentación</h2>
        <Link 
          to="/documentos"
          className="flex items-center justify-between p-4 border rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-200 dark:border-rose-800 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
              <FileText className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="font-semibold text-rose-900 dark:text-rose-100">
                Mis Documentos
              </h3>
              <p className="text-sm text-rose-700 dark:text-rose-300">
                Formularios y autorizaciones del campamento
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Admin Quick Access */}
      {(canAccessTesoreria || canAccessUsuarios) && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Administración</h2>
          
          {canAccessTesoreria && (
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
          )}

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

          {/* Usuarios - For DIRIGENTE and CONSEJO */}
          {canAccessUsuarios && (
            <Link 
              to="/usuarios"
              className="flex items-center justify-between p-4 border rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Usuarios
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Gestión de usuarios y roles
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
