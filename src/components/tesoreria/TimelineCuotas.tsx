import { CheckCircle2, Clock, AlertCircle, Banknote } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { type Cuota } from '../../api/schemas/pagos';
import { cn } from '../../lib/utils';

interface TimelineCuotasProps {
  cuotas: Cuota[];
  onPagarManual: (cuota: Cuota) => void;
}

/**
 * Vertical timeline showing chronological installments.
 * Each installment shows status, dates, amounts, and payment actions.
 */
export function TimelineCuotas({ cuotas, onPagarManual }: TimelineCuotasProps) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'PAGADA':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'VENCIDA':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'PLANIFICADA':
      case 'PENDIENTE':
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'PAGADA':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✅ Pagada</Badge>;
      case 'VENCIDA':
        return <Badge variant="destructive">🔴 Vencida</Badge>;
      case 'PLANIFICADA':
        return <Badge variant="secondary">📅 Planificada</Badge>;
      case 'PENDIENTE':
        return <Badge variant="outline">⏳ Pendiente</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (cuotas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay cuotas registradas
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {cuotas.map((cuota, index) => (
          <div 
            key={cuota.id || index}
            className={cn(
              "relative flex gap-4 pl-12",
              cuota.estado === 'PAGADA' && "opacity-75"
            )}
          >
            {/* Status icon */}
            <div className="absolute left-0 bg-white p-1 rounded-full">
              {getStatusIcon(cuota.estado)}
            </div>

            {/* Content card */}
            <div className={cn(
              "flex-1 border rounded-lg p-4",
              cuota.estado === 'VENCIDA' && "border-red-200 bg-red-50/50",
              cuota.estado === 'PAGADA' && "border-green-200 bg-green-50/50"
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Cuota #{cuota.secuencia}</span>
                    {getStatusBadge(cuota.estado)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Vencimiento:</span>
                      <span className="ml-2 font-medium">{formatDate(cuota.fechaVencimiento)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monto:</span>
                      <span className="ml-2 font-medium">{formatCurrency(cuota.monto)}</span>
                    </div>
                    
                    {cuota.estado === 'PAGADA' && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Fecha pago:</span>
                          <span className="ml-2">{formatDate(cuota.fechaPago)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Método:</span>
                          <span className="ml-2">{cuota.metodoPago || '—'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {cuota.notasAdministrativas && (
                    <div className="mt-2 text-sm text-muted-foreground italic">
                      "{cuota.notasAdministrativas}"
                    </div>
                  )}
                </div>

                {/* Action button for unpaid installments */}
                {(cuota.estado === 'PLANIFICADA' || cuota.estado === 'VENCIDA' || cuota.estado === 'PENDIENTE') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPagarManual(cuota)}
                    className="shrink-0"
                  >
                    <Banknote className="w-4 h-4 mr-1" />
                    Pagar
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
