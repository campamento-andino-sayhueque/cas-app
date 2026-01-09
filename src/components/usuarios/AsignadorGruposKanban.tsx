import { useState, useEffect, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useGruposAcampantes, useGruposDirigentes, useAgregarAGrupo, useRemoverDeGrupo } from '../../hooks/useGrupos';
import { useUsuariosAdmin } from '../../hooks/useUsuariosAdmin';
import type { UsuarioAdmin } from '../../api/services/usuariosAdmin';
import type { Grupo } from '../../api/services/grupos';
import { Loader2, Users, Tent, Shield, GripVertical, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gruposService } from '../../api/services/grupos';

interface AsignadorGruposKanbanProps {
    tipo: 'acampantes' | 'dirigentes';
}

// =============================================================================
// Componente de usuario arrastrable
// =============================================================================
interface UsuarioArrastrableProps {
    usuario: UsuarioAdmin;
}

function UsuarioArrastrable({ usuario }: UsuarioArrastrableProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: `usuario-${usuario.id}`,
        data: { type: 'usuario', usuario }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "flex items-center gap-2 p-2 bg-background border rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-all",
                isDragging && "opacity-50 scale-95",
                "hover:shadow-md hover:border-primary/30"
            )}
        >
            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{usuario.nombreMostrar}</p>
                <p className="text-xs text-muted-foreground truncate">{usuario.email}</p>
            </div>
        </div>
    );
}

// Versión simplificada para el drag overlay
function UsuarioOverlay({ usuario }: { usuario: UsuarioAdmin }) {
    return (
        <div className="flex items-center gap-2 p-2 bg-background border-2 border-primary rounded-lg shadow-xl cursor-grabbing">
            <GripVertical className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{usuario.nombreMostrar}</p>
                <p className="text-xs text-muted-foreground truncate">{usuario.email}</p>
            </div>
        </div>
    );
}

// =============================================================================
// Columna de grupo (droppable)
// =============================================================================
interface ColumnaGrupoProps {
    grupo: Grupo | { id: 'sin-asignar'; nombre: string; path: string };
    usuarios: UsuarioAdmin[];
    color: 'green' | 'blue' | 'gray';
    cargando?: boolean;
}

