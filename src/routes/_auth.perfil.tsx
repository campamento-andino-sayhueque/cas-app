import { createFileRoute } from '@tanstack/react-router';
import { useUsuarioActual } from '../hooks/useUsuarioActual';

export const Route = createFileRoute('/_auth/perfil')({
  component: PerfilPage,
})

function PerfilPage() {
  const { data: usuario, isLoading, error } = useUsuarioActual();

  if (isLoading) return <div className="p-4">Cargando perfil...</div>;
  
  if (error) return (
    <div className="p-4 text-red-500">
      Error al cargar backend: {error.message}
      <br />
      <small>Verifica que el backend esté corriendo en el puerto correcto.</small>
    </div>
  );

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
            {usuario?.urlFoto && (
                <img src={usuario.urlFoto} alt="Avatar" className="w-16 h-16 rounded-full" />
            )}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{usuario?.nombreMostrar}</h1>
                <p className="text-gray-500">{usuario?.email}</p>
            </div>
        </div>

        <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Datos del Backend (Spring Boot + Keycloak):</h3>
            <ul className="space-y-2 text-sm">
                <li><strong>ID Interno:</strong> {usuario?.id}</li>
                <li><strong>Estado:</strong> <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{usuario?.estado}</span></li>
                <li><strong>Roles:</strong> {usuario?.roles?.join(', ')}</li>
                <li><strong>Perfil Completo:</strong> {usuario?.perfilCompleto ? '✅ Sí' : '❌ No'}</li>
            </ul>
        </div>
      </div>
    </div>
  );
}
