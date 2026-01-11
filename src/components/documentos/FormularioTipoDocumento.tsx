/**
 * FormularioTipoDocumento Component
 *
 * Modal para crear/editar tipos de documento.
 * Permite configurar datos generales, campos y adjuntos.
 */

import { useState } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  FileText,
  Settings,
  Paperclip,
} from 'lucide-react';
import { useActualizarTipoDocumento, useCrearTipoDocumento } from '../../hooks/useDocumentos';
import type {
  TipoDocumento,
  AudienciaDocumento,
  TipoCampo,
  CampoRequest,
  AdjuntoRequest,
} from '../../api/schemas/documentos';

interface FormularioTipoDocumentoProps {
  tipoDocumento?: TipoDocumento; // Si es undefined, es creación
  onClose: () => void;
  onSuccess?: () => void;
}

type TabId = 'general' | 'campos' | 'adjuntos';

const TIPOS_CAMPO: { value: TipoCampo; label: string }[] = [
  { value: 'TEXTO', label: 'Texto' },
  { value: 'TEXTAREA', label: 'Texto largo' },
  { value: 'NUMERO', label: 'Número' },
  { value: 'FECHA', label: 'Fecha' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'TELEFONO', label: 'Teléfono' },
  { value: 'SELECCION', label: 'Selección' },
  { value: 'RADIO', label: 'Radio (Sí/No)' },
  { value: 'BOOLEAN', label: 'Checkbox' },
];

const AUDIENCIAS: { value: AudienciaDocumento; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'MENOR_18', label: 'Menores de 18' },
  { value: 'MAYOR_18', label: 'Mayores de 18' },
];

