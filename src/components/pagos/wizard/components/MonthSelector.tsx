/**
 * Selector interactivo de mes límite de inscripción.
 * Muestra los 12 meses del año como cajitas clicables.
 */
import { MESES } from '../wizard-types';
import { AudienciaPlan } from '../../../../api/schemas/pagos';
import { Check } from 'lucide-react';

interface MonthSelectorProps {
    selectedMonth: number;
    suggestedMonth: number;
    audiencia: AudienciaPlan;
    onSelect: (month: number) => void;
}

export function MonthSelector({ selectedMonth, suggestedMonth, audiencia, onSelect }: MonthSelectorProps) {
    const getSuggestionText = (aud: AudienciaPlan) => {
        switch (aud) {
            case AudienciaPlan.ACAMPANTE:
                return 'Sugerido: Integración previa';
            case AudienciaPlan.BASE:
                return 'Sugerido: Inscripción flexible';
            case AudienciaPlan.DIRIGENTE:
                return 'Sugerido: Sin límite';
            default:
                return 'Mes sugerido';
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                    Elija el mes límite hasta el cual se permite la inscripción
                </p>
            </div>

            {/* Grid de meses */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {MESES.map((mes) => {
                    const isSelected = mes.val === selectedMonth;
                    const isSuggested = mes.val === suggestedMonth;
                    const isAfterSelected = mes.val > selectedMonth;

                    return (
                        <button
                            key={mes.val}
                            type="button"
                            onClick={() => onSelect(mes.val)}
                            className={`
                                group relative p-4 rounded-lg border-2 transition-all duration-200
                                hover:scale-105 hover:shadow-md
                                ${isSelected 
                                    ? 'bg-amber-500 text-white border-amber-600 shadow-lg scale-105' 
                                    : isSuggested
                                    ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-700'
                                    : 'bg-muted/30 border-border hover:border-primary/50 hover:bg-muted/50'
                                }
                                ${isAfterSelected && !isSelected ? 'opacity-40' : ''}
                            `}
                            title={isSuggested ? getSuggestionText(audiencia) : ''}
                        >
                            {/* Mes */}
                            <div className="flex flex-col items-center gap-1">
                                <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-muted-foreground'}`}>
                                    {mes.label.slice(0, 3)}
                                </span>
                                <span className={`text-lg font-bold ${isSelected ? 'text-white' : ''}`}>
                                    {mes.val}
                                </span>
                            </div>

                            {/* Badge de sugerido */}
                            {isSuggested && !isSelected && (
                                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    ⭐
                                </div>
                            )}

                            {/* Check mark cuando está seleccionado */}
                            {isSelected && (
                                <div className="absolute -top-2 -right-2 bg-white text-amber-600 rounded-full p-1 shadow-md">
                                    <Check className="w-3 h-3" />
                                </div>
                            )}

                            {/* Tooltip hover */}
                            {isSuggested && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {getSuggestionText(audiencia)}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Mensaje selección actual */}
            {selectedMonth && (
                <div className="text-center p-2 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm">
                        Límite: <span className="font-bold text-amber-600">
                            {MESES.find(m => m.val === selectedMonth)?.label}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
