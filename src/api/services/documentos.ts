/**
 * Servicio de Documentos
 * 
 * Gestiona tipos de documento, formularios dinámicos y archivos adjuntos.
 */

import { parse, array } from 'valibot';
import { client } from '../client';
import {
    TipoDocumentoSchema,
    DocumentoCompletadoSchema,
    ResumenDocumentosMiembroSchema,
    ArchivoAdjuntoSchema,
    type TipoDocumento,
    type DocumentoCompletado,
    type ResumenDocumentosMiembro,
    type ArchivoAdjunto,
    type GuardarDocumentoRequest,
    type CrearTipoDocumentoRequest
} from '../schemas/documentos';

const TiposDocumentoSchema = array(TipoDocumentoSchema);
const DocumentosSchema = array(DocumentoCompletadoSchema);
const ResumenesSchema = array(ResumenDocumentosMiembroSchema);

export const documentosService = {

    // ============================================
    // Tipos de Documento (Configuración)
    // ============================================

    /**
     * Lista todos los tipos de documento activos
     */
    listarTipos: async (): Promise<TipoDocumento[]> => {
        const response = await client.get('/tipos-documento');
        if (Array.isArray(response.data)) {
            return parse(TiposDocumentoSchema, response.data);
        }
        return [];
    },

    /**
     * Obtiene un tipo de documento por ID
     */
    obtenerTipo: async (id: number): Promise<TipoDocumento> => {
        const response = await client.get(`/tipos-documento/${id}`);
        return parse(TipoDocumentoSchema, response.data);
    },

    /**
     * Obtiene un tipo de documento por código
     */
    obtenerTipoPorCodigo: async (codigo: string): Promise<TipoDocumento> => {
        const response = await client.get(`/tipos-documento/codigo/${codigo}`);
        return parse(TipoDocumentoSchema, response.data);
    },

    /**
     * Crea un nuevo tipo de documento (Admin)
     */
    crearTipo: async (data: CrearTipoDocumentoRequest): Promise<TipoDocumento> => {
        const response = await client.post('/tipos-documento', data);
        return parse(TipoDocumentoSchema, response.data);
    },

    /**
     * Actualiza un tipo de documento (Admin)
     */
    actualizarTipo: async (id: number, data: CrearTipoDocumentoRequest): Promise<TipoDocumento> => {
        const response = await client.put(`/tipos-documento/${id}`, data);
        return parse(TipoDocumentoSchema, response.data);
    },

    /**
     * Desactiva un tipo de documento (Admin)
     */
    desactivarTipo: async (id: number): Promise<void> => {
        await client.delete(`/tipos-documento/${id}`);
    },

    // ============================================
    // Documentos por Familia
    // ============================================

    /**
     * Obtiene el resumen de documentos para todos los miembros de una familia
     */
    getResumenFamilia: async (familiaId: number): Promise<ResumenDocumentosMiembro[]> => {
        const response = await client.get(`/documentos/familia/${familiaId}`);
        if (Array.isArray(response.data)) {
            return parse(ResumenesSchema, response.data);
        }
        return [];
    },

    /**
     * Obtiene todos los documentos de un usuario
     */
    getDocumentosUsuario: async (usuarioId: number): Promise<DocumentoCompletado[]> => {
        const response = await client.get(`/documentos/usuario/${usuarioId}`);
        if (Array.isArray(response.data)) {
            return parse(DocumentosSchema, response.data);
        }
        return [];
    },

    /**
     * Obtiene un documento específico (o vacío si no existe)
     */
    getDocumento: async (tipoDocumentoId: number, usuarioId: number): Promise<DocumentoCompletado> => {
        const response = await client.get(`/documentos/tipo/${tipoDocumentoId}/usuario/${usuarioId}`);
        return parse(DocumentoCompletadoSchema, response.data);
    },

    /**
     * Guarda o actualiza un documento
     */
    guardarDocumento: async (data: GuardarDocumentoRequest): Promise<DocumentoCompletado> => {
        const response = await client.post('/documentos', data);
        return parse(DocumentoCompletadoSchema, response.data);
    },

    /**
     * Sube un archivo adjunto
     */
    subirAdjunto: async (
        documentoId: number,
        adjuntoRequeridoId: number,
        file: File
    ): Promise<ArchivoAdjunto> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await client.post(
            `/documentos/${documentoId}/adjuntos/${adjuntoRequeridoId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return parse(ArchivoAdjuntoSchema, response.data);
    },

    /**
     * Marca un adjunto como entregado físicamente (Admin)
     */
    marcarEntregaFisica: async (archivoId: number): Promise<void> => {
        await client.post(`/documentos/adjuntos/${archivoId}/entrega-fisica`);
    }
};
