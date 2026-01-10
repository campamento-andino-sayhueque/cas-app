import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Save, Send, Upload } from 'lucide-react';
import type { TipoDocumento, DocumentoCompletado, CampoFormulario } from '../../api/schemas/documentos';

interface FormularioDocumentoProps {
    tipo: TipoDocumento;
    documento: DocumentoCompletado | null;
    onGuardar: (respuestas: Record<string, string>, finalizar: boolean) => void;
    guardando: boolean;
}

export function FormularioDocumento({
    tipo,
    documento,
    onGuardar,
    guardando
}: FormularioDocumentoProps) {
    const [respuestas, setRespuestas] = useState<Record<string, string>>({});

    // Inicializar respuestas desde documento existente
    useEffect(() => {
        if (documento?.respuestas) {
            setRespuestas(documento.respuestas);
        }
    }, [documento]);

    const handleChange = (codigo: string, valor: string) => {
        setRespuestas(prev => ({ ...prev, [codigo]: valor }));
    };

    const handleGuardarBorrador = () => {
        onGuardar(respuestas, false);
    };

    const handleFinalizar = () => {
        onGuardar(respuestas, true);
    };

    // Agrupar campos por sección
    const camposPorSeccion = tipo.campos.reduce((acc, campo) => {
        const seccion = campo.seccion || 'General';
        if (!acc[seccion]) acc[seccion] = [];
        acc[seccion].push(campo);
        return acc;
    }, {} as Record<string, CampoFormulario[]>);

    const secciones = Object.keys(camposPorSeccion);

    // Validar condiciones de campos
    const campoVisible = (campo: CampoFormulario) => {
        if (!campo.campoPadreCodigo) return true;
        const valorPadre = respuestas[campo.campoPadreCodigo];
        return valorPadre === campo.campoPadreValor;
    };

    return (
        <div className="space-y-6">
            {tipo.descripcion && (
                <p className="text-muted-foreground text-sm">{tipo.descripcion}</p>
            )}

            {secciones.map((seccion, idx) => (
                <div key={seccion} className="space-y-4">
                    {idx > 0 && <Separator />}
                    <h3 className="font-semibold text-lg">{seccion}</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        {camposPorSeccion[seccion]
                            .filter(campoVisible)
                            .map(campo => (
                                <CampoDinamico
                                    key={campo.id}
                                    campo={campo}
                                    valor={respuestas[campo.codigo] || ''}
                                    onChange={(val) => handleChange(campo.codigo, val)}
                                />
                            ))}
                    </div>
                </div>
            ))}

            {/* Adjuntos requeridos */}
            {tipo.adjuntosRequeridos.length > 0 && (
                <>
                    <Separator />
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Documentos Adjuntos</h3>
                        <div className="grid gap-3">
                            {tipo.adjuntosRequeridos.map(adj => {
                                const archivoSubido = documento?.archivosAdjuntos.find(
                                    a => a.adjuntoCodigo === adj.codigo
                                );

                                return (
                                    <div
                                        key={adj.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {adj.nombre}
                                                {adj.obligatorio && <span className="text-red-500 ml-1">*</span>}
                                            </p>
                                            {adj.descripcion && (
                                                <p className="text-xs text-muted-foreground">{adj.descripcion}</p>
                                            )}
                                            {adj.requiereEntregaFisica && (
                                                <p className="text-xs text-blue-600">⚠ Requiere entrega física</p>
                                            )}
                                        </div>
                                        <div>
                                            {archivoSubido ? (
                                                <span className="text-green-600 text-sm">✓ {archivoSubido.nombreArchivo}</span>
                                            ) : (
                                                <Button variant="outline" size="sm" disabled>
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Subir
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Los adjuntos se pueden subir después de guardar el formulario.
                        </p>
                    </div>
                </>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
                <Button
                    variant="outline"
                    onClick={handleGuardarBorrador}
                    disabled={guardando}
                >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar borrador
                </Button>
                <Button
                    onClick={handleFinalizar}
                    disabled={guardando}
                >
                    <Send className="h-4 w-4 mr-2" />
                    Finalizar
                </Button>
            </div>
        </div>
    );
}

// ============================================
// Campo dinámico
// ============================================

function CampoDinamico({
    campo,
    valor,
    onChange
}: {
    campo: CampoFormulario;
    valor: string;
    onChange: (val: string) => void;
}) {
    const id = `campo-${campo.id}`;

    const LabelComponent = () => (
        <Label htmlFor={id}>
            {campo.etiqueta}
            {campo.obligatorio && <span className="text-red-500 ml-1">*</span>}
        </Label>
    );

    switch (campo.tipoCampo) {
        case 'BOOLEAN':
            return (
                <div className="flex items-center gap-2 col-span-1">
                    <Checkbox
                        id={id}
                        checked={valor === 'true'}
                        onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
                    />
                    <LabelComponent />
                </div>
            );

        case 'TEXTAREA':
            return (
                <div className="space-y-2 col-span-2">
                    <LabelComponent />
                    <Textarea
                        id={id}
                        value={valor}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={campo.placeholder || ''}
                        rows={3}
                    />
                </div>
            );

        case 'SELECCION':
            return (
                <div className="space-y-2">
                    <LabelComponent />
                    <Select value={valor} onValueChange={onChange}>
                        <SelectTrigger id={id}>
                            <SelectValue placeholder={campo.placeholder || 'Seleccionar...'} />
                        </SelectTrigger>
                        <SelectContent>
                            {campo.opciones?.map(opcion => (
                                <SelectItem key={opcion} value={opcion}>
                                    {opcion}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );

        case 'FECHA':
            return (
                <div className="space-y-2">
                    <LabelComponent />
                    <Input
                        id={id}
                        type="date"
                        value={valor}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            );

        case 'NUMERO':
            return (
                <div className="space-y-2">
                    <LabelComponent />
                    <Input
                        id={id}
                        type="number"
                        value={valor}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={campo.placeholder || ''}
                    />
                </div>
            );

        case 'EMAIL':
            return (
                <div className="space-y-2">
                    <LabelComponent />
                    <Input
                        id={id}
                        type="email"
                        value={valor}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={campo.placeholder || ''}
                    />
                </div>
            );

        case 'TELEFONO':
            return (
                <div className="space-y-2">
                    <LabelComponent />
                    <Input
                        id={id}
                        type="tel"
                        value={valor}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={campo.placeholder || ''}
                    />
                </div>
            );

        case 'TEXTO':
        default:
            return (
                <div className="space-y-2">
                    <LabelComponent />
                    <Input
                        id={id}
                        type="text"
                        value={valor}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={campo.placeholder || ''}
                    />
                </div>
            );
    }
}
