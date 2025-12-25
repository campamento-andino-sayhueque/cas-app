import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { usePlanes } from '../../hooks/usePagos';
import { EstadoInscripcion, EstadoFinanciero, type AdminInscripcionFilters } from '../../api/schemas/pagos';

interface FiltrosInscripcionesProps {
  filters: AdminInscripcionFilters;
  onFiltersChange: (filters: AdminInscripcionFilters) => void;
}

/**
 * Filter bar for admin inscriptions table.
 * Provides plan, status, and search filters.
 */
export function FiltrosInscripciones({ filters, onFiltersChange }: FiltrosInscripcionesProps) {
  const { planes } = usePlanes();
  const [searchValue, setSearchValue] = useState(filters.q || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.q) {
        onFiltersChange({ ...filters, q: searchValue || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);

  const handlePlanChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      plan: value === 'all' ? undefined : value 
    });
  };

  const handleEstadoInscripcionChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      estadoInscripcion: value === 'all' ? undefined : value as EstadoInscripcion 
    });
  };

  const handleEstadoFinancieroChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      estadoFinanciero: value === 'all' ? undefined : value as EstadoFinanciero 
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, DNI o email..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Plan filter */}
      <Select 
        value={filters.plan || 'all'} 
        onValueChange={handlePlanChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los planes</SelectItem>
          {planes.map((plan) => (
            <SelectItem key={plan.id} value={plan.codigo}>
              {plan.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Estado Inscripción filter */}
      <Select 
        value={filters.estadoInscripcion || 'all'} 
        onValueChange={handleEstadoInscripcionChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={EstadoInscripcion.ACTIVA}>Activa</SelectItem>
          <SelectItem value={EstadoInscripcion.MOVIDA_PLAN_B}>Migrada Plan B</SelectItem>
          <SelectItem value={EstadoInscripcion.CANCELADA}>Cancelada</SelectItem>
        </SelectContent>
      </Select>

      {/* Estado Financiero filter */}
      <Select 
        value={filters.estadoFinanciero || 'all'} 
        onValueChange={handleEstadoFinancieroChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Deuda" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={EstadoFinanciero.AL_DIA}>Al día</SelectItem>
          <SelectItem value={EstadoFinanciero.MOROSO}>Moroso</SelectItem>
          <SelectItem value={EstadoFinanciero.MIGRADO}>Migrado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
