/**
 * Calendario Route
 * 
 * Página del calendario de actividades
 */

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import type { View } from "react-big-calendar";
import { startOfMonth } from "date-fns/startOfMonth";
import { endOfMonth } from "date-fns/endOfMonth";
import { startOfWeek } from "date-fns/startOfWeek";
import { endOfWeek } from "date-fns/endOfWeek";
import { startOfDay } from "date-fns/startOfDay";
import { endOfDay } from "date-fns/endOfDay";
import { addDays } from "date-fns/addDays";
import { toast } from "sonner";

import { 
  useEventos, 
  useTiposEvento, 
  useCrearEvento, 
  useEliminarEvento, 
  useActualizarEvento 
} from "../hooks/useCalendario";
import { useAuth } from "../hooks/useAuth";
import { calendarioStore, calendarioAcciones } from "../stores/calendario.store";
import type { EventoRequest } from "../api/schemas/calendario";

import {
  CalendarioHeader,
  CalendarioView,
  CalendarioLegend,
  EventoDetalleModal,
  EventoFormularioModal,
} from "../components/calendario";

export const Route = createFileRoute("/_auth/calendario")({
  component: CalendarioPage,
});

function CalendarioPage() {
  // Permisos
  const { hasRole } = useAuth();
  const puedeEditar = hasRole("DIRIGENTE") || hasRole("ADMIN");

  // TanStack Store hooks
  const eventoSeleccionado = useStore(calendarioStore, (state) => state.eventoSeleccionado);
  const modalDetalleAbierto = useStore(calendarioStore, (state) => state.modalDetalleAbierto);
  const modalFormularioAbierto = useStore(calendarioStore, (state) => state.modalFormularioAbierto);
  const modoEdicion = useStore(calendarioStore, (state) => state.modoEdicion);
  const borradorEvento = useStore(calendarioStore, (state) => state.borradorEvento);

  // Estado local para la vista del calendario
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  // Calcular rango de fechas para fetching
  const { desde, hasta } = useMemo(() => {
    let start = date;
    let end = date;

    switch (view) {
      case "month":
        start = startOfWeek(startOfMonth(date));
        end = endOfWeek(endOfMonth(date));
        break;
      case "week":
        start = startOfWeek(date);
        end = endOfWeek(date);
        break;
      case "day":
        start = startOfDay(date);
        end = endOfDay(date);
        break;
      case "agenda":
        start = startOfDay(date);
        end = addDays(start, 30);
        break;
    }
    return { desde: start, hasta: end };
  }, [view, date]);

  // Hooks de la API (TanStack Query) - Fetching basado en rango
  const { eventosCalendario, cargando, error } = useEventos({ desde, hasta });
  const { tipos: tiposEvento } = useTiposEvento();
  const { crearEvento, cargando: creando } = useCrearEvento();
  const { actualizarEvento, cargando: actualizando } = useActualizarEvento();
  const { eliminarEvento, cargando: eliminando } = useEliminarEvento();

  // Manejar creación de evento
  const handleCrearEvento = async (data: Partial<EventoRequest>) => {
    if (!data.titulo || !data.fechaInicio || !data.fechaFin) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    try {
      await crearEvento(data as EventoRequest);
      calendarioAcciones.cerrarModalFormulario();
      toast.success("Evento creado exitosamente");
    } catch (err) {
      console.error("Error al crear evento:", err);
      const message = err instanceof Error ? err.message : "Error al crear el evento";
      toast.error(message);
    }
  };

  // Manejar actualización de evento
  const handleActualizarEvento = async (data: Partial<EventoRequest>) => {
    if (!eventoSeleccionado || !data.titulo) return;
    
    try {
      await actualizarEvento(Number(eventoSeleccionado.id), data as EventoRequest);
      calendarioAcciones.cerrarModalFormulario();
      toast.success("Evento actualizado exitosamente");
    } catch (err) {
      console.error("Error al actualizar evento:", err);
      const message = err instanceof Error ? err.message : "Error al actualizar el evento";
      toast.error(message);
    }
  };

  // Manejar eliminación de evento
  const handleEliminarEvento = async () => {
    if (!eventoSeleccionado) return;
    
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      try {
        await eliminarEvento(Number(eventoSeleccionado.id));
        calendarioAcciones.cerrarModalDetalle();
        toast.success("Evento eliminado exitosamente");
      } catch (err) {
        console.error("Error al eliminar evento:", err);
        const message = err instanceof Error ? err.message : "Error al eliminar el evento";
        toast.error(message);
      }
    }
  };

  // Calcular días restantes hasta el campamento
  const fechaInicioCampamento = new Date(2025, 11, 15);
  const hoy = new Date();
  const diasRestantes = Math.ceil(
    (fechaInicioCampamento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-full bg-gradient-to-br from-green-50 via-orange-50 to-red-50 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        
        <CalendarioHeader 
          diasRestantes={diasRestantes} 
          onNuevoEvento={calendarioAcciones.abrirModalCrear} 
          error={error}
          puedeEditar={puedeEditar}
        />

        <main className="max-w-7xl mx-auto">
          <CalendarioView 
            events={eventosCalendario} 
            loading={cargando} 
            onSelectEvent={calendarioAcciones.abrirModalDetalle}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
          />
          
          <CalendarioLegend tiposEvento={tiposEvento} />
        </main>
      </div>

      <EventoDetalleModal
        eventoSeleccionado={eventoSeleccionado}
        abierto={modalDetalleAbierto}
        onCerrar={calendarioAcciones.cerrarModalDetalle}
        onEditar={calendarioAcciones.abrirModalEditar}
        onEliminar={handleEliminarEvento}
        eliminando={eliminando}
        puedeEditar={puedeEditar}
      />

      <EventoFormularioModal
        abierto={modalFormularioAbierto}
        modoEdicion={modoEdicion}
        cargando={creando || actualizando}
        valoresIniciales={borradorEvento}
        tiposEvento={tiposEvento || []}
        onCerrar={calendarioAcciones.cerrarModalFormulario}
        onGuardar={(data) => {
          if (modoEdicion) {
            handleActualizarEvento(data);
          } else {
            handleCrearEvento(data);
          }
        }}
      />
    </div>
  );
}
