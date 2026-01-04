import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TablaUsuarios, DetalleUsuario } from '../components/usuarios';
import { useUsuariosAdmin } from '../hooks/useUsuariosAdmin';
import type { UsuarioAdmin } from '../api/services/usuariosAdmin';
import { LayoutDashboard, Users, Shield } from 'lucide-react';

export const Route = createFileRoute('/_auth/usuarios')({
    component: UsuariosPage,
});

/**
 * Dashboard de gestión de usuarios.
 * Accesible por DIRIGENTE y ADMIN.
 * Solo ADMIN y miembros del Consejo pueden asignar roles.
 */
function UsuariosPage() {
    const [activeTab, setActiveTab] = useState('usuarios');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioAdmin | null>(null);

    const { usuarios, cargando } = useUsuariosAdmin();

    // Stats rápidos
    const stats = {
        total: usuarios.length,
        activos: usuarios.filter(u => u.estado === 'ACTIVO').length,
        admins: usuarios.filter(u => u.roles.includes('ADMIN')).length,
        dirigentes: usuarios.filter(u => u.roles.includes('DIRIGENTE')).length,
        padres: usuarios.filter(u => u.roles.includes('PADRE')).length,
        acampantes: usuarios.filter(u => u.roles.includes('ACAMPANTE')).length,
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
                <p className="text-muted-foreground">
                    Gestión de usuarios y asignación de roles del sistema.
                </p>
            </div>

            {/* Main content with tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="usuarios" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Usuarios</span>
                    </TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard label="Total" value={stats.total} icon={Users} />
                        <StatCard label="Activos" value={stats.activos} color="green" />
                        <StatCard label="Admins" value={stats.admins} color="red" icon={Shield} />
                        <StatCard label="Dirigentes" value={stats.dirigentes} color="blue" />
                        <StatCard label="Padres" value={stats.padres} color="green" />
                        <StatCard label="Acampantes" value={stats.acampantes} color="purple" />
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-6 text-center text-muted-foreground">
                        <p>
                            Usa la pestaña <strong>Usuarios</strong> para ver y gestionar usuarios individualmente.
                        </p>
                    </div>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="usuarios" className="space-y-6">
                    <TablaUsuarios
                        usuarios={usuarios}
                        cargando={cargando}
                        onVerDetalle={setUsuarioSeleccionado}
                    />
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

// Helper component for stats
interface StatCardProps {
    label: string;
    value: number;
    color?: 'red' | 'blue' | 'green' | 'purple';
    icon?: React.ComponentType<{ className?: string }>;
}

function StatCard({ label, value, color, icon: Icon }: StatCardProps) {
    const colorClasses = {
        red: 'text-red-600 bg-red-50 dark:bg-red-950/30',
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
        green: 'text-green-600 bg-green-50 dark:bg-green-950/30',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
    };

    return (
        <div className={`rounded-lg p-4 ${color ? colorClasses[color] : 'bg-muted/50'}`}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </div>
            <div className="text-2xl font-bold">
                {value}
            </div>
        </div>
    );
}
