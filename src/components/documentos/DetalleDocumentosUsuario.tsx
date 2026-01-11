/**
 * DetalleDocumentosUsuario Component
 *
 * Modal para que dirigentes/secretario vean los documentos de un usuario específico.
 * Muestra lista de documentos con estados, respuestas y adjuntos.
 */

import { useState } from 'react';
import { X, FileText, Check, Clock, AlertCircle, Upload, ChevronDown, ChevronUp, Eye, Loader2 } from 'lucide-react';
import { useDetalleDocumentosUsuario, useTipoDocumento, useMarcarEntregaFisica } from '../../hooks/useDocumentos';
import { ESTADO_CONFIG, type DocumentoCompletado, type ArchivoAdjunto } from '../../api/schemas/documentos';

interface DetalleDocumentosUsuarioProps {
  usuarioId: number;
  usuarioNombre?: string;
  onClose: () => void;
}

export function DetalleDocumentosUsuario({
  usuarioId,
  usuarioNombre,
  onClose,
}: DetalleDocumentosUsuarioProps) {
  const { documentos, cargando, error } = useDetalleDocumentosUsuario(usuarioId);

  if (cargando) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-red-500">
          Error al cargar documentos
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const stats = {
    total: documentos.length,
    completos: documentos.filter(d => d.estado === 'COMPLETO' || d.estado === 'PENDIENTE_FISICO').length,
    pendientes: documentos.filter(d => d.estado === 'BORRADOR' || d.estado === 'PENDIENTE_ADJUNTOS').length,
    sinIniciar: documentos.filter(d => d.estado === null).length,
  };

  const porcentaje = stats.total > 0 ? Math.round((stats.completos / stats.total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Documentos de {usuarioNombre || `Usuario #${usuarioId}`}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>{stats.completos}/{stats.total} completos</span>
              <span className="font-semibold text-blue-600">{porcentaje}%</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                porcentaje === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {documentos.map((doc) => (
            <DocumentoCard key={doc.tipoDocumentoId} documento={doc} />
          ))}

          {documentos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay documentos aplicables para este usuario
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Componentes auxiliares
// ============================================

interface DocumentoCardProps {
  documento: DocumentoCompletado;
}

function DocumentoCard({ documento }: DocumentoCardProps) {
  const [expandido, setExpandido] = useState(false);
  const estado = documento.estado;
  const config = estado ? ESTADO_CONFIG[estado] : null;

  const getIcon = () => {
    if (!estado) return <FileText className="w-5 h-5 text-gray-400" />;
    switch (estado) {
      case 'COMPLETO':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'PENDIENTE_FISICO':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'PENDIENTE_ADJUNTOS':
        return <Upload className="w-5 h-5 text-yellow-500" />;
      case 'BORRADOR':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    if (!estado) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
          Sin iniciar
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config?.bgColor} ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const tieneContenido = estado && (
    Object.keys(documento.respuestas || {}).length > 0 ||
    (documento.archivosAdjuntos || []).length > 0
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header del documento */}
      <button
        onClick={() => tieneContenido && setExpandido(!expandido)}
        className={`w-full flex items-center gap-4 p-4 text-left ${
          tieneContenido ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
        } transition-colors`}
        disabled={!tieneContenido}
      >
        <div className="flex-shrink-0">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{documento.tipoDocumentoNombre}</h4>
          <p className="text-sm text-gray-500">
            {documento.camposCompletados}/{documento.camposObligatorios} campos •{' '}
            {documento.adjuntosSubidos}/{documento.adjuntosRequeridos} adjuntos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge()}
          {tieneContenido && (
            expandido ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )
          )}
        </div>
      </button>

      {/* Contenido expandido */}
      {expandido && tieneContenido && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
          {/* Respuestas */}
          {Object.keys(documento.respuestas || {}).length > 0 && (
            <RespuestasSection documento={documento} />
          )}

          {/* Adjuntos */}
          {(documento.archivosAdjuntos || []).length > 0 && (
            <AdjuntosSection adjuntos={documento.archivosAdjuntos || []} />
          )}
        </div>
      )}
    </div>
  );
}

interface RespuestasSectionProps {
  documento: DocumentoCompletado;
}

function RespuestasSection({ documento }: RespuestasSectionProps) {
  const { tipo } = useTipoDocumento(documento.tipoDocumentoId);
  const respuestas = documento.respuestas || {};

  // Crear mapa de código -> etiqueta
  const etiquetasPorCodigo = new Map(
    tipo?.campos?.map(c => [c.codigo, c.etiqueta]) || []
  );

  return (
    <div>
      <h5 className="text-sm font-semibold text-gray-700 mb-2">Respuestas</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(respuestas).map(([codigo, valor]) => (
          <div key={codigo} className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">
              {etiquetasPorCodigo.get(codigo) || codigo}
            </div>
            <div className="text-sm text-gray-900">{valor || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AdjuntosSectionProps {
  adjuntos: ArchivoAdjunto[];
}

function AdjuntosSection({ adjuntos }: AdjuntosSectionProps) {
  const { marcarEntregaFisica, cargando } = useMarcarEntregaFisica();

  const handleMarcarEntrega = async (archivoId: number) => {
    try {
      await marcarEntregaFisica(archivoId);
    } catch (error) {
      console.error('Error al marcar entrega física:', error);
    }
  };

  return (
    <div>
      <h5 className="text-sm font-semibold text-gray-700 mb-2">Archivos adjuntos</h5>
      <div className="space-y-2">
        {adjuntos.map((adjunto) => (
          <div
            key={adjunto.id}
            className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">{adjunto.adjuntoNombre}</div>
                <div className="text-xs text-gray-500">
                  {adjunto.nombreArchivo} • {Math.round(adjunto.tamanoBytes / 1024)} KB
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {adjunto.requiereEntregaFisica && (
                adjunto.entregadoFisicamente ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Entregado
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarcarEntrega(adjunto.id)}
                    disabled={cargando}
                    className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors disabled:opacity-50"
                  >
                    {cargando ? 'Marcando...' : 'Marcar entrega'}
                  </button>
                )
              )}
              <button
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                title="Ver archivo"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DetalleDocumentosUsuario;
