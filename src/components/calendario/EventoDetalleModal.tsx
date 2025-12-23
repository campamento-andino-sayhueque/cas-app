/**
 * EventoDetalleModal Component
 * 
 * Modal para mostrar detalles de un evento
 */

import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { obtenerColorEvento, obtenerIconoEvento } from "./helpers";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import type { EventoCalendarioFormateado } from "../../api/schemas/calendario";

interface EventoDetalleModalProps {
  eventoSeleccionado: EventoCalendarioFormateado | null;
  abierto: boolean;
  onCerrar: () => void;
  onEditar: () => void;
  onEliminar: () => void;
  eliminando: boolean;
}

export function EventoDetalleModal({ 
  eventoSeleccionado, 
  abierto,
  onCerrar, 
  onEditar, 
  onEliminar, 
  eliminando 
}: EventoDetalleModalProps) {
  
  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {eventoSeleccionado && obtenerIconoEvento(eventoSeleccionado.tipo)}
            </span>
            <DialogTitle className="text-2xl font-bold">
               {eventoSeleccionado?.title}
            </DialogTitle>
          </div>
          <DialogDescription>
            Información detallada del evento seleccionado.
          </DialogDescription>
        </DialogHeader>

        {eventoSeleccionado && (
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none text-muted-foreground">Descripción</h4>
              <p className="text-sm text-foreground">{eventoSeleccionado.descripcion || "Sin descripción"}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none text-muted-foreground">Fecha y hora</h4>
              <p className="text-sm text-foreground">
                📅 {format(eventoSeleccionado.start, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
              <p className="text-sm text-foreground">
                🕐 {format(eventoSeleccionado.start, "HH:mm", { locale: es })} -{" "}
                {format(eventoSeleccionado.end, "HH:mm", { locale: es })}
              </p>
            </div>

            {eventoSeleccionado.ubicacion && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none text-muted-foreground">Ubicación</h4>
                <p className="text-sm text-foreground">📍 {eventoSeleccionado.ubicacion}</p>
              </div>
            )}

            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none text-muted-foreground mb-2">Tipo</h4>
              <Badge 
                style={{ backgroundColor: obtenerColorEvento(eventoSeleccionado.tipo) }}
                className="text-white hover:opacity-90"
              >
                {eventoSeleccionado.tipo.charAt(0).toUpperCase() + eventoSeleccionado.tipo.slice(1)}
              </Badge>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCerrar}>
            Cerrar
          </Button>
          <Button variant="default" onClick={onEditar}>
            ✏️ Editar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onEliminar}
            disabled={eliminando}
          >
            {eliminando ? "Eliminando..." : "🗑️ Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
