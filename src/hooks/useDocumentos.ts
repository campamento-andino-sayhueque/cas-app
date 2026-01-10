/**
 * Hooks React Query para el módulo de Documentos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentosService } from '../api/services/documentos';
import { documentosKeys } from '../api/query-keys/documentos';
import type { GuardarDocumentoRequest, CrearTipoDocumentoRequest } from '../api/schemas/documentos';

// ============================================
// Queries
// ============================================

/**
 * Lista todos los tipos de documento activos
 */
export function useTiposDocumento() {
    return useQuery({
        queryKey: documentosKeys.tipos(),
        queryFn: documentosService.listarTipos,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

/**
 * Obtiene un tipo de documento por ID
 */
export function useTipoDocumento(id: number) {
    return useQuery({
        queryKey: documentosKeys.tipo(id),
        queryFn: () => documentosService.obtenerTipo(id),
        enabled: !!id,
    });
}

/**
 * Obtiene el resumen de documentos para una familia
 */
export function useResumenDocumentosFamilia(familiaId: number | undefined) {
    return useQuery({
        queryKey: documentosKeys.resumenFamilia(familiaId!),
        queryFn: () => documentosService.getResumenFamilia(familiaId!),
        enabled: !!familiaId,
    });
}

/**
 * Obtiene todos los documentos de un usuario
 */
export function useDocumentosUsuario(usuarioId: number | undefined) {
    return useQuery({
        queryKey: documentosKeys.documentosUsuario(usuarioId!),
        queryFn: () => documentosService.getDocumentosUsuario(usuarioId!),
        enabled: !!usuarioId,
    });
}

/**
 * Obtiene un documento específico
 */
export function useDocumento(tipoDocumentoId: number, usuarioId: number | undefined) {
    return useQuery({
        queryKey: documentosKeys.documento(tipoDocumentoId, usuarioId!),
        queryFn: () => documentosService.getDocumento(tipoDocumentoId, usuarioId!),
        enabled: !!tipoDocumentoId && !!usuarioId,
    });
}

// ============================================
// Mutations
// ============================================

/**
 * Guarda o actualiza un documento
 */
export function useGuardarDocumento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: GuardarDocumentoRequest) => documentosService.guardarDocumento(data),
        onSuccess: (result) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: documentosKeys.documentosUsuario(result.usuarioId) });
            if (result.familiaId) {
                queryClient.invalidateQueries({ queryKey: documentosKeys.resumenFamilia(result.familiaId) });
            }
            queryClient.invalidateQueries({
                queryKey: documentosKeys.documento(result.tipoDocumentoId, result.usuarioId)
            });
        },
    });
}

/**
 * Sube un archivo adjunto
 */
export function useSubirAdjunto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ documentoId, adjuntoRequeridoId, file }: {
            documentoId: number;
            adjuntoRequeridoId: number;
            file: File;
        }) => documentosService.subirAdjunto(documentoId, adjuntoRequeridoId, file),
        onSuccess: () => {
            // Invalidar todas las queries de documentos
            queryClient.invalidateQueries({ queryKey: documentosKeys.all });
        },
    });
}

/**
 * Crea un nuevo tipo de documento (Admin)
 */
export function useCrearTipoDocumento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CrearTipoDocumentoRequest) => documentosService.crearTipo(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: documentosKeys.tipos() });
        },
    });
}

/**
 * Marca un adjunto como entregado físicamente (Admin)
 */
export function useMarcarEntregaFisica() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (archivoId: number) => documentosService.marcarEntregaFisica(archivoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: documentosKeys.all });
        },
    });
}
