import { array, boolean, number, object, optional, string, type InferOutput } from "valibot";

export const UsuarioSchema = object({
    id: number(), 
    email: string(),
    nombreMostrar: string(), 
    roles: array(string()), 
    estado: string(), 
    urlFoto: optional(string()),
    perfilCompleto: boolean()
})

export type Usuario = InferOutput<typeof UsuarioSchema>;
