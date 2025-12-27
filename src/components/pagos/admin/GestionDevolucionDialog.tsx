/**
 * Dialog de Gestión de Devolución - Acciones del Tesorero
 * 
 * Permite al tesorero aprobar, procesar o rechazar una solicitud de baja.
 */

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import {
    CheckCircle2,
    XCircle,
    Banknote,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { type SolicitudBajaAdmin } from '../../../api/schemas/pagos';

const MESES_NOMBRE: Record<number, string> = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
    5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre',
};

interface GestionDevolucionDialogProps {
    open: boolean;
    onClose: () => void;
    solicitud: SolicitudBajaAdmin;
    procesando: boolean;
    onAprobar: (notas?: string) => void;
    onProcesar: (referencia?: string) => void;
    onRechazar: (motivo: string) => void;
}

export function GestionDevolucionDialog({
    open,
    onClose,
    solicitud,
    procesando,
    onAprobar,
    onProcesar,
    onRechazar,
}: GestionDevolucionDialogProps) {
    const [notas, setNotas] = useState('');
    const [referenciaPago, setReferenciaPago] = useState('');
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [modoRechazo, setModoRechazo] = useState(false);

    const esPendiente = solicitud.estado === 'PENDIENTE';
    const esAprobada = solicitud.estado === 'APROBADA';
    const esFinalizada = ['PROCESADA', 'RECHAZADA'].includes(solicitud.estado);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Solicitud de Baja #{solicitud.id}
                    </DialogTitle>
                    <DialogDescription>
                        {solicitud.nombrePlan} ({solicitud.codigoPlan})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Resumen de la solicitud */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                            <p className="text-xs text-muted-foreground">Mes de aviso</p>
                            <p className="font-medium">{MESES_NOMBRE[solicitud.mesAviso]}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Porcentaje</p>
                            <Badge variant={solicitud.porcentajeDevolucion === 100 ? 'default' : solicitud.porcentajeDevolucion === 50 ? 'secondary' : 'destructive'}>
                                {solicitud.porcentajeDevolucion}%
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Monto pagado</p>
                            <p className="font-medium">${Number(solicitud.montoPagado).toLocaleString('es-AR')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">A devolver</p>
                            <p className="font-bold text-lg text-green-600">${Number(solicitud.montoADevolver).toLocaleString('es-AR')}</p>
                        </div>
                    </div>

                    {solicitud.motivo && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Motivo del usuario</p>
                            <p className="text-sm p-2 bg-muted rounded">{solicitud.motivo}</p>
                        </div>
                    )}

                    <Separator />

                    {/* Acciones según estado */}
                    {esPendiente && !modoRechazo && (
                        <div className="space-y-3">
                            <div>
                                <Label>Notas (opcional)</Label>
                                <Textarea
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    placeholder="Agregar notas internas..."
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => onAprobar(notas || undefined)}
                                    disabled={procesando}
                                    className="flex-1"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Aprobar
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setModoRechazo(true)}
                                    className="flex-1"
                                >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Rechazar
                                </Button>
                            </div>
                        </div>
                    )}

                    {esPendiente && modoRechazo && (
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-red-800">Rechazar solicitud</p>
                                    <p className="text-sm text-red-700">Esta acción no se puede deshacer.</p>
                                </div>
                            </div>

                            <div>
                                <Label>Motivo del rechazo *</Label>
                                <Textarea
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    placeholder="Indicar motivo..."
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setModoRechazo(false)}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => onRechazar(motivoRechazo)}
                                    disabled={procesando || !motivoRechazo.trim()}
                                    className="flex-1"
                                >
                                    Confirmar Rechazo
                                </Button>
                            </div>
                        </div>
                    )}

                    {esAprobada && (
                        <div className="space-y-3">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-800">Solicitud aprobada</p>
                                    <p className="text-sm text-blue-700">Pendiente de procesar la devolución.</p>
                                </div>
                            </div>

                            <div>
                                <Label>Referencia de pago (opcional)</Label>
                                <Input
                                    value={referenciaPago}
                                    onChange={(e) => setReferenciaPago(e.target.value)}
                                    placeholder="Nro. de transferencia, cheque, etc."
                                />
                            </div>

                            <Button
                                onClick={() => onProcesar(referenciaPago || undefined)}
                                disabled={procesando}
                                className="w-full"
                            >
                                <Banknote className="w-4 h-4 mr-1" />
                                Marcar como Procesada
                            </Button>
                        </div>
                    )}

                    {esFinalizada && (
                        <div className={`p-3 rounded-lg flex items-start gap-2 ${solicitud.estado === 'PROCESADA'
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                            }`}>
                            {solicitud.estado === 'PROCESADA' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            )}
                            <div>
                                <p className={`font-medium ${solicitud.estado === 'PROCESADA' ? 'text-green-800' : 'text-red-800'}`}>
                                    {solicitud.estado === 'PROCESADA' ? 'Devolución procesada' : 'Solicitud rechazada'}
                                </p>
                                {solicitud.notasTesorero && (
                                    <p className="text-sm mt-1">{solicitud.notasTesorero}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
