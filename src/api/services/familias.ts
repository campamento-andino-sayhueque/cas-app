import { parse } from "valibot";
import { client } from "../client";
import { 
    MiFamiliaSchema, 
    ValidarCodigoSchema, 
    RegenerarCodigoSchema,
    type MiFamilia, 
    type ValidarCodigo,
    type RegenerarCodigo,
    type CrearFamiliaRequest,
    type UnirseConCodigoRequest
} from "../schemas/familia";

export const familiasService = {
    /**
     * Obtiene la familia del usuario autenticado.
     * Retorna un objeto con uid null si no tiene familia.
     */
    obtenerMiFamilia: async (): Promise<MiFamilia> => {
        const response = await client.get('/familias/mi-familia');
        return parse(MiFamiliaSchema, response.data);
    },

    /**
     * Crea una nueva familia y asigna al usuario como administrador.
     * Usado en el onboarding - opción "Soy Nuevo Tutor".
     */
    crearConPerfil: async (data: CrearFamiliaRequest): Promise<MiFamilia> => {
        const response = await client.post('/familias/crear-con-perfil', data);
        return parse(MiFamiliaSchema, response.data);
    },

    /**
     * Valida si un código de vinculación existe.
     */
    validarCodigo: async (codigo: string): Promise<ValidarCodigo> => {
        const response = await client.get(`/familias/validar-codigo/${codigo.toUpperCase()}`);
        return parse(ValidarCodigoSchema, response.data);
    },

    /**
     * Une al usuario a una familia usando código de vinculación.
     * Usado en el onboarding - opción "Tengo un Código".
     */
    unirseConCodigo: async (data: UnirseConCodigoRequest): Promise<MiFamilia> => {
        const response = await client.post('/familias/unirse', {
            codigo: data.codigo.toUpperCase(),
            relacion: data.relacion
        });
        return parse(MiFamiliaSchema, response.data);
    },

    /**
     * Regenera el código de vinculación de una familia.
     */
    regenerarCodigo: async (familiaUid: string): Promise<RegenerarCodigo> => {
        const response = await client.post(`/familias/${familiaUid}/regenerar-codigo`);
        return parse(RegenerarCodigoSchema, response.data);
    }
};
