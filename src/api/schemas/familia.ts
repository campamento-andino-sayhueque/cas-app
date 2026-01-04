import { array, boolean, nullable, object, string, type InferOutput } from "valibot";

// Schema para miembro de familia
export const MiembroFamiliaSchema = object({
    usuarioUid: string(),
    nombre: string(),
    email: string(),
    relacion: nullable(string()), // null para creadores de familia sin relación específica
    esResponsableEconomico: boolean()
});

export type MiembroFamilia = InferOutput<typeof MiembroFamiliaSchema>;

// Schema para "Mi Familia" response (incluye código de vinculación)
export const MiFamiliaSchema = object({
    uid: nullable(string()),
    nombre: nullable(string()),
    codigoVinculacion: nullable(string()),
    notas: nullable(string()),
    esResponsable: boolean(),
    miembros: array(MiembroFamiliaSchema)
});

export type MiFamilia = InferOutput<typeof MiFamiliaSchema>;

// Schema para validación de código
export const ValidarCodigoSchema = object({
    valido: boolean(),
    nombreFamilia: nullable(string())
});

export type ValidarCodigo = InferOutput<typeof ValidarCodigoSchema>;

// Schema para regenerar código response
export const RegenerarCodigoSchema = object({
    nuevoCodigo: string()
});

export type RegenerarCodigo = InferOutput<typeof RegenerarCodigoSchema>;

// Request types
export interface CrearFamiliaRequest {
    nombreFamilia: string;
    // Ya no necesita rol - el creador siempre es responsable económico
}

export interface UnirseConCodigoRequest {
    codigo: string;
    relacion: string; // RelacionFamiliar: PADRE, MADRE, HIJO, TUTOR, ABUELO, OTRO
}
