/**
 * Template Editor Page
 * 
 * Página de administración para crear y editar templates de PDF.
 * Accesible solo para ADMIN/SECRETARIO.
 */

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PdfTemplateEditor, type TemplateConfig } from '../components/documentos/PdfTemplateEditor';
import { pdfTemplatesService } from '../api/services/pdfTemplates';

// Campos disponibles para la autorización de transporte
const camposAutorizacionTransporte = [
  { codigo: 'tipo_representante', nombre: 'Tipo Representante', tipo: 'texto' as const },
  { codigo: 'nombre_autorizante', nombre: 'Nombre Autorizante', tipo: 'texto' as const },
  { codigo: 'dni_autorizante', nombre: 'DNI Autorizante', tipo: 'texto' as const },
  { codigo: 'nombre_menor', nombre: 'Nombre Menor', tipo: 'texto' as const },
  { codigo: 'dni_menor', nombre: 'DNI Menor', tipo: 'texto' as const },
  { codigo: 'localidad_origen', nombre: 'Localidad Origen', tipo: 'texto' as const },
  { codigo: 'localidad_destino', nombre: 'Localidad Destino', tipo: 'texto' as const },
  { codigo: 'empresa', nombre: 'Empresa Transporte', tipo: 'texto' as const },
  // Checkboxes para tipo de acompañamiento
  { codigo: 'menor_6_acompanado', nombre: 'Menor 6 años - Acompañado', tipo: 'checkbox' as const },
  { codigo: 'entre_6_12_acompanado', nombre: '6-12 años - Acompañado', tipo: 'checkbox' as const },
  { codigo: 'entre_6_12_servicio', nombre: '6-12 años - Servicio Menor', tipo: 'checkbox' as const },
  { codigo: 'entre_13_17_acompanado', nombre: '13-17 años - Acompañado', tipo: 'checkbox' as const },
  { codigo: 'entre_13_17_servicio', nombre: '13-17 años - Servicio Menor', tipo: 'checkbox' as const },
  { codigo: 'entre_13_17_solo', nombre: '13-17 años - Sin acompañante', tipo: 'checkbox' as const },
  // Datos acompañante
  { codigo: 'nombre_acompanante', nombre: 'Nombre Acompañante', tipo: 'texto' as const },
  { codigo: 'dni_acompanante', nombre: 'DNI Acompañante', tipo: 'texto' as const },
  // Periodicidad
  { codigo: 'unica_vez', nombre: 'Por única vez', tipo: 'checkbox' as const },
  { codigo: 'habitual', nombre: 'Habitual', tipo: 'checkbox' as const },
  { codigo: 'semanal', nombre: 'Semanal', tipo: 'checkbox' as const },
  { codigo: 'mensual', nombre: 'Mensual', tipo: 'checkbox' as const },
  { codigo: 'anual', nombre: 'Anual', tipo: 'checkbox' as const },
  // Motivo
  { codigo: 'motivo_laboral', nombre: 'Motivo Laboral', tipo: 'checkbox' as const },
  { codigo: 'motivo_educativo', nombre: 'Motivo Educativo', tipo: 'checkbox' as const },
  { codigo: 'motivo_salud', nombre: 'Motivo Salud', tipo: 'checkbox' as const },
  { codigo: 'motivo_otros', nombre: 'Motivo Otros', tipo: 'checkbox' as const },
  // Fechas
  { codigo: 'fecha_salida', nombre: 'Fecha Salida', tipo: 'fecha' as const },
  { codigo: 'fecha_regreso', nombre: 'Fecha Regreso', tipo: 'fecha' as const },
];

export const Route = createFileRoute('/_auth/template-editor')({
  component: TemplateEditorPage,
});

function TemplateEditorPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);


  const handleSave = async (config: TemplateConfig) => {

    
    try {
      await pdfTemplatesService.guardar(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      console.log('Template guardado en backend:', config.codigo);
    } catch (err) {
      console.error('Error guardando template:', err);

    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center gap-4">
        <button
          onClick={() => navigate({ to: '/documentos' })}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold">Editor de Templates PDF</h1>
          <p className="text-sm text-white/80">Posicioná los campos sobre el PDF template</p>
        </div>
        {saved && (
          <div className="ml-auto bg-green-500 px-4 py-2 rounded-lg text-sm">
            ✓ Template guardado
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <PdfTemplateEditor
          onSave={handleSave}
          camposDisponibles={camposAutorizacionTransporte}
        />
      </div>
    </div>
  );
}
