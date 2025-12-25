/**
 * CalendarioHeader Component
 * 
 * Header del calendario con título y botón de nuevo evento
 */

import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface CalendarioHeaderProps {
  diasRestantes?: number;
  onNuevoEvento: () => void;
  error?: Error | null;
  puedeEditar?: boolean;
}

export function CalendarioHeader({ 
  diasRestantes, 
  onNuevoEvento, 
  error,
  puedeEditar = false
}: CalendarioHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📅 Calendario de Actividades
          </h1>
          {diasRestantes !== undefined && diasRestantes > 0 && (
            <p className="text-gray-600 mt-1">
              ¡Faltan <span className="font-semibold text-orange-600">{diasRestantes} días</span> para el campamento!
            </p>
          )}
        </div>
        
        {puedeEditar && (
          <Button 
            onClick={onNuevoEvento}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error al cargar eventos</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}
    </header>
  );
}
