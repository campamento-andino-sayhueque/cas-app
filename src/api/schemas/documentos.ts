/**
 * Schemas Valibot para el módulo de Documentos
 */

import * as v from 'valibot';

// ============================================
// Enums
// ============================================

export const TipoCampoSchema = v.picklist([
    'TEXTO',
    'NUMERO',
    'FECHA',
    'BOOLEAN',
    'SELECCION',
    'TEXTAREA',
    'EMAIL',
    'TELEFONO'
]);
export type TipoCampo = v.InferOutput<typeof TipoCampoSchema>;

export const EstadoDocumentoSchema = v.picklist([
    'BORRADOR',
    'PENDIENTE_ADJUNTOS',
    'COMPLETO',
    'PENDIENTE_FISICO'
]);
export type EstadoDocumento = v.InferOutput<typeof EstadoDocumentoSchema>;

export const AudienciaDocumentoSchema = v.picklist([
    'MENOR_18',
    'MAYOR_18',
    'TODOS'
]);
export type AudienciaDocumento = v.InferOutput<typeof AudienciaDocumentoSchema>;

// ============================================
// DTOs
// ============================================

export const CampoFormularioSchema = v.object({
    id: v.number(),
    codigo: v.string(),
    etiqueta: v.string(),
    placeholder: v.optional(v.nullable(v.string())),
    tipoCampo: TipoCampoSchema,
    opciones: v.optional(v.nullable(v.array(v.string()))),
    seccion: v.optional(v.nullable(v.string())),
    obligatorio: v.boolean(),
    ordenVisualizacion: v.number(),
    campoPadreCodigo: v.optional(v.nullable(v.string())),
    campoPadreValor: v.optional(v.nullable(v.string()))
});
export type CampoFormulario = v.InferOutput<typeof CampoFormularioSchema>;

export const AdjuntoRequeridoSchema = v.object({
    id: v.number(),
    codigo: v.string(),
    nombre: v.string(),
    descripcion: v.optional(v.nullable(v.string())),
    obligatorio: v.boolean(),
    requiereEntregaFisica: v.boolean(),
    tiposPermitidos: v.optional(v.nullable(v.string())),
    maxSizeMB: v.optional(v.nullable(v.number())),
    ordenVisualizacion: v.number()
});
export type AdjuntoRequerido = v.InferOutput<typeof AdjuntoRequeridoSchema>;

export const TipoDocumentoSchema = v.object({
    id: v.number(),
    codigo: v.string(),
    nombre: v.string(),
    descripcion: v.optional(v.nullable(v.string())),
    audiencia: AudienciaDocumentoSchema,
    activo: v.boolean(),
    requiereFirma: v.boolean(),
    ordenVisualizacion: v.number(),
    campos: v.array(CampoFormularioSchema),
    adjuntosRequeridos: v.array(AdjuntoRequeridoSchema)
});
export type TipoDocumento = v.InferOutput<typeof TipoDocumentoSchema>;

export const ArchivoAdjuntoSchema = v.object({
    id: v.number(),
    adjuntoCodigo: v.string(),
    adjuntoNombre: v.string(),
    nombreArchivo: v.string(),
    mimeType: v.optional(v.nullable(v.string())),
    tamanoBytes: v.optional(v.nullable(v.number())),
    requiereEntregaFisica: v.boolean(),
    entregadoFisicamente: v.boolean(),
    fechaSubida: v.string(),
    fechaEntregaFisica: v.optional(v.nullable(v.string()))
});
export type ArchivoAdjunto = v.InferOutput<typeof ArchivoAdjuntoSchema>;

export const DocumentoCompletadoSchema = v.object({
    id: v.optional(v.nullable(v.number())),
    tipoDocumentoId: v.number(),
    tipoDocumentoCodigo: v.string(),
    tipoDocumentoNombre: v.string(),
    usuarioId: v.number(),
    usuarioNombre: v.optional(v.nullable(v.string())),
    familiaId: v.optional(v.nullable(v.number())),
    completadoPorId: v.optional(v.nullable(v.number())),
    completadoPorNombre: v.optional(v.nullable(v.string())),
    estado: v.optional(v.nullable(EstadoDocumentoSchema)),
    fechaCompletado: v.optional(v.nullable(v.string())),
    fechaActualizacion: v.optional(v.nullable(v.string())),
    respuestas: v.record(v.string(), v.string()),
    archivosAdjuntos: v.array(ArchivoAdjuntoSchema),
    camposCompletados: v.number(),
    camposObligatorios: v.number(),
    adjuntosSubidos: v.number(),
    adjuntosRequeridos: v.number(),
    adjuntosPendientesFisicos: v.optional(v.nullable(v.number()))
});
export type DocumentoCompletado = v.InferOutput<typeof DocumentoCompletadoSchema>;

export const ResumenDocumentosMiembroSchema = v.object({
    usuarioId: v.number(),
    usuarioNombre: v.optional(v.nullable(v.string())),
    usuarioEmail: v.optional(v.nullable(v.string())),
    totalDocumentos: v.number(),
    documentosCompletos: v.number(),
    documentosPendientes: v.number(),
    documentosSinIniciar: v.number(),
    adjuntosPendientesFisicos: v.number()
});
export type ResumenDocumentosMiembro = v.InferOutput<typeof ResumenDocumentosMiembroSchema>;

// ============================================
// Requests
// ============================================

export interface GuardarDocumentoRequest {
    tipoDocumentoId: number;
    usuarioId: number;
    respuestas: Record<string, string>;
    finalizar: boolean;
}

export interface CrearTipoDocumentoRequest {
    codigo: string;
    nombre: string;
    descripcion?: string;
    audiencia: AudienciaDocumento;
    activo?: boolean;
    requiereFirma?: boolean;
    ordenVisualizacion?: number;
    campos?: CampoRequest[];
    adjuntos?: AdjuntoRequest[];
}

export interface CampoRequest {
    codigo: string;
    etiqueta: string;
    placeholder?: string;
    tipoCampo: TipoCampo;
    opciones?: string[];
    seccion?: string;
    obligatorio?: boolean;
    ordenVisualizacion?: number;
    campoPadreCodigo?: string;
    campoPadreValor?: string;
}

export interface AdjuntoRequest {
    codigo: string;
    nombre: string;
    descripcion?: string;
    obligatorio?: boolean;
    requiereEntregaFisica?: boolean;
    tiposPermitidos?: string;
    maxSizeMB?: number;
    ordenVisualizacion?: number;
}
