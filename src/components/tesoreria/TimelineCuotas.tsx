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
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'VENCIDA':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'PLANIFICADA':
      case 'PENDIENTE':
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
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

  // Icon size is 24px (w-6), we center the line on it
  const iconCenterOffset = 12; // half of 24px

  return (
    <div className="relative pl-8">
      {/* Vertical line - aligned with icon center */}
      <div 
        className="absolute top-3 bottom-3 w-0.5 bg-gray-200" 
        style={{ left: `${iconCenterOffset - 1}px` }}
      />

      <div className="space-y-4">
        {cuotas.map((cuota, index) => (
          <div 
            key={cuota.id || index}
            className={cn(
              "relative",
              cuota.estado === 'PAGADA' && "opacity-80"
            )}
          >
            {/* Status icon - centered on the line */}
            <div 
              className="absolute bg-white rounded-full flex items-center justify-center"
              style={{ 
                left: `-${iconCenterOffset + 12}px`, // Move left so icon center is at 12px (line position)
                top: '12px' // Vertically center with first line of content
              }}
            >
              {getStatusIcon(cuota.estado)}
            </div>

            {/* Content card */}
            <div className={cn(
              "border rounded-lg p-4",
              cuota.estado === 'VENCIDA' && "border-red-200 bg-red-50/50",
              cuota.estado === 'PAGADA' && "border-green-200 bg-green-50/50"
            )}>
              {/* Header: Cuota number + badge + action */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">Cuota #{cuota.secuencia}</span>
                  {getStatusBadge(cuota.estado)}
                </div>
                
                {/* Action button for unpaid - inline on mobile */}
                {(cuota.estado === 'PLANIFICADA' || cuota.estado === 'VENCIDA' || cuota.estado === 'PENDIENTE') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPagarManual(cuota)}
                    className="shrink-0"
                  >
                    <Banknote className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Pagar</span>
                  </Button>
                )}
              </div>

              {/* Details grid - responsive */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Vencimiento</span>
                  <span className="font-medium">{formatDate(cuota.fechaVencimiento)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Monto</span>
                  <span className="font-medium">{formatCurrency(cuota.monto)}</span>
                </div>
                
                {cuota.estado === 'PAGADA' && (
                  <>
                    <div>
                      <span className="text-muted-foreground block text-xs">Fecha pago</span>
                      <span>{formatDate(cuota.fechaPago)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Método</span>
                      <span>{cuota.metodoPago || '—'}</span>
                    </div>
                  </>
                )}
              </div>

              {cuota.notasAdministrativas && (
                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground italic">
                  "{cuota.notasAdministrativas}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
