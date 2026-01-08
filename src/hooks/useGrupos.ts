import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gruposService } from "../api/services/grupos";

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
 * Hook para agregar un usuario a un grupo.
 */
export function useAgregarAGrupo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ usuarioId, grupoId }: { usuarioId: number; grupoId: string }) =>
            gruposService.agregarUsuarioAGrupo(usuarioId, grupoId),
        onSuccess: (_, { usuarioId }) => {
            queryClient.invalidateQueries({ queryKey: ['usuarios', usuarioId, 'grupos'] });
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
        onSuccess: (_, { usuarioId }) => {
            queryClient.invalidateQueries({ queryKey: ['usuarios', usuarioId, 'grupos'] });
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
