import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { type Cuota } from '../../api/schemas/pagos';
import { useRegistrarPagoManual } from '../../hooks/usePagos';
import { toast } from 'sonner';

interface ModalPagoManualProps {
  cuota: Cuota | null;
  open: boolean;
  onClose: () => void;
}

const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria' },
  { value: 'DEPOSITO', label: 'Depósito Bancario' },
  { value: 'OTRO', label: 'Otro' }
];

/**
 * Modal dialog for registering manual payments.
 * Used by treasurers to record cash/transfer payments.
 */
export function ModalPagoManual({ cuota, open, onClose }: ModalPagoManualProps) {
  const { registrar, cargando } = useRegistrarPagoManual();
  const [metodo, setMetodo] = useState('EFECTIVO');
  const [notas, setNotas] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!cuota?.id) return;

    try {
      await registrar({
        idCuota: cuota.id,
        metodo,
        notas: notas.trim() || `Pago registrado manualmente - ${METODOS_PAGO.find(m => m.value === metodo)?.label}`
      });
      toast.success('Pago registrado correctamente');
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar el pago');
    }
  };

  const handleClose = () => {
    setMetodo('EFECTIVO');
    setNotas('');
    onClose();
  };

  if (!cuota) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pago Manual</DialogTitle>
          <DialogDescription>
            Cuota #{cuota.secuencia} - {formatCurrency(cuota.monto)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Monto (read-only) */}
          <div className="space-y-2">
            <Label>Monto</Label>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(cuota.monto)}
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label htmlFor="metodo">Método de Pago</Label>
            <Select value={metodo} onValueChange={setMetodo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                {METODOS_PAGO.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Ej: Pagó en secretaría, Recibo #123..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={cargando}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={cargando}>
            {cargando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
