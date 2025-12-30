import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { Button } from "../components/ui/button";
import { TablaPlanes } from '../components/pagos/TablaPlanes';
import { WizardPlanPago } from '../components/pagos/WizardPlanPago';
import { EditarPlanDialog } from '../components/pagos/EditarPlanDialog';
import {
  useAdminPlanes,
  useCrearPlan,
  useToggleEstadoPlan
} from '../hooks/usePagos';
import { type PlanPago, type PlanPagoRequest } from '../api/schemas/pagos';
import { toast } from 'sonner';

export const Route = createFileRoute('/_auth/definicion-planes')({
  component: RouteComponent,
});

function RouteComponent() {
  const { planes, cargando: cargandoPlanes, error } = useAdminPlanes();
  const { crearPlan, cargando: creando } = useCrearPlan();
  const { toggleEstado } = useToggleEstadoPlan();

  // State for Wizard (Creation)
  const [wizardAbierto, setWizardAbierto] = useState(false);

  // State for Edit Dialog (Modification)
  const [planEditar, setPlanEditar] = useState<PlanPago | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleNuevoPlan = () => {
    setWizardAbierto(true);
  };

  const handleEditarPlan = (plan: PlanPago) => {
    setPlanEditar(plan);
    setEditDialogOpen(true);
  };

  const handleToggleEstado = async (plan: PlanPago) => {
    try {
      if (!plan.id) return;
      await toggleEstado({ id: plan.id, activo: !plan.activo });
      toast.success(`Plan ${plan.activo ? 'desactivado' : 'activado'} exitosamente`);
    } catch (err) {
      console.error(err);
      toast.error("Error al cambiar estado del plan");
    }
  };

  const handleGuardarNuevo = async (datos: PlanPagoRequest) => {
    try {
      await crearPlan(datos);
      toast.success("Plan creado exitosamente");
      setWizardAbierto(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar plan");
    }
  };

  // Note: Edit Dialog handles its own save validation and API call internally via hook, 
  // but we pass a close handler to refresh or close.
  // Actually, standard pattern is parenting handles save, but the dialog I wrote handles it self.
  // Let's check EditarPlanDialog again. Yes, it calls useActualizarPlan internally.
  // We just need to handle close.

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planes de Pago</h1>
          <p className="text-muted-foreground">Configuración de los planes disponibles para inscripción.</p>
        </div>
        <Button onClick={handleNuevoPlan}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nuevo Plan
        </Button>
      </div>

      {error ? (
        <div className="text-red-500">Error al cargar planes</div>
      ) : cargandoPlanes && (!planes || planes.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p>Cargando planes...</p>
        </div>
      ) : (
        <div className="relative">
          {cargandoPlanes && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-lg border flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Actualizando...</span>
              </div>
            </div>
          )}
          <TablaPlanes
            planes={planes}
            onEditar={handleEditarPlan}
            onToggleEstado={handleToggleEstado}
          />
        </div>
      )}

      {/* Creation Wizard */}
      {wizardAbierto && (
        <WizardPlanPago
          abierto={wizardAbierto}
          cargando={creando}
          onCerrar={() => setWizardAbierto(false)}
          onGuardar={handleGuardarNuevo}
        />
      )}

      {/* Edit Dialog */}
      <EditarPlanDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setPlanEditar(null);
        }}
        plan={planEditar}
      />
    </div>
  );
}
