/**
 * AdminDocumentos Component
 *
 * Componente de administración para tipos de documento.
 * Permite ver, crear y editar tipos de documento y sus campos.
 */

import { useState } from 'react';
import { FileText, Plus, ChevronDown, ChevronUp, Settings, Eye, Pencil } from 'lucide-react';
import { useTiposDocumento } from '../../hooks/useDocumentos';
import type { TipoDocumento, CampoFormulario } from '../../api/schemas/documentos';
import { FormularioTipoDocumento } from './FormularioTipoDocumento';

export function AdminDocumentos() {
  const { tipos, cargando, error, refetch } = useTiposDocumento();
  const [expandedTipo, setExpandedTipo] = useState<number | null>(null);
  const [tipoEditar, setTipoEditar] = useState<TipoDocumento | null>(null);
  const [mostrarCrear, setMostrarCrear] = useState(false);

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error al cargar tipos de documento: {error.message}
      </div>
    );
  }

  const handleEditSuccess = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tipos de Documento</h2>
          <p className="text-sm text-gray-500">
            {tipos.length} tipo{tipos.length !== 1 ? 's' : ''} configurado{tipos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          onClick={() => setMostrarCrear(true)}
        >
          <Plus className="w-4 h-4" />
          Nuevo tipo
        </button>
      </div>

      {/* Lista de tipos */}
      <div className="space-y-4">
        {tipos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay tipos de documento configurados</p>
            <button
              onClick={() => setMostrarCrear(true)}
              className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
            >
              Crear el primer tipo de documento
            </button>
          </div>
        ) : (
          tipos.map((tipo) => (
            <TipoDocumentoCard
              key={tipo.id}
              tipo={tipo}
              isExpanded={expandedTipo === tipo.id}
              onToggle={() => setExpandedTipo(expandedTipo === tipo.id ? null : tipo.id)}
              onEdit={() => setTipoEditar(tipo)}
            />
          ))
        )}
      </div>

      {/* Nota sobre PDF */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Módulo PDF pendiente</h4>
            <p className="text-sm text-amber-700 mt-1">
              La funcionalidad para generar un PDF con la información del acampante para que el padre solo tenga que venir a firmar está planificada para una próxima versión.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de creación */}
      {mostrarCrear && (
        <FormularioTipoDocumento
          onClose={() => setMostrarCrear(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de edición */}
      {tipoEditar && (
        <FormularioTipoDocumento
          tipoDocumento={tipoEditar}
          onClose={() => setTipoEditar(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

interface TipoDocumentoCardProps {
  tipo: TipoDocumento;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

function TipoDocumentoCard({ tipo, isExpanded, onToggle, onEdit }: TipoDocumentoCardProps) {
  // Agrupar campos por sección
  const seccionesMap = new Map<string, CampoFormulario[]>();
  tipo.campos.forEach((campo) => {
    const seccion = campo.seccion || 'General';
    if (!seccionesMap.has(seccion)) {
      seccionesMap.set(seccion, []);
    }
    seccionesMap.get(seccion)!.push(campo);
  });
  const secciones = Array.from(seccionesMap.entries());

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <button
          onClick={onToggle}
          className="flex items-center gap-4 flex-1 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{tipo.nombre}</h3>
            <p className="text-sm text-gray-500">
              {tipo.codigo} • {tipo.campos.length} campos • {tipo.adjuntosRequeridos.length} adjuntos
            </p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 text-xs rounded-full ${
            tipo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {tipo.activo ? 'Activo' : 'Inactivo'}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            tipo.audiencia === 'TODOS' ? 'bg-blue-100 text-blue-700' : 
            tipo.audiencia === 'MENOR_18' ? 'bg-purple-100 text-purple-700' : 
            'bg-teal-100 text-teal-700'
          }`}>
            {tipo.audiencia === 'TODOS' ? 'Todos' : 
             tipo.audiencia === 'MENOR_18' ? 'Menores' : 'Mayores'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title="Editar tipo de documento"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onToggle}>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-6">
          {/* Descripción */}
          {tipo.descripcion && (
            <div className="text-sm text-gray-600">
              <strong className="text-gray-700">Descripción:</strong> {tipo.descripcion}
            </div>
          )}

          {/* Campos por sección */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Campos del formulario
            </h4>
            <div className="space-y-4">
              {secciones.map(([seccion, campos]) => (
                <div key={seccion} className="bg-white rounded-lg p-3 border border-gray-200">
                  <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {seccion}
                  </h5>
                  <div className="space-y-1">
                    {campos.map((campo) => (
                      <div key={campo.id} className="flex items-center justify-between text-sm py-1">
                        <span className="text-gray-700">{campo.etiqueta}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 uppercase">
                            {campo.tipoCampo}
                          </span>
                          {campo.obligatorio && (
                            <span className="w-2 h-2 rounded-full bg-red-500" title="Obligatorio" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adjuntos */}
          {tipo.adjuntosRequeridos.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Adjuntos requeridos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tipo.adjuntosRequeridos.map((adjunto) => (
                  <div
                    key={adjunto.id}
                    className="bg-white rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm">{adjunto.nombre}</span>
                      <div className="flex gap-1">
                        {adjunto.obligatorio && (
                          <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                            Req
                          </span>
                        )}
                        {adjunto.requiereEntregaFisica && (
                          <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                            Físico
                          </span>
                        )}
                      </div>
                    </div>
                    {adjunto.descripcion && (
                      <p className="text-xs text-gray-500 mt-1">{adjunto.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de edición en el contenido expandido */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              Editar este tipo de documento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDocumentos;
