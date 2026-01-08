/**
 * Step Migración - Políticas de transición (Diseño simplificado).
 * 
 * Muestra:
 * 1. Gráfico interactivo que visualiza el ciclo completo
 * 2. Resumen dinámico en una línea
 * 3. Controles para ajustar mes de control
 */
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Card, CardContent } from '../../../ui/card';
import { GitBranch, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import type { WizardStepProps } from '../wizard-types';
import { MESES, ultimoDiaMes } from '../wizard-types';
import { PlanTimelineChart } from '../../charts/PlanTimelineChart';



export function StepMigracion({ form }: WizardStepProps) {
    return (
        <div className="grid gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header compacto */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <div className="p-2 rounded-full bg-violet-100 text-violet-600">
                    <GitBranch className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">Control de Pagos</h3>
                    <p className="text-xs text-muted-foreground">Define cuándo y cómo se verifica el cumplimiento</p>
                </div>
            </div>

            <form.Subscribe selector={(state: any) => state.values}>
                {(values: any) => {
                    const mesInicio = values.mesInicioHabilitado || 3;
                    const mesFin = values.mesFinHabilitado || 1;
                    const mesControl = values.mesInicioControlAtraso || 7;
                    const cuotasMinimas = mesControl - mesInicio;
                    const mesLimite = mesControl - 1;

                    return (
                        <>
                            {/* Gráfico principal - la estrella */}
                            <Card className="border-2">
                                <CardContent className="pt-4">
                                    <PlanTimelineChart
                                        mesInicio={mesInicio}
                                        mesFin={mesFin}
                                        mesControl={mesControl}
                                        interactivo={true}
                                    />
                                    
                                    {/* Resumen visual compacto con FECHAS EXACTAS */}
                                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                                            <Calendar className="w-4 h-4 mx-auto text-green-600 mb-1" />
                                            <p className="text-muted-foreground">Inscripción abierta</p>
                                            <p className="font-bold text-green-700 dark:text-green-400">
                                                1/{mesInicio} → {ultimoDiaMes(mesLimite)}/{mesLimite}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Cierra {MESES.find(m => m.val === mesLimite)?.label} 23:59
                                            </p>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                                            <AlertTriangle className="w-4 h-4 mx-auto text-red-600 mb-1" />
                                            <p className="text-muted-foreground">Inicia control</p>
                                            <p className="font-bold text-red-700 dark:text-red-400">
                                                1 de {MESES.find(m => m.val === mesControl)?.label}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Se verifica {cuotasMinimas} cuotas pagas
                                            </p>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                                            <CheckCircle className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                                            <p className="text-muted-foreground">Última cuota</p>
                                            <p className="font-bold text-blue-700 dark:text-blue-400">
                                                {MESES.find(m => m.val === mesFin)?.label}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {mesFin < mesInicio ? "(año sig.)" : ""}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Control único: Mes de control */}
                            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                <form.Field name="mesInicioControlAtraso">
                                    {(field: any) => (
                                        <div className="flex items-center gap-3 flex-1">
                                            <Label className="whitespace-nowrap font-medium">
                                                🔴 Mes de control:
                                            </Label>
                                            <Select 
                                                value={String(field.state.value)} 
                                                onValueChange={(v) => field.handleChange(Number(v))}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MESES.map(m => (
                                                        <SelectItem key={m.val} value={String(m.val)}>
                                                            {m.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-xs text-muted-foreground">
                                                (inscripciones cierran en {MESES.find(m => m.val === mesLimite)?.label})
                                            </span>
                                        </div>
                                    )}
                                </form.Field>
                            </div>
                        </>
                    );
                }}
            </form.Subscribe>
        </div>
    );
}
