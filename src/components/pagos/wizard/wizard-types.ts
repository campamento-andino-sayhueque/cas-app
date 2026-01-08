/**
 * Tipos y constantes del Wizard de Planes de Pago.
 * 
 * NOTA: El límite de inscripción se calcula automáticamente como mesInicioControlAtraso - 1
 * por eso no hay un step separado para definirlo.
 */

export const PLAN_A_SUBSTEPS = ['datos', 'vigencia', 'monto'] as const;
export type PlanASubStep = typeof PLAN_A_SUBSTEPS[number];

export const MESES = [
    { val: 1, label: 'Enero' },
    { val: 2, label: 'Febrero' },
    { val: 3, label: 'Marzo' },
    { val: 4, label: 'Abril' },
    { val: 5, label: 'Mayo' },
    { val: 6, label: 'Junio' },
    { val: 7, label: 'Julio' },
    { val: 8, label: 'Agosto' },
    { val: 9, label: 'Septiembre' },
    { val: 10, label: 'Octubre' },
    { val: 11, label: 'Noviembre' },
    { val: 12, label: 'Diciembre' },
];

export interface WizardStepProps {
    form: any;
}

/** Retorna el último día del mes (28, 29, 30 o 31) */
export function ultimoDiaMes(mes: number | undefined): number {
    if (!mes) return 30;
    // Usamos año no bisiesto como referencia
    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return diasPorMes[mes - 1] ?? 30;
}
