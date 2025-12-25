import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  DashboardKPIs, 
  FiltrosInscripciones, 
  TablaInscripcionesAdmin,
  DetalleInscripto 
} from '../components/tesoreria';
import { 
  useInscripcionesAdmin, 
  useMigraciones 
} from '../hooks/usePagos';
import { 
  type InscripcionAdmin,
  type AdminInscripcionFilters 
} from '../api/schemas/pagos';
import { LayoutDashboard, Users, GitBranch } from 'lucide-react';

export const Route = createFileRoute('/_auth/tesoreria')({
  component: TesoreriaPage,
});

/**
 * Treasury and Account Review screen.
 * Provides financial dashboard, inscription management, and migration audit.
 */
function TesoreriaPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState<AdminInscripcionFilters>({});
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState<InscripcionAdmin | null>(null);

  const { inscripciones, cargando } = useInscripcionesAdmin(filters);
  const { migraciones, cargando: cargandoMigraciones } = useMigraciones();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tesorería</h1>
        <p className="text-muted-foreground">
          Gestión de pagos, inscripciones y auditoría de cuentas.
        </p>
      </div>

      {/* Main content with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="inscripciones" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Inscripciones</span>
          </TabsTrigger>
          <TabsTrigger value="migraciones" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">Migraciones</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <DashboardKPIs />
          
          {/* Quick actions / recent activity could go here */}
          <div className="bg-muted/30 rounded-lg p-6 text-center text-muted-foreground">
            <p>
              Usa la pestaña <strong>Inscripciones</strong> para gestionar pagos individuales.
            </p>
          </div>
        </TabsContent>

        {/* Inscriptions Tab */}
        <TabsContent value="inscripciones" className="space-y-6">
          <FiltrosInscripciones 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
          
          <TablaInscripcionesAdmin
            inscripciones={inscripciones}
            cargando={cargando}
            onVerDetalle={setInscripcionSeleccionada}
          />
        </TabsContent>

        {/* Migrations Tab (Audit) */}
        <TabsContent value="migraciones" className="space-y-6">
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">
              Auditoría de Migraciones
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              Listado de usuarios migrados automáticamente a Plan B por el sistema de morosidad.
            </p>
          </div>

          <TablaInscripcionesAdmin
            inscripciones={migraciones}
            cargando={cargandoMigraciones}
            onVerDetalle={setInscripcionSeleccionada}
          />
        </TabsContent>
      </Tabs>

      {/* Detail sheet */}
      <DetalleInscripto
        inscripcion={inscripcionSeleccionada}
        open={!!inscripcionSeleccionada}
        onClose={() => setInscripcionSeleccionada(null)}
      />
    </div>
  );
}
