/**
 * Step Plan A - Datos Generales.
 */
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { AudienciaPlan } from '../../../../api/schemas/pagos';
import { LayoutList } from 'lucide-react';
import type { WizardStepProps } from '../wizard-types';

export function StepPlanADatos({ form }: WizardStepProps) {
    return (
        <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <LayoutList className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">Plan A - Datos Generales</h3>
                    <p className="text-xs text-muted-foreground">Información básica del plan principal.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Nombre del Plan - Full Width */}
                <form.Field
                    name="nombreParaMostrar"
                    validators={{
                        onChange: ({ value }: { value: string }) =>
                            value.length < 3 ? 'El nombre debe tener al menos 3 caracteres' : undefined
                    }}
                >
                    {(field: any) => (
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre del Plan</Label>
                            <Input
                                id="nombre"
                                placeholder="Ej. Campamento Andino 2026"
                                value={field.state.value}
                                onChange={e => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                className={`text-lg ${field.state.meta.errors?.length ? "border-red-500" : ""}`}
                            />
                            {field.state.meta.errors?.length > 0 && (
                                <p className="text-xs text-red-500">{field.state.meta.errors[0]}</p>
                            )}
                        </div>
                    )}
                </form.Field>

                {/* Año y Audiencia en una fila */}
                <div className="grid grid-cols-[120px_1fr] gap-6 items-start">
                    {/* Año - Compacto */}
                    <form.Field
                        name="anio"
                        validators={{
                            onChange: ({ value }: { value: number }) =>
                                value < 2020 ? 'Año inválido' : undefined
                        }}
                    >
                        {(field: any) => (
                            <div className="space-y-2">
                                <Label htmlFor="anio">Año</Label>
                                <Input
                                    type="number"
                                    id="anio"
                                    value={field.state.value}
                                    onChange={e => field.handleChange(Number(e.target.value))}
                                    className={`text-center font-mono text-lg ${field.state.meta.errors?.length ? "border-red-500" : ""}`}
                                />
                                {field.state.meta.errors?.length > 0 && (
                                    <p className="text-xs text-red-500">{field.state.meta.errors[0]}</p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* Audiencia - Toggle Chips */}
                    <form.Field name="audiencia">
                        {(field: any) => (
                            <div className="space-y-2">
                                <Label>Audiencia</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { value: AudienciaPlan.ACAMPANTE, label: 'Acampante', icon: '🏕️' },
                                        { value: AudienciaPlan.DIRIGENTE, label: 'Dirigente', icon: '🎯' },
                                        { value: AudienciaPlan.BASE, label: 'Base', icon: '👨‍🍳' },
                                    ].map((opt) => {
                                        const isSelected = field.state.value === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => field.handleChange(opt.value)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${isSelected
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                                                    : 'bg-muted/30 border-border hover:border-primary/50 hover:bg-muted/50'
                                                    }`}
                                            >
                                                <span className="text-lg">{opt.icon}</span>
                                                <span className={`font-medium text-sm ${isSelected ? '' : 'text-foreground'}`}>
                                                    {opt.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </form.Field>
                </div>
            </div>
        </div>
    );
}
