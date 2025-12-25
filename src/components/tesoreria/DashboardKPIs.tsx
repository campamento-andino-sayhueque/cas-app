import { DollarSign, TrendingDown, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useResumenFinanciero } from '../../hooks/usePagos';
import { cn } from '../../lib/utils';

/**
 * Dashboard KPIs for Treasury screen.
 * Shows 4 key financial metrics.
 */
export function DashboardKPIs() {
  const { resumen, cargando, error } = useResumenFinanciero();

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>Error al cargar resumen financiero</span>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    // Use compact notation for large numbers on mobile
    if (amount >= 1000000) {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(amount);
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const kpis = [
    {
      title: 'Recaudación Total',
      shortTitle: 'Rec. Total',
      value: resumen ? formatCurrency(resumen.recaudacionTotal) : null,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: 'Recaudación Pendiente',
      shortTitle: 'Rec. Pendiente',
      value: resumen ? formatCurrency(resumen.recaudacionPendiente) : null,
      icon: TrendingDown,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800'
    },
    {
      title: 'Tasa de Morosidad',
      shortTitle: 'Morosidad',
      value: resumen ? formatPercent(resumen.tasaMorosidad) : null,
      icon: AlertCircle,
      color: resumen && resumen.tasaMorosidad > 10 ? 'text-red-600' : 'text-emerald-600',
      bgColor: resumen && resumen.tasaMorosidad > 10 
        ? 'bg-red-50 dark:bg-red-950/30' 
        : 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: resumen && resumen.tasaMorosidad > 10 
        ? 'border-red-200 dark:border-red-800' 
        : 'border-emerald-200 dark:border-emerald-800'
    },
    {
      title: 'Inscripciones Activas',
      shortTitle: 'Inscripciones',
      value: resumen ? `${resumen.inscripcionesActivas}/${resumen.totalInscripciones}` : null,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpis.map((kpi) => (
        <Card 
          key={kpi.title}
          className={cn(
            "border overflow-hidden",
            kpi.bgColor,
            kpi.borderColor
          )}
        >
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <kpi.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0", kpi.color)} />
              <span className="sm:hidden">{kpi.shortTitle}</span>
              <span className="hidden sm:inline">{kpi.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            {cargando ? (
              <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
            ) : (
              <p className={cn("text-lg sm:text-2xl font-bold truncate", kpi.color)}>
                {kpi.value}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
