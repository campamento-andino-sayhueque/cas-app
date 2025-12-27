import { useState } from "react";
import { Copy, RefreshCw, Users, Share2, Loader2, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useMiFamilia, useRegenerarCodigo } from "../../hooks/useFamilia";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { OnboardingWizard } from "../onboarding/OnboardingWizard";

export function FamiliaWidget() {
    const { data: familia, isLoading, error } = useMiFamilia();
    const regenerar = useRegenerarCodigo();
    const [showDialog, setShowDialog] = useState(false);

    if (isLoading) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return null; // Silently fail if there's an error
    }

    // Estado Vacío: usuario no tiene familia
    if (!familia?.uid) {
        return (
            <Card className="border-dashed bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        Mi Grupo Familiar
                    </CardTitle>
                    <CardDescription>
                        No estás vinculado a ninguna familia todavía.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogTrigger asChild>
                            <Button className="w-full" variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear o Unirse a Familia
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="sr-only">
                                <DialogTitle>Vincular Familia</DialogTitle>
                                <DialogDescription>
                                    Crea una nueva familia o únete con un código de invitación.
                                </DialogDescription>
                            </DialogHeader>
                            <OnboardingWizard />
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        );
    }

    // Estado Activo: usuario tiene familia
    const handleCopyCodigo = async () => {
        if (!familia.codigoVinculacion) return;
        
        try {
            await navigator.clipboard.writeText(familia.codigoVinculacion);
            toast.success("Código copiado al portapapeles");
        } catch {
            toast.error("No se pudo copiar el código");
        }
    };

    const handleCompartirWhatsApp = () => {
        if (!familia.codigoVinculacion) return;
        
        const mensaje = encodeURIComponent(
            `¡Hola! Soy ${familia.nombre ? familia.nombre.replace('Familia ', '') : 'tu hijo/a'}. ` +
            `Para vincularte a mi familia en el Campamento, usa este código: *${familia.codigoVinculacion}*\n\n` +
            `Descarga la app y selecciona "Soy Padre/Tutor/Familiar" para vincularte 🏕️`
        );
        window.open(`https://wa.me/?text=${mensaje}`, "_blank");
    };

    const handleRegenerarCodigo = async () => {
        if (!familia.uid) return;
        
        try {
            const result = await regenerar.mutateAsync(familia.uid);
            toast.success(`Código regenerado: ${result.nuevoCodigo}`);
        } catch {
            toast.error("Error al regenerar el código");
        }
    };

    return (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        {familia.nombre}
                    </CardTitle>
                    {familia.esResponsable && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                            Administrador
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Código de Vinculación */}
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border">
                    <p className="text-xs text-muted-foreground mb-1">Código de Vinculación</p>
                    <div className="flex items-center justify-between">
                        <code className="text-2xl font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
                            {familia.codigoVinculacion}
                        </code>
                        <div className="flex gap-1">
                            <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={handleCopyCodigo}
                                title="Copiar código"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={handleCompartirWhatsApp}
                                title="Compartir por WhatsApp"
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                            {familia.esResponsable && (
                                <Button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={handleRegenerarCodigo}
                                    disabled={regenerar.isPending}
                                    title="Regenerar código"
                                >
                                    <RefreshCw className={`w-4 h-4 ${regenerar.isPending ? "animate-spin" : ""}`} />
                                </Button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Comparte este código con tus padres o tutores para que se vinculen.
                    </p>
                </div>

                {/* Lista de Miembros */}
                {familia.miembros && familia.miembros.length > 0 && (
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">
                            Miembros ({familia.miembros.length})
                        </p>
                        <div className="space-y-2">
                            {familia.miembros.map((miembro) => (
                                <div 
                                    key={miembro.usuarioUid}
                                    className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg p-2 border"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                            {miembro.nombre?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{miembro.nombre}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{miembro.rol}</p>
                                        </div>
                                    </div>
                                    {miembro.esResponsableEconomico && (
                                        <Badge variant="outline" className="text-xs">
                                            Responsable
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
