/**
 * Modal de Solicitud de Baja de Plan de Pago
 * 
 * Muestra la política de devolución del plan y permite al usuario confirmar la solicitud.
 */

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const MESES_NOMBRE: Record<number, string> = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
    5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre',
};

interface ModalSolicitudBajaProps {
    open: boolean;
    onClose: () => void;
    onConfirmar: (motivo?: string) => void;
    cargando: boolean;
    // Datos del plan
    nombrePlan: string;
    montoPagado: number;
    // Política de devolución del plan
    mesLimiteDevolucion100?: number | null;
    mesLimiteDevolucion50?: number | null;
}

export function ModalSolicitudBaja({
    open,
    onClose,
    onConfirmar,
    cargando,
    nombrePlan,
    montoPagado,
    mesLimiteDevolucion100,
    mesLimiteDevolucion50,
}: ModalSolicitudBajaProps) {
    const [motivo, setMotivo] = useState('');

    const mesActual = new Date().getMonth() + 1; // 1-12

    // Calcular porcentaje de devolución según política
    const calcularPorcentaje = () => {
        if (mesLimiteDevolucion100 && mesActual <= mesLimiteDevolucion100) {
            return 100;
        }
        if (mesLimiteDevolucion50 && mesActual <= mesLimiteDevolucion50) {
            return 50;
        }
        return 0;
    };

    const porcentaje = calcularPorcentaje();
    const montoADevolver = (montoPagado * porcentaje) / 100;

    const getPorcentajeColor = () => {
        if (porcentaje === 100) return 'bg-green-100 text-green-700 border-green-300';
        if (porcentaje === 50) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return 'bg-red-100 text-red-700 border-red-300';
    };

    const getPorcentajeIcon = () => {
        if (porcentaje === 100) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
        if (porcentaje === 50) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
        return <XCircle className="w-5 h-5 text-red-600" />;
    };

    return (
        <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Solicitar Baja del Plan
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4 pt-2">
                            <p>
                                Estás por solicitar la baja del plan <strong>{nombrePlan}</strong>.
                                Esta acción enviará una solicitud al tesorero para su revisión.
                            </p>

                            {/* Política de Devolución */}
                            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                <h4 className="font-medium text-sm">Política de Devolución</h4>

                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="p-2 rounded bg-green-50 border border-green-200 text-center">
                                        <div className="font-bold text-green-700">100%</div>
                                        <div className="text-green-600">
                                            Hasta {mesLimiteDevolucion100 ? MESES_NOMBRE[mesLimiteDevolucion100] : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="p-2 rounded bg-yellow-50 border border-yellow-200 text-center">
                                        <div className="font-bold text-yellow-700">50%</div>
                                        <div className="text-yellow-600">
                                            Hasta {mesLimiteDevolucion50 ? MESES_NOMBRE[mesLimiteDevolucion50] : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="p-2 rounded bg-red-50 border border-red-200 text-center">
                                        <div className="font-bold text-red-700">0%</div>
                                        <div className="text-red-600">Después</div>
                                    </div>
                                </div>

                                {/* Resultado para hoy */}
                                <div className={`p-3 rounded-lg border flex items-center gap-3 ${getPorcentajeColor()}`}>
                                    {getPorcentajeIcon()}
                                    <div>
                                        <p className="font-medium">
                                            Hoy ({MESES_NOMBRE[mesActual]}): {porcentaje}% devolución
                                        </p>
                                        <p className="text-sm">
                                            Monto pagado: <strong>${montoPagado.toLocaleString('es-AR')}</strong>
                                            {' → '}
                                            A devolver: <strong>${montoADevolver.toLocaleString('es-AR')}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Advertencia si 0% */}
                            {porcentaje === 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-red-800">Sin devolución</p>
                                        <p className="text-sm text-red-700">
                                            Según la política del plan, no corresponde devolución para solicitudes en este mes.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Campo de motivo */}
                            <div className="space-y-2">
                                <Label htmlFor="motivo">Motivo de la baja (opcional)</Label>
                                <Textarea
                                    id="motivo"
                                    placeholder="Escribí el motivo de la baja si querés..."
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    className="resize-none"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={cargando}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onConfirmar(motivo || undefined)}
                        disabled={cargando}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        {cargando ? 'Enviando...' : 'Confirmar Solicitud'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