function ColumnaGrupo({ grupo, usuarios, color, cargando }: ColumnaGrupoProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `grupo-${grupo.id}`,
        data: { type: 'grupo', grupo }
    });

    const colorClasses = {
        green: 'border-green-200 bg-green-50/30 dark:bg-green-950/20',
        blue: 'border-blue-200 bg-blue-50/30 dark:bg-blue-950/20',
        gray: 'border-gray-200 bg-gray-50/30 dark:bg-gray-900/20',
    };

    const headerColors = {
        green: 'bg-green-100 dark:bg-green-900/40',
        blue: 'bg-blue-100 dark:bg-blue-900/40',
        gray: 'bg-gray-100 dark:bg-gray-800/40',
    };

    const iconColors = {
        green: 'text-green-600 dark:text-green-400',
        blue: 'text-blue-600 dark:text-blue-400',
        gray: 'text-gray-600 dark:text-gray-400',
    };

    const Icon = grupo.id === 'sin-asignar' ? Users : (color === 'blue' ? Shield : Tent);

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col w-72 min-w-72 rounded-xl border-2 transition-all duration-200",
                colorClasses[color],
                isOver && "border-primary ring-2 ring-primary/30 scale-[1.02]"
            )}
        >
            {/* Header */}
            <div className={cn("p-3 rounded-t-lg", headerColors[color])}>
                <div className="flex items-center gap-2">
                    <Icon className={cn("w-5 h-5", iconColors[color])} />
                    <h3 className="font-semibold text-sm">{grupo.nombre}</h3>
                    <Badge variant="secondary" className="ml-auto text-xs">
                        {cargando ? '...' : usuarios.length}
                    </Badge>
                </div>
                {grupo.id !== 'sin-asignar' && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{grupo.path}</p>
                )}
            </div>

            {/* Lista de usuarios */}
            <div className="p-2 flex-1 overflow-y-auto max-h-[60vh] space-y-2">
                {cargando ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <SortableContext
                        items={usuarios.map(u => `usuario-${u.id}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        {usuarios.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4 italic">
                                Arrastrá usuarios aquí
                            </p>
                        ) : (
                            usuarios.map(usuario => (
                                <UsuarioArrastrable key={usuario.id} usuario={usuario} />
                            ))
                        )}
                    </SortableContext>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// Hook para cargar miembros de todos los grupos (por email para match)
// =============================================================================
function useGruposConMiembros(grupos: Grupo[]) {
    const grupoIds = grupos.map(g => g.id);
    
    const query = useQuery({
        queryKey: ['grupos', 'kanban', grupoIds],
        queryFn: async () => {
            // Retorna un mapa de grupoId -> lista de emails de miembros
            const miembrosPorGrupo: Record<string, string[]> = {};
            
            // Cargar miembros de cada grupo en paralelo
            await Promise.all(
                grupos.map(async (grupo) => {
                    try {
                        const miembros = await gruposService.obtenerMiembrosGrupo(grupo.id);
                        // Usamos email para hacer el match con los usuarios
                        miembrosPorGrupo[grupo.id] = miembros.map(m => m.email.toLowerCase());
                    } catch (error) {
                        console.error(`Error cargando miembros del grupo ${grupo.nombre}:`, error);
                        miembrosPorGrupo[grupo.id] = [];
                    }
                })
            );
            
            return miembrosPorGrupo;
        },
        enabled: grupos.length > 0,
        staleTime: 30000, // 30 segundos
    });

    return {
        emailsPorGrupo: query.data ?? {},
        cargando: query.isLoading,
        refetch: query.refetch,
    };
}

// =============================================================================
// Componente principal
// =============================================================================
export function AsignadorGruposKanban({ tipo }: AsignadorGruposKanbanProps) {
    const queryClient = useQueryClient();
    const { grupos: gruposAcampantes, cargando: cargandoAcampantes } = useGruposAcampantes();
    const { grupos: gruposDirigentes, cargando: cargandoDirigentes } = useGruposDirigentes();
    const { usuarios, cargando: cargandoUsuarios } = useUsuariosAdmin();
    const agregarMutation = useAgregarAGrupo();
    const removerMutation = useRemoverDeGrupo();

    const grupos = tipo === 'acampantes' ? gruposAcampantes : gruposDirigentes;
    const { emailsPorGrupo, cargando: cargandoMiembros, refetch } = useGruposConMiembros(grupos);

    const [activeUser, setActiveUser] = useState<UsuarioAdmin | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Estado local para las asignaciones (por userId)
    const [asignacionesLocales, setAsignacionesLocales] = useState<Record<string, number[]>>({});
    const [initialized, setInitialized] = useState(false);

    const cargando = cargandoAcampantes || cargandoDirigentes || cargandoUsuarios;
    const rolFiltro = tipo === 'acampantes' ? 'ACAMPANTE' : 'DIRIGENTE';
    const color = tipo === 'acampantes' ? 'green' : 'blue';

    // Filtrar usuarios por rol
    const usuariosFiltrados = usuarios.filter(u => u.roles.includes(rolFiltro));

    // Sincronizar miembros cargados con estado local (cuando cargan los datos)
    useEffect(() => {
        if (Object.keys(emailsPorGrupo).length > 0 && usuariosFiltrados.length > 0 && !initialized) {
            // Convertir emails a userIds
            const nuevasAsignaciones: Record<string, number[]> = {};
            
            for (const [grupoId, emails] of Object.entries(emailsPorGrupo)) {
                nuevasAsignaciones[grupoId] = [];
                for (const email of emails) {
                    const usuario = usuariosFiltrados.find(u => u.email.toLowerCase() === email);
                    if (usuario) {
                        nuevasAsignaciones[grupoId].push(usuario.id);
                    }
                }
            }
            
            setAsignacionesLocales(nuevasAsignaciones);
            setInitialized(true);
        }
    }, [emailsPorGrupo, usuariosFiltrados, initialized]);

    // Resetear inicialización si cambia el tipo
    useEffect(() => {
        setInitialized(false);
        setAsignacionesLocales({});
    }, [tipo]);

    // Sensores para drag
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor)
    );

    // Esta función determina en qué grupo está un usuario
    const getGrupoDeUsuario = useCallback((usuario: UsuarioAdmin): string => {
        for (const grupoId in asignacionesLocales) {
            if (asignacionesLocales[grupoId].includes(usuario.id)) {
                return grupoId;
            }
        }
        return 'sin-asignar';
    }, [asignacionesLocales]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const usuario = (active.data.current as { usuario?: UsuarioAdmin })?.usuario;
        if (usuario) {
            setActiveUser(usuario);
        }
    };

    const handleDragOver = (_event: DragOverEvent) => {
        // Feedback visual manejado por CSS
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveUser(null);
        setError(null);

        if (!over) return;

        const usuarioData = active.data.current as { usuario?: UsuarioAdmin };
        const grupoData = over.data.current as { grupo?: Grupo | { id: string } };

        if (!usuarioData?.usuario || !grupoData?.grupo) return;

        const usuario = usuarioData.usuario;
        const nuevoGrupoId = grupoData.grupo.id;
        const grupoActualId = getGrupoDeUsuario(usuario);

        // Si está en el mismo grupo, no hacer nada
        if (grupoActualId === nuevoGrupoId) return;

        // Guardar estado anterior para revert
        const estadoAnterior = { ...asignacionesLocales };

        // Optimistic update
        setAsignacionesLocales(prev => {
            const newState = { ...prev };
            
            // Remover del grupo anterior
            if (grupoActualId !== 'sin-asignar' && newState[grupoActualId]) {
                newState[grupoActualId] = newState[grupoActualId].filter(id => id !== usuario.id);
            }
            
            // Agregar al nuevo grupo
            if (nuevoGrupoId !== 'sin-asignar') {
                if (!newState[nuevoGrupoId]) {
                    newState[nuevoGrupoId] = [];
                }
                newState[nuevoGrupoId] = [...newState[nuevoGrupoId], usuario.id];
            }
            
            return newState;
        });

        try {
            // Si estaba en un grupo, removerlo
            if (grupoActualId !== 'sin-asignar') {
                await removerMutation.mutateAsync({
                    usuarioId: usuario.id,
                    grupoId: grupoActualId,
                });
            }

            // Si el destino no es "sin asignar", agregarlo al nuevo grupo
            if (nuevoGrupoId !== 'sin-asignar') {
                await agregarMutation.mutateAsync({
                    usuarioId: usuario.id,
                    grupoId: nuevoGrupoId,
                });
            }

            // Invalidar queries para refrescar datos
            queryClient.invalidateQueries({ queryKey: ['grupos', 'kanban'] });

        } catch (err) {
            console.error('Error al asignar usuario:', err);
            
            // Revertir optimistic update
            setAsignacionesLocales(estadoAnterior);

            // Manejar error 403
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
                setError('No tenés permisos para asignar usuarios a grupos. Solo miembros del Consejo pueden hacerlo.');
            } else {
                setError('Error al asignar usuario. Intentá nuevamente.');
            }
        }
    };

    const handleRefresh = () => {
        setInitialized(false);
        refetch();
    };

    if (cargando) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Separar usuarios por grupo
    const usuariosSinAsignar = usuariosFiltrados.filter(u => getGrupoDeUsuario(u) === 'sin-asignar');
    const getUsuariosDeGrupo = (grupoId: string) => 
        usuariosFiltrados.filter(u => getGrupoDeUsuario(u) === grupoId);

    return (
        <div className="space-y-4">
            {/* Mensaje de error */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Header con instrucciones y refresh */}
            <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg flex-1">
                    <strong>Instrucciones:</strong> Arrastrá los usuarios a las columnas de grupos para asignarlos. 
                    Solo miembros del <strong>Consejo</strong> pueden realizar esta acción.
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={cargandoMiembros}
                >
                    <RefreshCw className={cn("w-4 h-4 mr-2", cargandoMiembros && "animate-spin")} />
                    Actualizar
                </Button>
            </div>

            {/* Área de Kanban */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {/* Columna "Sin Asignar" */}
                    <ColumnaGrupo
                        grupo={{ id: 'sin-asignar', nombre: 'Sin Asignar', path: '' }}
                        usuarios={usuariosSinAsignar}
                        color="gray"
                        cargando={cargandoMiembros}
                    />

                    {/* Columnas de grupos */}
                    {grupos.map(grupo => (
                        <ColumnaGrupo
                            key={grupo.id}
                            grupo={grupo}
                            usuarios={getUsuariosDeGrupo(grupo.id)}
                            color={color}
                            cargando={cargandoMiembros}
                        />
                    ))}
                </div>

                {/* Overlay del usuario arrastrado */}
                <DragOverlay>
                    {activeUser && <UsuarioOverlay usuario={activeUser} />}
                </DragOverlay>
            </DndContext>

            {/* Estado de mutaciones */}
            {(agregarMutation.isPending || removerMutation.isPending) && (
                <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Actualizando...
                </div>
            )}
        </div>
    );
}
