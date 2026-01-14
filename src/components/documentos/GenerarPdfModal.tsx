/**
 * GenerarPdfModal Component
 * 
 * Modal para generar PDFs usando templates asociados a tipos de documento.
 * Muestra tipos de documento con template y permite generar PDF individual o masivo.
 */

import { useState, useEffect } from 'react';
import { X, FileDown, Loader2, FilePen, Users } from 'lucide-react';
import { useTiposDocumento } from '../../hooks/useDocumentos';
import { pdfTemplatesService, type PdfTemplateResponse } from '../../api/services/pdfTemplates';
import { documentosService } from '../../api/services/documentos';
import { descargarPdfDesdeTemplate, descargarPdfsMasivos, type DatosCampo } from './PdfTemplateRenderer';
import type { TemplateConfig } from './PdfTemplateEditor';
import type { TipoDocumento } from '../../api/schemas/documentos';

interface UsuarioDatos {
  id: number;
  nombreMostrar: string;
  dni?: string | null;
  fechaNacimiento?: string | null;
  localidad?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email: string;
}

interface GenerarPdfModalProps {
  /** Usuario para generación individual */
  usuario?: UsuarioDatos;
  /** Múltiples usuarios para generación masiva */
  usuarios?: UsuarioDatos[];
  onClose: () => void;
}

export function GenerarPdfModal({ usuario, usuarios, onClose }: GenerarPdfModalProps) {
  const esMasivo = !usuario && usuarios && usuarios.length > 0;
  const { tipos } = useTiposDocumento();
  
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoDocumento | null>(null);
  const [template, setTemplate] = useState<PdfTemplateResponse | null>(null);
  const [cargandoTemplate, setCargandoTemplate] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtrar solo tipos con template
  const tiposConTemplate = tipos?.filter((t: TipoDocumento) => t.pdfTemplateId) || [];

  // Cargar template cuando se selecciona un tipo
  useEffect(() => {
    if (!tipoSeleccionado?.pdfTemplateCodigo) {
      setTemplate(null);
      return;
    }

    const cargarTemplate = async () => {
      setCargandoTemplate(true);
      setError(null);
      try {
        const t = await pdfTemplatesService.getByCodigo(tipoSeleccionado.pdfTemplateCodigo!);
        setTemplate(t);
      } catch (err) {
        console.error('Error cargando template:', err);
        setError('Error al cargar el template');
      } finally {
        setCargandoTemplate(false);
      }
    };

    cargarTemplate();
  }, [tipoSeleccionado]);

  // Convertir usuario a datos para el template
  const usuarioToDatos = (u: UsuarioDatos): DatosCampo => ({
    usuario_dni: u.dni || '',
    usuario_nombre: u.nombreMostrar || '',
    usuario_fecha_nacimiento: u.fechaNacimiento || '',
    usuario_localidad: u.localidad || '',
    usuario_direccion: u.direccion || '',
    usuario_telefono: u.telefono || '',
    usuario_email: u.email || '',
  });

  // Convertir respuesta API a TemplateConfig
  const toTemplateConfig = (t: PdfTemplateResponse): TemplateConfig => ({
    codigo: t.codigo,
    nombre: t.nombre,
    pdfBase64: t.pdfBase64,
    pageWidth: t.pageWidth,
    pageHeight: t.pageHeight,
    campos: t.campos.map(c => ({
      codigo: c.codigo,
      nombre: c.nombre,
      x: c.x,
      y: c.y,
      fontSize: c.fontSize,
      tipo: c.tipo as 'texto' | 'checkbox' | 'fecha' | 'marker',
    })),
  });

  const handleGenerar = async () => {
    if (!template || !tipoSeleccionado) return;

    setGenerando(true);
    setError(null);

    try {
      if (esMasivo && usuarios) {
        // Generar PDFs masivos
        const templateConfig = toTemplateConfig(template);
        const datosMultiples = usuarios.map(usuarioToDatos);
        const filename = `${tipoSeleccionado?.nombre || 'documentos'}_masivo.pdf`;
        await descargarPdfsMasivos(templateConfig, datosMultiples, filename);
      } else if (usuario) {
        // Generar PDF individual usando endpoint que incluye respuestas del formulario
        try {
          const pdfData = await documentosService.getPdfData(tipoSeleccionado.id, usuario.id);
          
          // Construir TemplateConfig desde la respuesta
          const templateConfig: TemplateConfig = {
            codigo: pdfData.template.codigo,
            nombre: pdfData.template.nombre,
            pdfBase64: pdfData.template.pdfBase64,
            pageWidth: pdfData.template.pageWidth,
            pageHeight: pdfData.template.pageHeight,
            campos: pdfData.template.campos.map(c => ({
              codigo: c.codigo,
              nombre: c.nombre,
              x: c.x,
              y: c.y,
              fontSize: c.fontSize,
              tipo: c.tipo as 'texto' | 'checkbox' | 'fecha' | 'marker' | 'fijo',
              valorFijo: c.valorFijo,
            })),
          };
          
          const filename = `${tipoSeleccionado.nombre}_${pdfData.nombreUsuario.replace(/\s/g, '_')}.pdf`;
          await descargarPdfDesdeTemplate(templateConfig, pdfData.datos as DatosCampo, filename);
        } catch (pdfErr) {
          console.error('Error obteniendo datos PDF:', pdfErr);
          // Fallback: usar datos básicos del usuario sin respuestas del formulario
          const templateConfig = toTemplateConfig(template);
          const datos = usuarioToDatos(usuario);
          const filename = `${tipoSeleccionado.nombre}_${usuario.nombreMostrar.replace(/\s/g, '_')}.pdf`;
          await descargarPdfDesdeTemplate(templateConfig, datos, filename);
        }
      }

      onClose();
    } catch (err) {
      console.error('Error generando PDF:', err);
      setError('Error al generar el PDF');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FilePen className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">
              {esMasivo ? 'Generar PDFs Masivo' : 'Generar PDF'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Info del usuario/s */}
          <div className="bg-gray-50 rounded-lg p-3">
            {esMasivo ? (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Users className="w-4 h-4" />
                <span>{usuarios?.length} usuarios seleccionados</span>
              </div>
            ) : usuario && (
              <div>
                <div className="font-medium text-gray-900">{usuario.nombreMostrar}</div>
                <div className="text-sm text-gray-500">{usuario.email}</div>
              </div>
            )}
          </div>

          {/* Selector de tipo de documento */}
          {tiposConTemplate.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>No hay tipos de documento con template PDF asociado.</p>
              <p className="text-sm mt-1">Primero asociá un template desde Configuración.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de documento
              </label>
              <select
                value={tipoSeleccionado?.id || ''}
                onChange={(e) => {
                  const tipo = tiposConTemplate.find(t => t.id === Number(e.target.value));
                  setTipoSeleccionado(tipo || null);
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Seleccionar documento...</option>
                {tiposConTemplate.map((t: TipoDocumento) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Estado del template */}
          {cargandoTemplate && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando template...
            </div>
          )}

          {template && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">
              ✓ Template "{template.nombre}" listo para generar
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerar}
            disabled={!template || generando}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {generando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {esMasivo ? 'Generar todos' : 'Generar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerarPdfModal;
