/**
 * PdfTemplateEditor Component
 * 
 * Editor visual para posicionar campos sobre un template PDF.
 * Permite subir un PDF, renderizarlo, y hacer click para definir coordenadas de campos.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Save, Trash2, Type } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configurar worker de PDF.js para Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface CampoTemplate {
  codigo: string;
  nombre: string;
  x: number;
  y: number;
  fontSize: number;
  tipo: 'texto' | 'checkbox' | 'fecha';
}

export interface TemplateConfig {
  codigo: string;
  nombre: string;
  pdfBase64: string;
  pageWidth: number;
  pageHeight: number;
  campos: CampoTemplate[];
}

interface PdfTemplateEditorProps {
  onSave: (config: TemplateConfig) => void;
  initialConfig?: TemplateConfig;
  camposDisponibles: Array<{ codigo: string; nombre: string; tipo: 'texto' | 'checkbox' | 'fecha' }>;
}

export function PdfTemplateEditor({ onSave, initialConfig, camposDisponibles }: PdfTemplateEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>(initialConfig?.pdfBase64 || '');
  const [pageInfo, setPageInfo] = useState({ width: 0, height: 0 });
  const [campos, setCampos] = useState<CampoTemplate[]>(initialConfig?.campos || []);
  const [campoSeleccionado, setCampoSeleccionado] = useState<string | null>(null);
  const [nombreTemplate, setNombreTemplate] = useState(initialConfig?.nombre || '');
  const [codigoTemplate, setCodigoTemplate] = useState(initialConfig?.codigo || '');
  const [scale, setScale] = useState(1);

  // Cargar PDF cuando cambia pdfBase64
  useEffect(() => {
    if (!pdfBase64) return;

    const loadPdf = async () => {
      try {
        const pdfData = atob(pdfBase64.split(',')[1] || pdfBase64);
        const pdfArray = new Uint8Array(pdfData.length);
        for (let i = 0; i < pdfData.length; i++) {
          pdfArray[i] = pdfData.charCodeAt(i);
        }
        
        const doc = await pdfjsLib.getDocument({ data: pdfArray }).promise;
        setPdfDoc(doc);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [pdfBase64]);

  // Renderizar página del PDF
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d')!;
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPageInfo({ width: viewport.width / scale, height: viewport.height / scale });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (page.render as any)({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Dibujar campos posicionados
      drawCampos(context);
    };

    renderPage();
  }, [pdfDoc, scale, campos]);

  const drawCampos = (context: CanvasRenderingContext2D) => {
    campos.forEach(campo => {
      const x = campo.x * scale;
      const y = (pageInfo.height - campo.y) * scale; // PDF coords are from bottom
      
      // Dibujar marcador
      context.fillStyle = campo.codigo === campoSeleccionado ? '#f97316' : '#3b82f6';
      context.fillRect(x - 2, y - 2, 4, 4);
      
      // Dibujar nombre del campo
      context.font = '10px Arial';
      context.fillStyle = '#000';
      context.fillText(campo.nombre.substring(0, 15), x + 5, y + 3);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPdfBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!campoSeleccionado || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = pageInfo.height - (e.clientY - rect.top) / scale; // Convert to PDF coords

    const campoInfo = camposDisponibles.find(c => c.codigo === campoSeleccionado);
    if (!campoInfo) return;

    setCampos(prev => {
      // Actualizar si ya existe, o agregar nuevo
      const existing = prev.find(c => c.codigo === campoSeleccionado);
      if (existing) {
        return prev.map(c => c.codigo === campoSeleccionado ? { ...c, x, y } : c);
      }
      return [...prev, {
        codigo: campoSeleccionado,
        nombre: campoInfo.nombre,
        x,
        y,
        fontSize: 10,
        tipo: campoInfo.tipo
      }];
    });
  }, [campoSeleccionado, scale, pageInfo.height, camposDisponibles]);

  const handleRemoveCampo = (codigo: string) => {
    setCampos(prev => prev.filter(c => c.codigo !== codigo));
  };

  const handleSave = () => {
    if (!codigoTemplate || !nombreTemplate || !pdfBase64) {
      alert('Complete todos los campos requeridos');
      return;
    }

    onSave({
      codigo: codigoTemplate,
      nombre: nombreTemplate,
      pdfBase64,
      pageWidth: pageInfo.width,
      pageHeight: pageInfo.height,
      campos
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Código (ej: AUTORIZACION_TRANSPORTE)"
          value={codigoTemplate}
          onChange={e => setCodigoTemplate(e.target.value.toUpperCase().replace(/\s/g, '_'))}
          className="px-3 py-2 border rounded-lg text-sm w-64"
        />
        <input
          type="text"
          placeholder="Nombre del template"
          value={nombreTemplate}
          onChange={e => setNombreTemplate(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm flex-1"
        />
        
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
          <Upload className="w-4 h-4" />
          <span className="text-sm">Subir PDF</span>
          <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
        </label>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Save className="w-4 h-4" />
          Guardar
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Campos disponibles */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Campos disponibles</h3>
          <p className="text-xs text-gray-500 mb-3">Seleccioná un campo y hacé click en el PDF para posicionarlo</p>
          
          <div className="space-y-1">
            {camposDisponibles.map(campo => {
              const posicionado = campos.find(c => c.codigo === campo.codigo);
              return (
                <div
                  key={campo.codigo}
                  onClick={() => setCampoSeleccionado(campo.codigo)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm ${
                    campoSeleccionado === campo.codigo
                      ? 'bg-orange-100 border border-orange-300'
                      : posicionado
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Type className="w-3 h-3 text-gray-400" />
                    <span>{campo.nombre}</span>
                  </div>
                  {posicionado && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveCampo(campo.codigo); }}
                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Campos posicionados */}
          {campos.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Posiciones</h3>
              <div className="text-xs space-y-1 text-gray-600">
                {campos.map(c => (
                  <div key={c.codigo} className="flex justify-between">
                    <span>{c.codigo}</span>
                    <span>({Math.round(c.x)}, {Math.round(c.y)})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Canvas - PDF Preview */}
        <div ref={containerRef} className="flex-1 overflow-auto p-4 bg-gray-200">
          {!pdfBase64 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Subí un PDF template para comenzar</p>
              </div>
            </div>
          ) : (
            <div className="inline-block shadow-lg">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`bg-white ${campoSeleccionado ? 'cursor-crosshair' : 'cursor-default'}`}
              />
            </div>
          )}
        </div>

        {/* Zoom controls */}
        {pdfBase64 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow p-2">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="px-2 py-1 hover:bg-gray-100 rounded">-</button>
            <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(2, s + 0.25))} className="px-2 py-1 hover:bg-gray-100 rounded">+</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfTemplateEditor;
