/**
 * PdfTemplateRenderer Component
 * 
 * Genera un PDF llenando un template con datos usando las coordenadas configuradas.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { TemplateConfig } from './PdfTemplateEditor';

export interface DatosCampo {
  [codigo: string]: string | boolean;
}

/**
 * Genera un PDF llenando el template con los datos proporcionados
 */
export async function generarPdfDesdeTemplate(
  template: TemplateConfig,
  datos: DatosCampo
): Promise<Uint8Array> {
  // Decodificar el PDF base64
  const pdfBase64Clean = template.pdfBase64.includes(',') 
    ? template.pdfBase64.split(',')[1] 
    : template.pdfBase64;
  const pdfBytes = Uint8Array.from(atob(pdfBase64Clean), c => c.charCodeAt(0));
  
  // Cargar el PDF
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  
  // Cargar fuente
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Escribir cada campo
  for (const campo of template.campos) {
    let texto: string | null = null;

    if (campo.tipo === 'marker') {
      // Marcadores siempre se dibujan (usando X para ambos, la diferencia es visual en el editor)
      texto = 'X';
    } else if (campo.tipo === 'fijo' || campo.valorFijo) {
      // Campos con valor fijo
      texto = campo.valorFijo || '';
    } else if (campo.tipo === 'checkbox') {
      // Para checkboxes, dibujar una X si es true
      const valor = datos[campo.codigo];
      if (valor === true || valor === 'true' || valor === 'Sí') {
        texto = 'X';
      }
    } else {
      // Texto normal desde datos
      const valor = datos[campo.codigo];
      if (valor !== undefined && valor !== null) {
        texto = String(valor);
      }
    }

    if (texto) {
      firstPage.drawText(texto, {
        x: campo.x,
        y: campo.y,
        size: campo.fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }
  
  // Serializar PDF
  return await pdfDoc.save();
}

/**
 * Genera y descarga un PDF
 */
export async function descargarPdfDesdeTemplate(
  template: TemplateConfig,
  datos: DatosCampo,
  filename: string
): Promise<void> {
  const pdfBytes = await generarPdfDesdeTemplate(template, datos);
  
  // Crear blob y descargar
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Genera múltiples PDFs concatenados en uno solo
 */
export async function generarPdfsMasivos(
  template: TemplateConfig,
  datosMultiples: DatosCampo[]
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  for (const datos of datosMultiples) {
    const pdfBytes = await generarPdfDesdeTemplate(template, datos);
    const docToMerge = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(docToMerge, docToMerge.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
}

/**
 * Genera y descarga múltiples PDFs concatenados
 */
export async function descargarPdfsMasivos(
  template: TemplateConfig,
  datosMultiples: DatosCampo[],
  filename: string
): Promise<void> {
  const pdfBytes = await generarPdfsMasivos(template, datosMultiples);
  
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}
