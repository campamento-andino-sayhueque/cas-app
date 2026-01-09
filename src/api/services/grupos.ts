import { object, string, type InferOutput } from "valibot";
import { client } from "../client";

// Schema para grupo
export const GrupoSchema = object({
    id: string(),
    nombre: string(),
    path: string(),
});

export type Grupo = InferOutput<typeof GrupoSchema>;

// Schema para grupo con conteo de subgrupos
export const GrupoConSubgruposSchema = object({
    id: string(),
    nombre: string(),
    path: string(),
    cantidadSubgrupos: string(),
});

export const gruposService = {
    /**
     * Lista todos los grupos.
     */
    listarTodos: async (): Promise<Grupo[]> => {
        const response = await client.get('/grupos');
        return response.data;
    },

    /**
     * Lista los grupos de acampantes.
     */
    listarGruposAcampantes: async (): Promise<Grupo[]> => {
        const response = await client.get('/grupos/acampantes');
        return response.data;
    },

    /**
     * Lista los grupos de dirigentes.
     */
    listarGruposDirigentes: async (): Promise<Grupo[]> => {
        const response = await client.get('/grupos/dirigentes');
        return response.data;
    },

    /**
     * Crea un nuevo grupo de acampantes.
     */
    crearGrupoAcampantes: async (nombre: string): Promise<Grupo> => {
        const response = await client.post('/grupos/acampantes', { nombre });
        return response.data;
    },

    /**
     * Obtiene los grupos de un usuario.
     */
    obtenerGruposUsuario: async (usuarioId: number): Promise<Grupo[]> => {
        const response = await client.get(`/usuarios/${usuarioId}/grupos`);
        return response.data;
    },

    /**
     * Agrega un usuario a un grupo.
     */
    agregarUsuarioAGrupo: async (usuarioId: number, grupoId: string): Promise<void> => {
        await client.post(`/usuarios/${usuarioId}/grupos/${grupoId}`);
    },

    /**
     * Remueve un usuario de un grupo.
     */
    removerUsuarioDeGrupo: async (usuarioId: number, grupoId: string): Promise<void> => {
        await client.delete(`/usuarios/${usuarioId}/grupos/${grupoId}`);
    },

    /**
     * Obtiene los miembros de un grupo.
     */
    obtenerMiembrosGrupo: async (grupoId: string): Promise<MiembroGrupo[]> => {
        const response = await client.get(`/grupos/${grupoId}/miembros`);
        return response.data;
    },
};

// Types adicionales
export interface MiembroGrupo {
    keycloakId: string;
    email: string;
    nombreMostrar: string;
}
