import { Eye } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import { 
  type InscripcionAdmin,
  EstadoFinanciero,
  EstadoInscripcion
} from '../../api/schemas/pagos';
import { cn } from '../../lib/utils';

interface TablaInscripcionesAdminProps {
  inscripciones: InscripcionAdmin[];
  cargando: boolean;
  onVerDetalle: (inscripcion: InscripcionAdmin) => void;
}

/**
 * Main data grid for admin inscriptions.
 * Displays user info, plan, payment progress, and financial status.
 */
export function TablaInscripcionesAdmin({ 
  inscripciones, 
  cargando, 
  onVerDetalle 
}: TablaInscripcionesAdminProps) {

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEstadoFinancieroBadge = (estado: EstadoFinanciero) => {
    switch (estado) {
      case EstadoFinanciero.AL_DIA:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">🟢 Al día</Badge>;
      case EstadoFinanciero.MOROSO:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">🔴 Moroso</Badge>;
      case EstadoFinanciero.MIGRADO:
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">⚠️ Migrado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getEstadoInscripcionBadge = (estado: EstadoInscripcion) => {
    switch (estado) {
      case EstadoInscripcion.ACTIVA:
        return <Badge variant="secondary">Activa</Badge>;
      case EstadoInscripcion.MOVIDA_PLAN_B:
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Plan B</Badge>;
      case EstadoInscripcion.CANCELADA:
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (cargando) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (inscripciones.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No se encontraron inscripciones
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Usuario</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="text-center">Progreso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Financiero</TableHead>
            <TableHead>Próx. Vencimiento</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inscripciones.map((inscripcion) => (
            <TableRow 
              key={inscripcion.idInscripcion}
              className={cn(
                inscripcion.estadoFinanciero === EstadoFinanciero.MOROSO && "bg-red-50/50",
                inscripcion.estadoFinanciero === EstadoFinanciero.MIGRADO && "bg-orange-50/50"
              )}
            >
              <TableCell>
                <div>
                  <p className="font-medium">{inscripcion.usuarioNombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {inscripcion.usuarioDni || inscripcion.usuarioEmail || '—'}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm">{inscripcion.codigoPlan}</span>
              </TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  "font-medium",
                  inscripcion.cuotasPagadas === inscripcion.totalCuotas && "text-green-600"
                )}>
                  {inscripcion.cuotasPagadas}/{inscripcion.totalCuotas}
                </span>
                {inscripcion.cuotasVencidas > 0 && (
                  <span className="text-red-600 ml-1 text-sm">
                    ({inscripcion.cuotasVencidas} vencidas)
                  </span>
                )}
              </TableCell>
              <TableCell>
                {getEstadoInscripcionBadge(inscripcion.estadoInscripcion)}
              </TableCell>
              <TableCell>
                {getEstadoFinancieroBadge(inscripcion.estadoFinanciero)}
              </TableCell>
              <TableCell>
                {formatDate(inscripcion.proximoVencimiento)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVerDetalle(inscripcion)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
