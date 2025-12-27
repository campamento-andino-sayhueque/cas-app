/**
 * Tabla de Solicitudes de Baja - Vista del Tesorero
 * 
 * Lista las solicitudes de baja pendientes y permite gestionarlas.
 */

import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Eye,
    Loader2,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { type SolicitudBajaAdmin } from '../../../api/schemas/pagos';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../ui/table';
import { GestionDevolucionDialog } from './GestionDevolucionDialog';

const MESES_NOMBRE: Record<number, string> = {
    1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr',
    5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Ago',
    9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic',
};

interface TablaSolicitudesBajaProps {
    solicitudes: SolicitudBajaAdmin[];
    cargando: boolean;
    onRefrescar: () => void;
    onAprobar: (id: number, notas?: string) => Promise<void>;
    onProcesar: (id: number, referencia?: string) => Promise<void>;
    onRechazar: (id: number, motivo: string) => Promise<void>;
}

export function TablaSolicitudesBaja({
    solicitudes,
    cargando,
    onRefrescar,
    onAprobar,
    onProcesar,
    onRechazar,
}: TablaSolicitudesBajaProps) {
    const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudBajaAdmin | null>(null);
    const [procesando, setProcesando] = useState(false);

    const solicitudesFiltradas = filtroEstado === 'TODOS'
        ? solicitudes
        : solicitudes.filter(s => s.estado === filtroEstado);

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" /> Pendiente</Badge>;
            case 'APROBADA':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300"><CheckCircle2 className="w-3 h-3 mr-1" /> Aprobada</Badge>;
            case 'PROCESADA':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" /> Procesada</Badge>;
            case 'RECHAZADA':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" /> Rechazada</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };

    const handleAccion = async (
        accion: 'aprobar' | 'procesar' | 'rechazar',
        datos?: { notas?: string; referencia?: string; motivo?: string }
    ) => {
        if (!solicitudSeleccionada) return;

        setProcesando(true);
        try {
            if (accion === 'aprobar') {
                await onAprobar(solicitudSeleccionada.id, datos?.notas);
            } else if (accion === 'procesar') {
                await onProcesar(solicitudSeleccionada.id, datos?.referencia);
            } else if (accion === 'rechazar') {
                await onRechazar(solicitudSeleccionada.id, datos?.motivo || 'Sin motivo');
            }
            setSolicitudSeleccionada(null);
            onRefrescar();
        } finally {
            setProcesando(false);
        }
    };

    const contarPendientes = solicitudes.filter(s => s.estado === 'PENDIENTE').length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        Solicitudes de Baja
                        {contarPendientes > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {contarPendientes} pendiente{contarPendientes > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filtrar..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODOS">Todos</SelectItem>
                                <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                                <SelectItem value="APROBADA">Aprobadas</SelectItem>
                                <SelectItem value="PROCESADA">Procesadas</SelectItem>
                                <SelectItem value="RECHAZADA">Rechazadas</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="sm" onClick={onRefrescar} disabled={cargando}>
                            {cargando && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                            Actualizar
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {solicitudesFiltradas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No hay solicitudes {filtroEstado !== 'TODOS' ? 'con ese estado' : ''}</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plan</TableHead>
                                <TableHead>Solicitud</TableHead>
                                <TableHead className="text-right">Devolución</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {solicitudesFiltradas.map((solicitud) => (
                                <TableRow key={solicitud.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{solicitud.nombrePlan}</p>
                                            <p className="text-xs text-muted-foreground">{solicitud.codigoPlan}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm">Aviso en {MESES_NOMBRE[solicitud.mesAviso]}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(solicitud.creadoEn || '').toLocaleDateString('es-AR')}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div>
                                            <p className="font-medium">${Number(solicitud.montoADevolver).toLocaleString('es-AR')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {solicitud.porcentajeDevolucion}% de ${Number(solicitud.montoPagado).toLocaleString('es-AR')}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getEstadoBadge(solicitud.estado)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSolicitudSeleccionada(solicitud)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Ver
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Dialog de gestión */}
            {solicitudSeleccionada && (
                <GestionDevolucionDialog
                    open={!!solicitudSeleccionada}
                    onClose={() => setSolicitudSeleccionada(null)}
                    solicitud={solicitudSeleccionada}
                    procesando={procesando}
                    onAprobar={(notas?: string) => handleAccion('aprobar', { notas })}
                    onProcesar={(referencia?: string) => handleAccion('procesar', { referencia })}
                    onRechazar={(motivo?: string) => handleAccion('rechazar', { motivo })}
                />
            )}
        </Card>
    );
}
