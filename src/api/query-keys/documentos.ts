/**
 * Query keys para el módulo de Documentos
 */

export const documentosKeys = {
    all: ['documentos'] as const,

    // Tipos de documento
    tipos: () => [...documentosKeys.all, 'tipos'] as const,
    tipo: (id: number) => [...documentosKeys.tipos(), id] as const,
    tipoPorCodigo: (codigo: string) => [...documentosKeys.tipos(), 'codigo', codigo] as const,

    // Documentos de familia
    resumenFamilia: (familiaId: number) => [...documentosKeys.all, 'familia', familiaId, 'resumen'] as const,

    // Documentos de usuario
    documentosUsuario: (usuarioId: number) => [...documentosKeys.all, 'usuario', usuarioId] as const,
    documento: (tipoDocumentoId: number, usuarioId: number) =>
        [...documentosKeys.all, 'tipo', tipoDocumentoId, 'usuario', usuarioId] as const,
};
