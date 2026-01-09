import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gruposService, type MiembroGrupo } from "../api/services/grupos";

/**
 * Hook para obtener grupos de acampantes.
 */
export function useGruposAcampantes() {
    const query = useQuery({
        queryKey: ['grupos', 'acampantes'],
        queryFn: gruposService.listarGruposAcampantes,
    });

    return {
        grupos: query.data ?? [],
        cargando: query.isLoading,
        error: query.error,
    };
}

/**
 * Hook para obtener grupos de dirigentes.
 */
export function useGruposDirigentes() {
    const query = useQuery({
        queryKey: ['grupos', 'dirigentes'],
        queryFn: gruposService.listarGruposDirigentes,
    });

    return {
        grupos: query.data ?? [],
        cargando: query.isLoading,
        error: query.error,
    };
}

/**
 * Hook para obtener los grupos de un usuario específico.
 */
export function useGruposUsuario(usuarioId: number, enabled = true) {
    const query = useQuery({
        queryKey: ['usuarios', usuarioId, 'grupos'],
        queryFn: () => gruposService.obtenerGruposUsuario(usuarioId),
        enabled,
    });

    return {
        grupos: query.data ?? [],
        cargando: query.isLoading,
        error: query.error,
    };
}

/**
 * Hook para obtener los miembros de un grupo.
 */
export function useMiembrosGrupo(grupoId: string, enabled = true) {
    const query = useQuery({
        queryKey: ['grupos', grupoId, 'miembros'],
        queryFn: () => gruposService.obtenerMiembrosGrupo(grupoId),
        enabled: enabled && !!grupoId,
    });

    return {
        miembros: query.data ?? [],
        cargando: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook para agregar un usuario a un grupo.
 */
export function useAgregarAGrupo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ usuarioId, grupoId }: { usuarioId: number; grupoId: string }) =>
            gruposService.agregarUsuarioAGrupo(usuarioId, grupoId),
        onSuccess: (_, { usuarioId, grupoId }) => {
            queryClient.invalidateQueries({ queryKey: ['usuarios', usuarioId, 'grupos'] });
            queryClient.invalidateQueries({ queryKey: ['grupos', grupoId, 'miembros'] });
            queryClient.invalidateQueries({ queryKey: ['grupos', 'kanban'] });
        },
    });
}

/**
 * Hook para remover un usuario de un grupo.
 */
export function useRemoverDeGrupo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ usuarioId, grupoId }: { usuarioId: number; grupoId: string }) =>
            gruposService.removerUsuarioDeGrupo(usuarioId, grupoId),
        onSuccess: (_, { usuarioId, grupoId }) => {
            queryClient.invalidateQueries({ queryKey: ['usuarios', usuarioId, 'grupos'] });
            queryClient.invalidateQueries({ queryKey: ['grupos', grupoId, 'miembros'] });
            queryClient.invalidateQueries({ queryKey: ['grupos', 'kanban'] });
        },
    });
}

/**
 * Hook para crear un nuevo grupo de acampantes.
 */
export function useCrearGrupoAcampantes() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (nombre: string) => gruposService.crearGrupoAcampantes(nombre),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grupos', 'acampantes'] });
        },
    });
}

export type { MiembroGrupo };
