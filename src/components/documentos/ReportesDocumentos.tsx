/**
 * ReportesDocumentos Component
 *
 * Dashboard para dirigentes y secretario para ver el estado de documentación.
 * Muestra estadísticas generales y detalle por usuario.
 */

import { useState, useMemo } from 'react';
import { Users, CheckCircle, Clock, AlertTriangle, Search, ChevronDown } from 'lucide-react';
import { useReporteDocumentosGeneral, useReporteDocumentosGrupo } from '../../hooks/useDocumentos';
import { useGruposAcampantes } from '../../hooks/useGrupos';
import { useAuth } from '../../hooks/useAuth';
import type { ResumenDocumentosMiembro } from '../../api/schemas/documentos';

interface ReportesDocumentosProps {
  onSelectUsuario?: (usuarioId: number, usuarioNombre?: string) => void;
}

export function ReportesDocumentos({ onSelectUsuario }: ReportesDocumentosProps) {
  const { hasRole } = useAuth();
  const esSecretario = hasRole('SECRETARIO') || hasRole('ADMIN');
  
  // Cargar grupos reales desde Keycloak
  const { grupos: gruposKeycloak, cargando: cargandoGrupos } = useGruposAcampantes();
  
  // Crear lista de opciones con "Todos" al principio
  const opcionesGrupos = useMemo(() => {
    const opciones = [{ id: 'all', nombre: 'Todos los grupos' }];
    gruposKeycloak.forEach(g => opciones.push({ id: g.id, nombre: g.nombre }));
    return opciones;
  }, [gruposKeycloak]);

  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | undefined>(
    esSecretario ? undefined : gruposKeycloak[0]?.id
  );
  const [busqueda, setBusqueda] = useState('');

  // Usar reporte general para secretario, o reporte de grupo para dirigentes
  const { reporte: reporteGeneral, cargando: cargandoGeneral } = useReporteDocumentosGeneral();
  const { reporte: reporteGrupo, cargando: cargandoGrupo } = useReporteDocumentosGrupo(grupoSeleccionado);

  const reporte = esSecretario && !grupoSeleccionado ? reporteGeneral : reporteGrupo;
  const cargando = esSecretario && !grupoSeleccionado ? cargandoGeneral : cargandoGrupo;

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = reporte?.detalleUsuarios?.filter(u => 
    !busqueda || 
    u.usuarioNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.usuarioEmail?.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  if (cargando || cargandoGrupos) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total usuarios"
          value={reporte?.totalUsuarios || 0}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Completos"
          value={reporte?.usuariosCompletos || 0}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="En progreso"
          value={reporte?.usuariosParciales || 0}
          color="yellow"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Sin iniciar"
          value={reporte?.usuariosSinIniciar || 0}
          color="red"
        />
      </div>

      {/* Progreso promedio */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Completitud promedio</span>
          <span className="text-lg font-bold text-orange-600">
            {Math.round(reporte?.porcentajePromedioCompletitud || 0)}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
            style={{ width: `${reporte?.porcentajePromedioCompletitud || 0}%` }}
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Selector de grupo */}
        {esSecretario && (
          <div className="relative">
            <select
              value={grupoSeleccionado || 'all'}
              onChange={(e) => setGrupoSeleccionado(e.target.value === 'all' ? undefined : e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {opcionesGrupos.map(g => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Usuario
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Progreso
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                  Completos
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                  Pendientes
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuariosFiltrados.map((usuario) => (
                <UsuarioRow
                  key={usuario.usuarioId}
                  usuario={usuario}
                  onClick={() => onSelectUsuario?.(usuario.usuarioId, usuario.usuarioNombre ?? undefined)}
                />
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

interface UsuarioRowProps {
  usuario: ResumenDocumentosMiembro;
  onClick?: () => void;
}

function UsuarioRow({ usuario, onClick }: UsuarioRowProps) {
  const porcentaje = usuario.totalDocumentos > 0
    ? Math.round((usuario.documentosCompletos / usuario.totalDocumentos) * 100)
    : 0;

  const getEstadoBadge = () => {
    if (porcentaje === 100) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Completo</span>;
    }
    if (porcentaje === 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Sin iniciar</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">En progreso</span>;
  };

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-gray-900">{usuario.usuarioNombre || 'Sin nombre'}</div>
          <div className="text-sm text-gray-500">{usuario.usuarioEmail}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                porcentaje === 100 ? 'bg-green-500' : porcentaje > 0 ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 w-10">{porcentaje}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center hidden md:table-cell">
        <span className="text-sm text-gray-700">{usuario.documentosCompletos}</span>
      </td>
      <td className="px-4 py-3 text-center hidden md:table-cell">
        <span className="text-sm text-gray-700">
          {usuario.documentosPendientes + usuario.documentosSinIniciar}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {getEstadoBadge()}
      </td>
    </tr>
  );
}

export default ReportesDocumentos;
