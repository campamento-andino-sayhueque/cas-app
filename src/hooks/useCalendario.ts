/**
 * Hooks específicos para el Calendario
 * 
 * Proporcionan estado reactivo para operaciones del calendario usando TanStack Query.
 */

import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { calendarioService } from '../api/services/calendario';
import { calendarioKeys, type FiltroEventos } from '../api/query-keys/calendario.keys';
import type { EventoRequest } from '../api/schemas/calendario';

/**
 * Hook para obtener eventos del calendario
 */
export function useEventos(filtro: FiltroEventos = {}) {
  const query = useQuery({
    queryKey: calendarioKeys.eventos(filtro),
    queryFn: () => calendarioService.listarEventos(filtro),
    placeholderData: keepPreviousData
  });

  // Eventos formateados para react-big-calendar
  const eventosCalendario = useMemo(() => {
    if (!query.data) return [];
    return calendarioService.aEventosCalendario(query.data);
  }, [query.data]);

  return {
    eventos: query.data || [],
    eventosCalendario,
    cargando: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook para obtener tipos de evento
 */
export function useTiposEvento() {
  const query = useQuery({
    queryKey: calendarioKeys.tipos(),
    queryFn: () => calendarioService.listarTiposEvento()
  });

  return {
    tipos: query.data || [],
    cargando: query.isLoading,
    error: query.error
  };
}

/**
 * Hook para obtener próximos eventos
 */
export function useProximosEventos(dias: number = 30) {
  const query = useQuery({
    queryKey: calendarioKeys.proximos(dias),
    queryFn: () => calendarioService.obtenerProximosEventos(dias)
  });

  return {
    eventos: query.data || [],
    cargando: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook para crear un evento
 */
export function useCrearEvento() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (evento: EventoRequest) => calendarioService.crearEvento(evento),
    onSuccess: () => {
      // Invalidar queries de eventos para recargar
      queryClient.invalidateQueries({ queryKey: calendarioKeys.todos });
    }
  });

  return {
    crearEvento: mutation.mutateAsync,
    cargando: mutation.isPending,
    error: mutation.error,
    eventoCreado: mutation.data,
    reset: mutation.reset
  };
}

/**
 * Hook para actualizar un evento
 */
export function useActualizarEvento() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, evento }: { id: number; evento: EventoRequest }) => 
      calendarioService.actualizarEvento(id, evento),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: calendarioKeys.todos });
      queryClient.invalidateQueries({ queryKey: calendarioKeys.evento(variables.id) });
    }
  });

  const actualizarEvento = (id: number, evento: EventoRequest) => {
    return mutation.mutateAsync({ id, evento });
  };

  return {
    actualizarEvento,
    cargando: mutation.isPending,
    error: mutation.error,
    eventoActualizado: mutation.data,
    reset: mutation.reset
  };
}

/**
 * Hook para eliminar un evento
 */
export function useEliminarEvento() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => calendarioService.eliminarEvento(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: calendarioKeys.todos });
      queryClient.invalidateQueries({ queryKey: calendarioKeys.evento(id) });
    }
  });

  return {
    eliminarEvento: mutation.mutateAsync,
    cargando: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
}
