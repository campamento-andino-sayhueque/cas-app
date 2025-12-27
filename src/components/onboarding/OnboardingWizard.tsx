import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Tent, Users, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useCrearFamilia, useUnirseConCodigo, useValidarCodigo } from "../../hooks/useFamilia";
import { toast } from "sonner";

type OnboardingStep = "select" | "acampante" | "familiar";

// Roles para acampantes (quienes crean la familia)
const ROLES_ACAMPANTE = [
    { value: "HIJO", label: "Hijo" },
    { value: "HIJA", label: "Hija" },
];

// Roles para familiares (quienes se unen)
const ROLES_FAMILIAR = [
    { value: "PADRE", label: "Padre" },
    { value: "MADRE", label: "Madre" },
    { value: "TUTOR_LEGAL", label: "Tutor Legal" },
    { value: "ABUELO", label: "Abuelo" },
    { value: "ABUELA", label: "Abuela" },
    { value: "HIJO", label: "Hijo/a (hermano)" },
    { value: "OTRO", label: "Otro familiar" },
];

export function OnboardingWizard() {
    const [step, setStep] = useState<OnboardingStep>("select");
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {step === "select" && (
                    <SelectionStep 
                        onAcampante={() => setStep("acampante")} 
                        onFamiliar={() => setStep("familiar")} 
                    />
                )}
                {step === "acampante" && (
                    <AcampanteStep 
                        onBack={() => setStep("select")} 
                        onSuccess={() => {
                            toast.success("¡Familia creada! Comparte el código con tus padres.");
                            navigate({ to: "/dashboard" });
                        }}
                    />
                )}
                {step === "familiar" && (
                    <FamiliarStep 
                        onBack={() => setStep("select")} 
                        onSuccess={() => {
                            toast.success("¡Te has unido a la familia!");
                            navigate({ to: "/dashboard" });
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// Step 1: Selection
function SelectionStep({ onAcampante, onFamiliar }: { onAcampante: () => void; onFamiliar: () => void }) {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
                <div className="text-5xl mb-2">🏕️</div>
                <h1 className="text-3xl font-bold tracking-tight">
                    ¡Bienvenido al Campamento!
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Antes de empezar, vamos a conectarte con tu familia. Esto nos ayuda a mantener 
                    informados a tus padres sobre tus aventuras en el campamento.
                </p>
            </div>

            <div className="grid gap-4">
                <Card 
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-emerald-400 group border-2"
                    onClick={onAcampante}
                >
                    <CardHeader className="pb-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                            <Tent className="w-7 h-7 text-white" />
                        </div>
                        <CardTitle className="text-xl">¡Quiero ser Acampante! 🎒</CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                            Crea tu grupo familiar y recibirás un <strong>código único</strong> de 6 caracteres. 
                            Compartíselo con tus padres o tutores para que ellos también puedan 
                            acceder a la app y seguir tu experiencia.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card 
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-400 group border-2"
                    onClick={onFamiliar}
                >
                    <CardHeader className="pb-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <CardTitle className="text-xl">Soy Papá, Mamá o Tutor 👨‍👩‍👧</CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                            ¿Tu hijo/a ya se registró? Pedile el <strong>código de 6 caracteres</strong> que 
                            le dieron y usalo acá para vincularte a su grupo familiar.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}

// Step 2A: Acampante crea familia
function AcampanteStep({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
    const [apellidoFamilia, setApellidoFamilia] = useState("");
    const [rol, setRol] = useState("HIJO");
    const crearFamilia = useCrearFamilia();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apellidoFamilia.trim()) {
            toast.error("Por favor ingresa tu apellido");
            return;
        }

        const nombreFamilia = `Familia ${apellidoFamilia.trim()}`;

        try {
            await crearFamilia.mutateAsync({ nombreFamilia, rol });
            onSuccess();
        } catch (error) {
            console.error("Error creando familia:", error);
            toast.error("Error al crear la familia. Intenta nuevamente.");
        }
    };

    return (
        <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-fit -ml-2 mb-2"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                </Button>
                <div className="text-3xl mb-1">🎉</div>
                <CardTitle>¡Genial! Creemos tu grupo familiar</CardTitle>
                <CardDescription className="leading-relaxed">
                    Una vez creado, vas a recibir un <strong>código único</strong> que podés compartir 
                    con tus papás por WhatsApp. Ellos lo usarán para conectarse a tu cuenta y estar 
                    al tanto de todo lo del campamento.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="apellidoFamilia">¿Cuál es tu apellido?</Label>
                        <Input
                            id="apellidoFamilia"
                            placeholder="Ej: García, López, Martínez"
                            value={apellidoFamilia}
                            onChange={(e) => setApellidoFamilia(e.target.value)}
                            disabled={crearFamilia.isPending}
                            className="text-lg"
                        />
                        {apellidoFamilia && (
                            <p className="text-sm text-muted-foreground">
                                Tu grupo se llamará <strong>"Familia {apellidoFamilia}"</strong>
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rol">¿Sos hijo o hija?</Label>
                        <Select value={rol} onValueChange={setRol} disabled={crearFamilia.isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES_ACAMPANTE.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-12 text-base"
                        disabled={crearFamilia.isPending || !apellidoFamilia.trim()}
                    >
                        {crearFamilia.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            "🚀 Crear y Obtener mi Código"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}


// Step 2B: Familiar se une con código
function FamiliarStep({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
    const [codigo, setCodigo] = useState("");
    const [rol, setRol] = useState("PADRE");
    const validacion = useValidarCodigo(codigo);
    const unirse = useUnirseConCodigo();

    const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Solo letras y números, máximo 6 caracteres, auto mayúsculas
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
        setCodigo(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (codigo.length !== 6) {
            toast.error("El código debe tener 6 caracteres");
            return;
        }

        try {
            await unirse.mutateAsync({ codigo, rol });
            onSuccess();
        } catch (error: unknown) {
            console.error("Error uniéndose a familia:", error);
            const message = error instanceof Error ? error.message : "Error al unirse";
            if (message.includes("ya pertenece")) {
                toast.error("Ya perteneces a una familia");
            } else if (message.includes("inválido")) {
                toast.error("Código inválido");
            } else {
                toast.error("Error al unirse a la familia. Intenta nuevamente.");
            }
        }
    };

    const codigoValido = validacion.data?.valido === true;
    const familiaNombre = validacion.data?.nombreFamilia;

    return (
        <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-fit -ml-2 mb-2"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                </Button>
                <div className="text-3xl mb-1">👨‍👩‍👧</div>
                <CardTitle>Vinculación Familiar</CardTitle>
                <CardDescription className="leading-relaxed">
                    Tu hijo/a debería haberte compartido un <strong>código de 6 caracteres</strong> (letras y números). 
                    Ingresalo abajo para conectarte a su grupo familiar y poder seguir su experiencia en el campamento.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="codigo">Código de Vinculación</Label>
                        <Input
                            id="codigo"
                            placeholder="ABC123"
                            value={codigo}
                            onChange={handleCodigoChange}
                            disabled={unirse.isPending}
                            className="text-center text-2xl font-mono tracking-widest"
                            maxLength={6}
                        />
                        
                        {/* Validación en tiempo real */}
                        {codigo.length === 6 && (
                            <div className="text-sm">
                                {validacion.isLoading && (
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Verificando...
                                    </span>
                                )}
                                {codigoValido && familiaNombre && (
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                        ✓ {familiaNombre}
                                    </span>
                                )}
                                {validacion.data && !codigoValido && (
                                    <span className="text-destructive">
                                        ✗ Código no encontrado
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rol">Tu parentesco</Label>
                        <Select value={rol} onValueChange={setRol} disabled={unirse.isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES_FAMILIAR.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-12 text-base"
                        disabled={unirse.isPending || codigo.length !== 6 || !codigoValido}
                    >
                        {unirse.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Conectando...
                            </>
                        ) : (
                            "✨ Vincularme a la Familia"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

