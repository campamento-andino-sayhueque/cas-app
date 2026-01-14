/**
 * Servicio de API para templates PDF
 */

import { client } from '../client';
import type { TemplateConfig } from '../../components/documentos/PdfTemplateEditor';

export interface PdfTemplateResponse {
  id: number;
  codigo: string;
  nombre: string;
  pdfBase64: string;
  pageWidth: number;
  pageHeight: number;
  campos: Array<{
    codigo: string;
    nombre: string;
    x: number;
    y: number;
    fontSize: number;
    tipo: string;
    valorFijo?: string;
  }>;
  activo: boolean;
}

/**
 * Campo disponible para posicionar en templates PDF
 */
export interface CampoDisponible {
  codigo: string;
  nombre: string;
  tipo: 'texto' | 'checkbox' | 'fecha' | 'marker' | 'fijo';
  categoria: 'SISTEMA' | 'MARCADOR' | 'FIJO' | 'FORMULARIO';
}

export const pdfTemplatesService = {
  /**
   * Lista todos los templates activos
   */
  listar: async (): Promise<PdfTemplateResponse[]> => {
    const response = await client.get('/pdf-templates');
    return response.data;
  },

  /**
   * Obtiene los campos disponibles para templates (datos del usuario + marcadores)
   */
  getCamposDisponibles: async (): Promise<CampoDisponible[]> => {
    const response = await client.get('/pdf-templates/campos-disponibles');
    return response.data;
  },

  /**
   * Obtiene los campos disponibles para un TipoDocumento específico
   * Incluye campos del sistema + marcadores + campos del formulario
   */
  getCamposDisponiblesPorTipo: async (tipoDocumentoId: number): Promise<CampoDisponible[]> => {
    const response = await client.get(`/pdf-templates/campos-disponibles/${tipoDocumentoId}`);
    return response.data;
  },

  /**
   * Obtiene un template por código
   */
  getByCodigo: async (codigo: string): Promise<PdfTemplateResponse | null> => {
    try {
      const response = await client.get(`/pdf-templates/${codigo}`);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Guarda un template
   */
  guardar: async (config: TemplateConfig): Promise<PdfTemplateResponse> => {
    const payload = {
      codigo: config.codigo,
      nombre: config.nombre,
      pdfBase64: config.pdfBase64,
      pageWidth: config.pageWidth,
      pageHeight: config.pageHeight,
      campos: config.campos.map(c => ({
        codigo: c.codigo,
        nombre: c.nombre,
        x: c.x,
        y: c.y,
        fontSize: c.fontSize,
        tipo: c.tipo,
        valorFijo: c.valorFijo,
      })),
    };
    const response = await client.post('/pdf-templates', payload);
    return response.data;
  },

  /**
   * Elimina un template
   */
  eliminar: async (codigo: string): Promise<void> => {
    await client.delete(`/pdf-templates/${codigo}`);
  },

  /**
   * Obtiene el TipoDocumento asociado a un template
   */
  getTipoDocumentoAsociado: async (templateCodigo: string): Promise<{
    tieneAsociado: boolean;
    tipoDocumentoId?: number;
    tipoDocumentoNombre?: string;
    tipoDocumentoCodigo?: string;
  } | null> => {
    try {
      const response = await client.get(`/pdf-templates/${templateCodigo}/tipo-documento`);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Convierte respuesta de API a TemplateConfig
   */
  toTemplateConfig: (response: PdfTemplateResponse): TemplateConfig => ({
    codigo: response.codigo,
    nombre: response.nombre,
    pdfBase64: response.pdfBase64,
    pageWidth: response.pageWidth,
    pageHeight: response.pageHeight,
    campos: response.campos.map(c => ({
      codigo: c.codigo,
      nombre: c.nombre,
      x: c.x,
      y: c.y,
      fontSize: c.fontSize,
      tipo: c.tipo as 'texto' | 'checkbox' | 'fecha' | 'marker' | 'fijo',
      valorFijo: c.valorFijo,
    })),
  }),
};
