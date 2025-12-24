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
import { type RouterContext } from './__root';

export const Route = createFileRoute('/_auth/definicion-planes')({
  beforeLoad: ({ context }) => {
    const { auth } = context as RouterContext;
    const user = auth.user;
    const groups = user?.groups || [];
    if (!groups.includes('CONSEJO')) {
         console.warn('User not in CONSEJO group', groups);
    }
  },
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
      ) : (
        <div className="relative">
          {cargandoPlanes && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">Cargando...</div>}
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
