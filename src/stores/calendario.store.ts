/**
 * Store de Calendario
 * 
 * Gestiona el estado de UI del calendario usando TanStack Store.
 */

import { Store } from '@tanstack/store';
import type { EventoCalendarioFormateado, EventoRequest } from '../api/schemas/calendario';

interface CalendarioState {
  eventoSeleccionado: EventoCalendarioFormateado | null;
  modalDetalleAbierto: boolean;
  modalFormularioAbierto: boolean;
  modoEdicion: boolean;
  borradorEvento: Partial<EventoRequest>;
}

const BORRADOR_EVENTO_INICIAL: Partial<EventoRequest> = {
  titulo: "",
  descripcion: "",
  tipo: "actividad",
  fechaInicio: "",
  fechaFin: "",
  ubicacion: "",
};

export const calendarioStore = new Store<CalendarioState>({
  eventoSeleccionado: null,
  modalDetalleAbierto: false,
  modalFormularioAbierto: false,
  modoEdicion: false,
  borradorEvento: BORRADOR_EVENTO_INICIAL,
});

export const calendarioAcciones = {
  abrirModalDetalle: (evento: EventoCalendarioFormateado) => {
    calendarioStore.setState((state) => ({
      ...state,
      eventoSeleccionado: evento,
      modalDetalleAbierto: true,
    }));
  },

  cerrarModalDetalle: () => {
    calendarioStore.setState((state) => ({
      ...state,
      modalDetalleAbierto: false,
      eventoSeleccionado: null,
    }));
  },

  abrirModalCrear: () => {
    calendarioStore.setState((state) => ({
      ...state,
      modalFormularioAbierto: true,
      modoEdicion: false,
      borradorEvento: BORRADOR_EVENTO_INICIAL,
    }));
  },

  abrirModalEditar: () => {
    const { eventoSeleccionado } = calendarioStore.state;
    if (!eventoSeleccionado) return;

    const borrador: Partial<EventoRequest> = {
      titulo: eventoSeleccionado.title,
      descripcion: eventoSeleccionado.descripcion,
      tipo: eventoSeleccionado.tipo,
      fechaInicio: eventoSeleccionado.start.toISOString(),
      fechaFin: eventoSeleccionado.end.toISOString(),
      ubicacion: eventoSeleccionado.ubicacion || "",
    };

    calendarioStore.setState((state) => ({
      ...state,
      modalFormularioAbierto: true,
      modoEdicion: true,
      modalDetalleAbierto: false, // Cerrar modal de detalle si está abierto
      borradorEvento: borrador,
    }));
  },

  cerrarModalFormulario: () => {
    calendarioStore.setState((state) => ({
      ...state,
      modalFormularioAbierto: false,
      modoEdicion: false,
      borradorEvento: BORRADOR_EVENTO_INICIAL,
    }));
  },

  actualizarBorrador: (datos: Partial<EventoRequest>) => {
    calendarioStore.setState((state) => ({
      ...state,
      borradorEvento: { ...state.borradorEvento, ...datos },
    }));
  },
  
  reiniciarBorrador: () => {
    calendarioStore.setState((state) => ({
      ...state,
      borradorEvento: BORRADOR_EVENTO_INICIAL,
    }));
  }
};
