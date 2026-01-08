/**
 * PlanTimelineChart - Visualización interactiva del ciclo de Plan A/B
 * 
 * Muestra un timeline horizontal con:
 * - Zona verde: Período de inscripción abierta
 * - Zona roja: Mes de control 
 * - Zona gris: Plan B (si no cumple mínimo)
 * 
 * El timeline muestra los meses en orden del ciclo (ej: Mar → Ene),
 * no en orden calendario (Ene → Dic).
 */

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell,
} from 'recharts';

const MESES_LABEL = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface PlanTimelineChartProps {
    mesInicio: number;      // 1-12
    mesFin: number;         // 1-12 (puede ser < mesInicio si cruza año)
    mesControl: number;     // 1-12
    cuotasMinimas?: number; // Calculado automáticamente si no se pasa
    interactivo?: boolean;  // Mostrar tooltips
    className?: string;
}

interface MesData {
    mes: string;
    mesNum: number;
    valor: number;
    tipo: 'inscripcion' | 'control' | 'planB';
    esSigAnio: boolean;    // Para indicar "Ene '27" etc.
}

export function PlanTimelineChart({
    mesInicio,
    mesFin,
    mesControl,
    cuotasMinimas,
    interactivo = true,
    className = '',
}: PlanTimelineChartProps) {
    const data = useMemo(() => {
        const result: MesData[] = [];
        const cuotasCalc = cuotasMinimas ?? (mesControl - mesInicio);
        const mesLimite = mesControl - 1;

        // Generar array de meses EN ORDEN DEL CICLO
        let m = mesInicio;
        const visitados = new Set<number>();
        
        while (true) {
            if (visitados.has(m)) break; // Evitar loop infinito
            visitados.add(m);
            
            const esSigAnio = m < mesInicio; // Si es < inicio, es del año siguiente
            
            let tipo: MesData['tipo'];
            if (m === mesControl) {
                tipo = 'control';
            } else if (esMesAntesDe(m, mesControl, mesInicio)) {
                tipo = 'inscripcion';
            } else {
                tipo = 'planB';
            }

            // Label con indicador de año si cruza
            const label = esSigAnio 
                ? `${MESES_LABEL[m - 1]}'` 
                : MESES_LABEL[m - 1];

            result.push({
                mes: label,
                mesNum: m,
                valor: 1,
                tipo,
                esSigAnio,
            });

            // Avanzar al siguiente mes
            if (m === mesFin) break;
            m = (m % 12) + 1;
            
            // Safety: máximo 12 iteraciones
            if (result.length >= 12) break;
        }

        // Encontrar índice del mes límite en el array
        const mesLimiteIndex = result.findIndex(r => r.mesNum === mesLimite);

        return { meses: result, mesLimite, mesLimiteIndex, cuotasCalc };
    }, [mesInicio, mesFin, mesControl, cuotasMinimas]);

    const getColor = (tipo: MesData['tipo']) => {
        switch (tipo) {
            case 'inscripcion': return '#22c55e'; // green-500
            case 'control': return '#ef4444';      // red-500
            case 'planB': return '#94a3b8';        // slate-400
        }
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0].payload as MesData;
        
        let mensaje = '';
        switch (d.tipo) {
            case 'inscripcion':
                mensaje = `✅ Inscripción abierta`;
                break;
            case 'control':
                mensaje = `⚠️ Mes de control - Se verifica ${data.cuotasCalc} cuotas mínimas`;
                break;
            case 'planB':
                mensaje = `⬜ Plan B si no cumple mínimo`;
                break;
        }

        return (
            <div className="bg-background border rounded-lg shadow-lg p-2 text-xs">
                <p className="font-medium">{d.esSigAnio ? `${MESES_LABEL[d.mesNum - 1]} (año sig.)` : MESES_LABEL[d.mesNum - 1]}</p>
                <p className="text-muted-foreground">{mensaje}</p>
            </div>
        );
    };

    // Encontrar el label del mes límite para la línea de referencia
    const mesLimiteLabel = data.mesLimiteIndex >= 0 ? data.meses[data.mesLimiteIndex]?.mes : '';

    return (
        <div className={`w-full ${className}`}>
            <ResponsiveContainer width="100%" height={80}>
                <BarChart data={data.meses} layout="horizontal" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis hide domain={[0, 1]} />
                    
                    {interactivo && <Tooltip content={<CustomTooltip />} />}
                    
                    {/* Línea vertical en mes límite inscripción */}
                    {mesLimiteLabel && (
                        <ReferenceLine
                            x={mesLimiteLabel}
                            stroke="#f59e0b"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            label={{ value: '🔒', position: 'top', fontSize: 12 }}
                        />
                    )}
                    
                    <Bar dataKey="valor" radius={[4, 4, 4, 4]}>
                        {data.meses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.tipo)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            
            {/* Leyenda compacta */}
            <div className="flex justify-center gap-4 text-[10px] text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-green-500" /> Inscripción
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-red-500" /> Control
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-slate-400" /> Plan B
                </span>
                <span className="flex items-center gap-1">
                    <span className="text-amber-500">⸻</span> Límite inscr.
                </span>
            </div>
        </div>
    );
}

/** Verifica si un mes está antes del control en el ciclo */
function esMesAntesDe(mes: number, control: number, inicio: number): boolean {
    // Normalizar posición en el ciclo
    const posMes = mes >= inicio ? mes - inicio : (12 - inicio) + mes;
    const posControl = control >= inicio ? control - inicio : (12 - inicio) + control;
    return posMes < posControl;
}
