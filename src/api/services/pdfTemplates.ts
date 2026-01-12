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
  }>;
  activo: boolean;
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
      tipo: c.tipo as 'texto' | 'checkbox' | 'fecha',
    })),
  }),
};
