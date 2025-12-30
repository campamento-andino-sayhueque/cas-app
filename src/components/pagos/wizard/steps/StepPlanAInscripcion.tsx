/**
 * Step Plan A - Límites de Inscripción.
 */
import { Card, CardContent } from '../../../ui/card';
import { AudienciaPlan } from '../../../../api/schemas/pagos';
import { CalendarClock } from 'lucide-react';
import type { WizardStepProps } from '../wizard-types';
import { MonthSelector } from '../components/MonthSelector';

export function StepPlanAInscripcion({ form }: WizardStepProps) {
    const getMesLimiteSugerido = (audiencia: AudienciaPlan): number => {
        switch (audiencia) {
            case AudienciaPlan.ACAMPANTE:
                return 10; // Octubre
            case AudienciaPlan.BASE:
                return 12; // Diciembre
            case AudienciaPlan.DIRIGENTE:
                return 12; // Diciembre
            default:
                return 10;
        }
    };

    return (
        <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400">
                    <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">Plan A - Límites de Inscripción</h3>
                    <p className="text-xs text-muted-foreground">
                        Define hasta cuándo los usuarios pueden anotarse
                    </p>
                </div>
            </div>

            {/* Content */}
            <Card>
                <CardContent className="pt-6">
                    <form.Field name="mesLimiteInscripcion">
                        {(field: any) => (
                            <form.Subscribe selector={(state: any) => state.values.audiencia}>
                                {(audiencia: any) => {
                                    const sugerido = getMesLimiteSugerido(audiencia);
                                    
                                    return (
                                        <MonthSelector
                                            selectedMonth={field.state.value || sugerido}
                                            suggestedMonth={sugerido}
                                            audiencia={audiencia}
                                            onSelect={(month) => field.handleChange(month)}
                                        />
                                    );
                                }}
                            </form.Subscribe>
                        )}
                    </form.Field>
                </CardContent>
            </Card>

            {/* Explicación sutil */}
            <div className="text-center">
                <p className="text-xs text-muted-foreground">
                    Inscripciones cerradas después de este mes. (⭐) Sugerencia por rol.
                </p>
            </div>
        </div>
    );
}
