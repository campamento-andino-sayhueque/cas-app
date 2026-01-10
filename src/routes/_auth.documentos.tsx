import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    useTiposDocumento,
    useDocumentosUsuario,
    useGuardarDocumento
} from '../hooks/useDocumentos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Upload
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { FormularioDocumento } from '../components/documentos/FormularioDocumento';
import type { TipoDocumento, DocumentoCompletado } from '../api/schemas/documentos';
import { toast } from 'sonner';

export const Route = createFileRoute('/_auth/documentos')({
    component: RouteComponent,
});

function RouteComponent() {
    const auth = useAuth();
    const usuarioId = auth.user?.usuarioId;

    // Data
    const { data: tiposDocumento, isLoading: cargandoTipos } = useTiposDocumento();
    const { data: documentos, isLoading: cargandoDocs } = useDocumentosUsuario(usuarioId);

    // State
    const [documentoAbierto, setDocumentoAbierto] = useState<{
        tipo: TipoDocumento;
        documento: DocumentoCompletado | null;
    } | null>(null);

    // Mutations
    const guardarMutation = useGuardarDocumento();

    const handleAbrirDocumento = (tipo: TipoDocumento) => {
        const docExistente = documentos?.find(d => d.tipoDocumentoId === tipo.id) || null;
        setDocumentoAbierto({ tipo, documento: docExistente });
    };

    const handleGuardar = async (respuestas: Record<string, string>, finalizar: boolean) => {
        if (!documentoAbierto || !usuarioId) return;

        try {
            await guardarMutation.mutateAsync({
                tipoDocumentoId: documentoAbierto.tipo.id,
                usuarioId,
                respuestas,
                finalizar
            });
            toast.success(finalizar ? 'Documento guardado' : 'Borrador guardado');
            if (finalizar) {
                setDocumentoAbierto(null);
            }
        } catch (err) {
            toast.error('Error al guardar');
        }
    };

    // Loading
    if (cargandoTipos || cargandoDocs) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Cargando documentos...
            </div>
        );
    }

    // Mapear documentos a tipos
    const documentosPorTipo = new Map(
        documentos?.map(d => [d.tipoDocumentoId, d]) || []
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Mis Documentos</h1>
                <p className="text-muted-foreground">
                    Completa los formularios requeridos para el campamento.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    titulo="Completos"
                    valor={documentos?.filter(d => d.estado === 'COMPLETO').length || 0}
                    total={tiposDocumento?.length || 0}
                    icono={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                />
                <StatsCard
                    titulo="En progreso"
                    valor={documentos?.filter(d => d.estado === 'BORRADOR' || d.estado === 'PENDIENTE_ADJUNTOS').length || 0}
                    total={tiposDocumento?.length || 0}
                    icono={<Clock className="h-4 w-4 text-yellow-500" />}
                />
                <StatsCard
                    titulo="Pendientes"
                    valor={(tiposDocumento?.length || 0) - (documentos?.length || 0)}
                    total={tiposDocumento?.length || 0}
                    icono={<AlertCircle className="h-4 w-4 text-red-500" />}
                />
            </div>

            {/* Lista de documentos */}
            <div className="space-y-4">
                {tiposDocumento?.map(tipo => {
                    const doc = documentosPorTipo.get(tipo.id);
                    return (
                        <DocumentoCard
                            key={tipo.id}
                            tipo={tipo}
                            documento={doc}
                            onAbrir={() => handleAbrirDocumento(tipo)}
                        />
                    );
                })}
            </div>

            {/* Modal de formulario */}
            <Dialog
                open={!!documentoAbierto}
                onOpenChange={(open) => !open && setDocumentoAbierto(null)}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{documentoAbierto?.tipo.nombre}</DialogTitle>
                    </DialogHeader>
                    {documentoAbierto && (
                        <FormularioDocumento
                            tipo={documentoAbierto.tipo}
                            documento={documentoAbierto.documento}
                            onGuardar={handleGuardar}
                            guardando={guardarMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ============================================
// Subcomponentes
// ============================================

function StatsCard({
    titulo,
    valor,
    total,
    icono
}: {
    titulo: string;
    valor: number;
    total: number;
    icono: React.ReactNode;
}) {
    const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
                {icono}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{valor} / {total}</div>
                <Progress value={porcentaje} className="mt-2" />
            </CardContent>
        </Card>
    );
}

function DocumentoCard({
    tipo,
    documento,
    onAbrir
}: {
    tipo: TipoDocumento;
    documento?: DocumentoCompletado;
    onAbrir: () => void;
}) {
    const getEstadoBadge = () => {
        if (!documento || !documento.estado) {
            return <Badge variant="outline">Sin iniciar</Badge>;
        }

        switch (documento.estado) {
            case 'COMPLETO':
                return <Badge className="bg-green-500">Completo</Badge>;
            case 'PENDIENTE_FISICO':
                return <Badge className="bg-blue-500">Pendiente entrega física</Badge>;
            case 'PENDIENTE_ADJUNTOS':
                return <Badge className="bg-yellow-500">Faltan adjuntos</Badge>;
            case 'BORRADOR':
                return <Badge variant="secondary">Borrador</Badge>;
            default:
                return <Badge variant="outline">Sin iniciar</Badge>;
        }
    };

    const progreso = documento
        ? Math.round(((documento.camposCompletados || 0) / Math.max(documento.camposObligatorios || 1, 1)) * 100)
        : 0;

    return (
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={onAbrir}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">{tipo.nombre}</CardTitle>
                        {tipo.descripcion && (
                            <CardDescription className="line-clamp-1">{tipo.descripcion}</CardDescription>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {getEstadoBadge()}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
            </CardHeader>
            {documento && documento.estado !== 'COMPLETO' && (
                <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Progress value={progreso} className="flex-1" />
                        <span>{progreso}%</span>
                    </div>
                    {tipo.adjuntosRequeridos.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Upload className="h-3 w-3" />
                            {documento.adjuntosSubidos} / {documento.adjuntosRequeridos} adjuntos
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