export function FormularioTipoDocumento({
  tipoDocumento,
  onClose,
  onSuccess,
}: FormularioTipoDocumentoProps) {
  const esEdicion = !!tipoDocumento;
  const { actualizarTipoDocumento, cargando: actualizando } = useActualizarTipoDocumento();
  const { crearTipoDocumento, cargando: creando } = useCrearTipoDocumento();
  const guardando = actualizando || creando;

  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario - Datos generales
  const [codigo, setCodigo] = useState(tipoDocumento?.codigo || '');
  const [nombre, setNombre] = useState(tipoDocumento?.nombre || '');
  const [descripcion, setDescripcion] = useState(tipoDocumento?.descripcion || '');
  const [audiencia, setAudiencia] = useState<AudienciaDocumento>(tipoDocumento?.audiencia || 'TODOS');
  const [activo, setActivo] = useState(tipoDocumento?.activo ?? true);
  const [requiereFirma, setRequiereFirma] = useState(tipoDocumento?.requiereFirma ?? false);

  // Estado del formulario - Campos
  const [campos, setCampos] = useState<CampoRequest[]>(() =>
    tipoDocumento?.campos.map((c, i) => ({
      codigo: c.codigo,
      etiqueta: c.etiqueta,
      placeholder: c.placeholder,
      tipoCampo: c.tipoCampo,
      opciones: c.opciones || [],
      seccion: c.seccion,
      obligatorio: c.obligatorio,
      ordenVisualizacion: c.ordenVisualizacion ?? i,
      campoPadreCodigo: c.campoPadreCodigo,
      campoPadreValor: c.campoPadreValor,
    })) || []
  );

  // Estado del formulario - Adjuntos
  const [adjuntos, setAdjuntos] = useState<AdjuntoRequest[]>(() =>
    tipoDocumento?.adjuntosRequeridos.map((a, i) => ({
      codigo: a.codigo,
      nombre: a.nombre,
      descripcion: a.descripcion,
      obligatorio: a.obligatorio,
      requiereEntregaFisica: a.requiereEntregaFisica,
      tiposPermitidos: a.tiposPermitidos,
      maxSizeMB: a.maxSizeMB,
      ordenVisualizacion: a.ordenVisualizacion ?? i,
    })) || []
  );

  const handleGuardar = async () => {
    setError(null);

    // Validación básica
    if (!codigo.trim()) {
      setError('El código es requerido');
      setActiveTab('general');
      return;
    }
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      setActiveTab('general');
      return;
    }

    const request = {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      audiencia,
      activo,
      requiereFirma,
      ordenVisualizacion: tipoDocumento?.ordenVisualizacion ?? 1,
      campos: campos.map((c, i) => ({ ...c, ordenVisualizacion: i })),
      adjuntos: adjuntos.map((a, i) => ({ ...a, ordenVisualizacion: i })),
    };

    try {
      if (esEdicion && tipoDocumento) {
        await actualizarTipoDocumento({ id: tipoDocumento.id, request });
      } else {
        await crearTipoDocumento(request);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error al guardar tipo de documento:', err);
      setError('Error al guardar. Por favor intenta de nuevo.');
    }
  };

  // Funciones para manejar campos
  const agregarCampo = () => {
    const nuevoCodigo = `campo_${Date.now()}`;
    setCampos([
      ...campos,
      {
        codigo: nuevoCodigo,
        etiqueta: 'Nuevo campo',
        tipoCampo: 'TEXTO',
        obligatorio: false,
        ordenVisualizacion: campos.length,
      },
    ]);
  };

  const actualizarCampo = (index: number, updates: Partial<CampoRequest>) => {
    setCampos(campos.map((c, i) => (i === index ? { ...c, ...updates } : c)));
  };

  const eliminarCampo = (index: number) => {
    setCampos(campos.filter((_, i) => i !== index));
  };

  const moverCampo = (index: number, direccion: 'arriba' | 'abajo') => {
    if (direccion === 'arriba' && index === 0) return;
    if (direccion === 'abajo' && index === campos.length - 1) return;

    const nuevosCampos = [...campos];
    const targetIndex = direccion === 'arriba' ? index - 1 : index + 1;
    [nuevosCampos[index], nuevosCampos[targetIndex]] = [nuevosCampos[targetIndex], nuevosCampos[index]];
    setCampos(nuevosCampos);
  };

  // Funciones para manejar adjuntos
  const agregarAdjunto = () => {
    const nuevoCodigo = `adjunto_${Date.now()}`;
    setAdjuntos([
      ...adjuntos,
      {
        codigo: nuevoCodigo,
        nombre: 'Nuevo adjunto',
        obligatorio: true,
        requiereEntregaFisica: false,
        tiposPermitidos: 'image/*,application/pdf',
        maxSizeMB: 10,
        ordenVisualizacion: adjuntos.length,
      },
    ]);
  };

  const actualizarAdjunto = (index: number, updates: Partial<AdjuntoRequest>) => {
    setAdjuntos(adjuntos.map((a, i) => (i === index ? { ...a, ...updates } : a)));
  };

  const eliminarAdjunto = (index: number) => {
    setAdjuntos(adjuntos.filter((_, i) => i !== index));
  };

  // Obtener secciones únicas para selector
  const seccionesUnicas = Array.from(new Set(campos.map((c) => c.seccion).filter(Boolean)));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {esEdicion ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento'}
            </h2>
            {esEdicion && (
              <p className="text-sm text-gray-500">{tipoDocumento.codigo}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-orange-600 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Datos Generales
          </button>
          <button
            onClick={() => setActiveTab('campos')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'campos'
                ? 'text-orange-600 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Campos ({campos.length})
          </button>
          <button
            onClick={() => setActiveTab('adjuntos')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'adjuntos'
                ? 'text-orange-600 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            Adjuntos ({adjuntos.length})
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <TabGeneral
              codigo={codigo}
              setCodigo={setCodigo}
              nombre={nombre}
              setNombre={setNombre}
              descripcion={descripcion}
              setDescripcion={setDescripcion}
              audiencia={audiencia}
              setAudiencia={setAudiencia}
              activo={activo}
              setActivo={setActivo}
              requiereFirma={requiereFirma}
              setRequiereFirma={setRequiereFirma}
              esEdicion={esEdicion}
            />
          )}

          {activeTab === 'campos' && (
            <TabCampos
              campos={campos}
              seccionesUnicas={seccionesUnicas as string[]}
              onAgregar={agregarCampo}
              onActualizar={actualizarCampo}
              onEliminar={eliminarCampo}
              onMover={moverCampo}
            />
          )}

          {activeTab === 'adjuntos' && (
            <TabAdjuntos
              adjuntos={adjuntos}
              onAgregar={agregarAdjunto}
              onActualizar={actualizarAdjunto}
              onEliminar={eliminarAdjunto}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {guardando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {esEdicion ? 'Guardar cambios' : 'Crear tipo de documento'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Tab: Datos Generales
// ============================================

interface TabGeneralProps {
  codigo: string;
  setCodigo: (v: string) => void;
  nombre: string;
  setNombre: (v: string) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
  audiencia: AudienciaDocumento;
  setAudiencia: (v: AudienciaDocumento) => void;
  activo: boolean;
  setActivo: (v: boolean) => void;
  requiereFirma: boolean;
  setRequiereFirma: (v: boolean) => void;
  esEdicion: boolean;
}

function TabGeneral({
  codigo,
  setCodigo,
  nombre,
  setNombre,
  descripcion,
  setDescripcion,
  audiencia,
  setAudiencia,
  activo,
  setActivo,
  requiereFirma,
  setRequiereFirma,
  esEdicion,
}: TabGeneralProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/\s/g, '_'))}
            disabled={esEdicion}
            placeholder="FICHA_MEDICA"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
          {esEdicion && (
            <p className="text-xs text-gray-400 mt-1">El código no se puede modificar</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ficha Médica"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción del documento..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Audiencia
          </label>
          <select
            value={audiencia}
            onChange={(e) => setAudiencia(e.target.value as AudienciaDocumento)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {AUDIENCIAS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">Activo</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={requiereFirma}
              onChange={(e) => setRequiereFirma(e.target.checked)}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">Requiere firma</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Tab: Campos
// ============================================

interface TabCamposProps {
  campos: CampoRequest[];
  seccionesUnicas: string[];
  onAgregar: () => void;
  onActualizar: (index: number, updates: Partial<CampoRequest>) => void;
  onEliminar: (index: number) => void;
  onMover: (index: number, direccion: 'arriba' | 'abajo') => void;
}

function TabCampos({
  campos,
  seccionesUnicas,
  onAgregar,
  onActualizar,
  onEliminar,
  onMover,
}: TabCamposProps) {
  const [campoExpandido, setCampoExpandido] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Define los campos que el usuario debe completar en este documento.
        </p>
        <button
          onClick={onAgregar}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar campo
        </button>
      </div>

      {campos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay campos configurados</p>
          <button
            onClick={onAgregar}
            className="mt-4 text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            Agregar el primer campo
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {campos.map((campo, index) => (
            <CampoEditor
              key={index}
              campo={campo}
              index={index}
              total={campos.length}
              isExpanded={campoExpandido === index}
              onToggle={() => setCampoExpandido(campoExpandido === index ? null : index)}
              seccionesUnicas={seccionesUnicas}
              todosCampos={campos}
              onActualizar={(updates) => onActualizar(index, updates)}
              onEliminar={() => onEliminar(index)}
              onMover={(dir) => onMover(index, dir)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CampoEditorProps {
  campo: CampoRequest;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
  seccionesUnicas: string[];
  todosCampos: CampoRequest[];
  onActualizar: (updates: Partial<CampoRequest>) => void;
  onEliminar: () => void;
  onMover: (direccion: 'arriba' | 'abajo') => void;
}

function CampoEditor({
  campo,
  index,
  total,
  isExpanded,
  onToggle,
  seccionesUnicas,
  todosCampos,
  onActualizar,
  onEliminar,
  onMover,
}: CampoEditorProps) {
  const [nuevaSeccion, setNuevaSeccion] = useState('');

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-gray-50">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onMover('arriba')}
            disabled={index === 0}
            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onMover('abajo')}
            disabled={index === total - 1}
            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-3 text-left"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{campo.etiqueta}</span>
              <span className="text-xs text-gray-400 uppercase">{campo.tipoCampo}</span>
              {campo.obligatorio && (
                <span className="w-2 h-2 rounded-full bg-red-500" title="Obligatorio" />
              )}
            </div>
            <div className="text-xs text-gray-500">
              {campo.seccion || 'Sin sección'} • {campo.codigo}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        <button
          onClick={onEliminar}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Eliminar campo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Editor expandido */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Código</label>
              <input
                type="text"
                value={campo.codigo}
                onChange={(e) => onActualizar({ codigo: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Etiqueta</label>
              <input
                type="text"
                value={campo.etiqueta}
                onChange={(e) => onActualizar({ etiqueta: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de campo</label>
              <select
                value={campo.tipoCampo}
                onChange={(e) => onActualizar({ tipoCampo: e.target.value as TipoCampo })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
              >
                {TIPOS_CAMPO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sección</label>
              <div className="flex gap-2">
                <select
                  value={campo.seccion || ''}
                  onChange={(e) => onActualizar({ seccion: e.target.value || null })}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sin sección</option>
                  {seccionesUnicas.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={nuevaSeccion}
                  onChange={(e) => setNuevaSeccion(e.target.value)}
                  onBlur={() => {
                    if (nuevaSeccion.trim()) {
                      onActualizar({ seccion: nuevaSeccion.trim() });
                      setNuevaSeccion('');
                    }
                  }}
                  placeholder="Nueva..."
                  className="w-24 px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Opciones para SELECCION y RADIO */}
          {(campo.tipoCampo === 'SELECCION' || campo.tipoCampo === 'RADIO') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Opciones (una por línea)
              </label>
              <textarea
                value={(campo.opciones || []).join('\n')}
                onChange={(e) => onActualizar({ opciones: e.target.value.split('\n').filter((o) => o.trim()) })}
                rows={3}
                placeholder="Sí&#10;No"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Campo condicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Mostrar si campo igual a... (código del campo padre)
              </label>
              <select
                value={campo.campoPadreCodigo || ''}
                onChange={(e) => onActualizar({ campoPadreCodigo: e.target.value || null })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Siempre visible</option>
                {todosCampos
                  .filter((c) => c.codigo !== campo.codigo)
                  .map((c) => (
                    <option key={c.codigo} value={c.codigo}>
                      {c.etiqueta}
                    </option>
                  ))}
              </select>
            </div>
            {campo.campoPadreCodigo && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Valor requerido</label>
                <input
                  type="text"
                  value={campo.campoPadreValor || ''}
                  onChange={(e) => onActualizar({ campoPadreValor: e.target.value })}
                  placeholder="Sí"
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={campo.obligatorio || false}
                onChange={(e) => onActualizar({ obligatorio: e.target.checked })}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Obligatorio</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Tab: Adjuntos
// ============================================

interface TabAdjuntosProps {
  adjuntos: AdjuntoRequest[];
  onAgregar: () => void;
  onActualizar: (index: number, updates: Partial<AdjuntoRequest>) => void;
  onEliminar: (index: number) => void;
}

function TabAdjuntos({
  adjuntos,
  onAgregar,
  onActualizar,
  onEliminar,
}: TabAdjuntosProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Define los archivos que el usuario debe adjuntar.
        </p>
        <button
          onClick={onAgregar}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar adjunto
        </button>
      </div>

      {adjuntos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay adjuntos requeridos</p>
          <button
            onClick={onAgregar}
            className="mt-4 text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            Agregar el primer adjunto
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {adjuntos.map((adjunto, index) => (
            <AdjuntoEditor
              key={index}
              adjunto={adjunto}
              onActualizar={(updates) => onActualizar(index, updates)}
              onEliminar={() => onEliminar(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AdjuntoEditorProps {
  adjunto: AdjuntoRequest;
  onActualizar: (updates: Partial<AdjuntoRequest>) => void;
  onEliminar: () => void;
}

function AdjuntoEditor({ adjunto, onActualizar, onEliminar }: AdjuntoEditorProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Código</label>
            <input
              type="text"
              value={adjunto.codigo}
              onChange={(e) => onActualizar({ codigo: e.target.value.toUpperCase().replace(/\s/g, '_') })}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
            <input
              type="text"
              value={adjunto.nombre}
              onChange={(e) => onActualizar({ nombre: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <button
          onClick={onEliminar}
          className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Eliminar adjunto"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
        <input
          type="text"
          value={adjunto.descripcion || ''}
          onChange={(e) => onActualizar({ descripcion: e.target.value || null })}
          placeholder="Instrucciones para el usuario..."
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tipos permitidos</label>
          <input
            type="text"
            value={adjunto.tiposPermitidos || ''}
            onChange={(e) => onActualizar({ tiposPermitidos: e.target.value || null })}
            placeholder="image/*,application/pdf"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tamaño máximo (MB)</label>
          <input
            type="number"
            value={adjunto.maxSizeMB || 10}
            onChange={(e) => onActualizar({ maxSizeMB: parseInt(e.target.value) || 10 })}
            min={1}
            max={50}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={adjunto.obligatorio || false}
            onChange={(e) => onActualizar({ obligatorio: e.target.checked })}
            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">Obligatorio</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={adjunto.requiereEntregaFisica || false}
            onChange={(e) => onActualizar({ requiereEntregaFisica: e.target.checked })}
            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">Requiere entrega física</span>
        </label>
      </div>
    </div>
  );
}

export default FormularioTipoDocumento;
