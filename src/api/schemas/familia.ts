import { array, boolean, nullable, object, string, type InferOutput } from "valibot";

// Schema para miembro de familia
export const MiembroFamiliaSchema = object({
    usuarioUid: string(),
    nombre: string(),
    email: string(),
    rol: string(),
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

// Request types (no need for schemas, just types)
export interface CrearFamiliaRequest {
    nombreFamilia: string;
    rol?: string;
}

export interface UnirseConCodigoRequest {
    codigo: string;
    rol: string;
}
