import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TablaUsuarios, DetalleUsuario, AsignadorGruposKanban } from '../components/usuarios';
import { useUsuariosAdmin } from '../hooks/useUsuariosAdmin';
import { useGruposAcampantes, useGruposDirigentes } from '../hooks/useGrupos';
import type { UsuarioAdmin } from '../api/services/usuariosAdmin';
import { Users, Tent, Shield, ChevronRight, Kanban } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export const Route = createFileRoute('/_auth/usuarios')({
    component: AcampantesPage,
});

/**
 * Dashboard de gestión de acampantes y grupos.
 * Accesible por DIRIGENTE y ADMIN.
 */
function AcampantesPage() {
    const [activeTab, setActiveTab] = useState('acampantes');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioAdmin | null>(null);

    const { usuarios, cargando } = useUsuariosAdmin();
    const { grupos: gruposAcampantes } = useGruposAcampantes();
    const { grupos: gruposDirigentes } = useGruposDirigentes();

    // Filtrar solo acampantes para esta vista
    const acampantes = usuarios.filter(u => u.roles.includes('ACAMPANTE'));

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Acampantes</h1>
                <p className="text-muted-foreground">
                    Gestión de acampantes, grupos y asignaciones.
                </p>
            </div>

            {/* Main content with tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full max-w-lg grid-cols-3">
                    <TabsTrigger value="acampantes" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Acampantes</span>
                    </TabsTrigger>
                    <TabsTrigger value="grupos" className="flex items-center gap-2">
                        <Tent className="w-4 h-4" />
                        <span className="hidden sm:inline">Grupos</span>
                    </TabsTrigger>
                    <TabsTrigger value="asignar" className="flex items-center gap-2">
                        <Kanban className="w-4 h-4" />
                        <span className="hidden sm:inline">Asignar</span>
                    </TabsTrigger>
                </TabsList>

                {/* Acampantes Tab */}
                <TabsContent value="acampantes" className="space-y-6">
                    <TablaUsuarios
                        usuarios={usuarios}
                        cargando={cargando}
                        onVerDetalle={setUsuarioSeleccionado}
                    />
                </TabsContent>

                {/* Grupos Tab */}
                <TabsContent value="grupos" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Grupos de Acampantes */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <Tent className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-lg font-semibold">Grupos de Acampantes</h2>
                            </div>
                            
                            <div className="space-y-2">
                                {gruposAcampantes.length === 0 ? (
                                    <p className="text-muted-foreground text-sm p-4 bg-muted/30 rounded-lg">
                                        No hay grupos de acampantes configurados.
                                    </p>
                                ) : (
                                    gruposAcampantes.map(grupo => (
                                        <GrupoCard 
                                            key={grupo.id} 
                                            nombre={grupo.nombre} 
                                            path={grupo.path}
                                            color="green"
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Grupos de Dirigentes */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-lg font-semibold">Grupos de Dirigentes</h2>
                            </div>
                            
                            <div className="space-y-2">
                                {gruposDirigentes.length === 0 ? (
                                    <p className="text-muted-foreground text-sm p-4 bg-muted/30 rounded-lg">
                                        No hay grupos de dirigentes configurados.
                                    </p>
                                ) : (
                                    gruposDirigentes.map(grupo => (
                                        <GrupoCard 
                                            key={grupo.id} 
                                            nombre={grupo.nombre} 
                                            path={grupo.path}
                                            color="blue"
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Resumen */}
                    <div className="bg-muted/30 rounded-lg p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total acampantes asignados a grupos</p>
                            <p className="text-2xl font-bold">{acampantes.length}</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="text-green-600">
                                {gruposAcampantes.length} grupos de acampantes
                            </Badge>
                            <Badge variant="outline" className="text-blue-600">
                                {gruposDirigentes.length} grupos de dirigentes
                            </Badge>
                        </div>
                    </div>
                </TabsContent>

                {/* Asignar Tab - Kanban Drag & Drop */}
                <TabsContent value="asignar" className="space-y-6">
                    <div className="space-y-6">
                        {/* Selector de tipo */}
                        <Tabs defaultValue="acampantes" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="acampantes" className="flex items-center gap-2">
                                    <Tent className="w-4 h-4" />
                                    Acampantes
                                </TabsTrigger>
                                <TabsTrigger value="dirigentes" className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Dirigentes
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="acampantes">
                                <AsignadorGruposKanban tipo="acampantes" />
                            </TabsContent>
                            
                            <TabsContent value="dirigentes">
                                <AsignadorGruposKanban tipo="dirigentes" />
                            </TabsContent>
                        </Tabs>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Detail sheet */}
            <DetalleUsuario
                usuario={usuarioSeleccionado}
                open={!!usuarioSeleccionado}
                onClose={() => setUsuarioSeleccionado(null)}
            />
        </div>
    );
}

// Card component for groups
interface GrupoCardProps {
    nombre: string;
    path: string;
    color: 'green' | 'blue';
}

function GrupoCard({ nombre, path, color }: GrupoCardProps) {
    const colorClasses = {
        green: 'border-green-200 hover:border-green-400 bg-green-50/50 dark:bg-green-950/20',
        blue: 'border-blue-200 hover:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20',
    };

    return (
        <div className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium">{nombre}</h3>
                    <p className="text-xs text-muted-foreground">{path}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
        </div>
    );
}
