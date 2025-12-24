/**
 * Schemas de Valibot para el módulo de Pagos
 */

import {
  object,
  string,
  number,
  boolean,
  optional,
  array,
  enum_,
  nullable,
  union,
  pipe,
  transform,
  any,
  type InferOutput
} from 'valibot';

// ============================================
// Enums
// ============================================

export enum EstrategiaPlan {
  PLAN_A = 'PLAN_A',    // Plan principal con descuento
  PLAN_B = 'PLAN_B'     // Plan contingencia/tardío
}

export const EstrategiaPlanSchema = enum_(EstrategiaPlan);

// Helper for Java Money JSON structure
const MoneyJsonSchema = object({
  source: string(),
  parsedValue: number()
});

// Helper for Months (can be string 'JULY' or number 7)
const MonthSchema = union([string(), number()]);

// ============================================
// Schemas: Plan de Pago (Model / Response)
// ============================================

export const PlanPagoSchema = object({
  id: optional(number()),
  codigo: string(),
  nombre: string(),
  anio: number(),
  // Transform complex money object to simple number if needed, or accept number directly
  montoTotal: union([
    number(), 
    pipe(
      MoneyJsonSchema,
      transform((input) => input.parsedValue)
    )
  ]),
  moneda: optional(string()), // Added
  diaVencimiento: optional(number()), // Added
  montoCuotaFija: optional(number()), // Added
  estrategia: optional(EstrategiaPlanSchema),
  // Recursively optional planDestino or just any for now to avoid complexity
  planDestino: optional(any()), 
  minCuotas: optional(number()),
  maxCuotas: optional(number()),
  mesInicio: MonthSchema, 
  mesFin: MonthSchema,    
  activo: boolean(),
  // Campos de vinculación Plan A → Plan B
  planDestinoId: optional(nullable(number())),
  planDestinoCodigo: optional(nullable(string())),
  mesInicioControlAtraso: optional(nullable(number())),
  cuotasMinimasAntesControl: optional(nullable(number())),
  mesesAtrasoParaTransicion: optional(nullable(number())),
});

export type PlanPago = InferOutput<typeof PlanPagoSchema>;

// ============================================
// Schemas: Plan de Pago (Request / Form)
// ============================================

export const PlanPagoRequestSchema = object({
  codigo: string(),
  anio: number(),
  nombreParaMostrar: string(),
  montoTotal: number(),
  moneda: string(),
  estrategia: EstrategiaPlanSchema,
  diaVencimiento: number(),
  montoCuotaFija: optional(number()),
  mesInicioHabilitado: number(), // 1-12
  mesFinHabilitado: number(),    // 1-12
  minCuotas: optional(number()),
  maxCuotas: optional(number()),
  activo: boolean(),
  
  // Campos para crear Plan B automáticamente (solo cuando estrategia = PLAN_A)
  montoTotalPlanB: optional(number()),
  codigoPlanB: optional(string()),
  nombrePlanB: optional(string()),
  
  // Reglas de transición
  mesInicioControlAtraso: optional(number()),      // Mes a partir del cual aplica control de atraso (ej: 7 = Julio)
  cuotasMinimasAntesControl: optional(number()),   // Cuotas mínimas antes del mes de control
  mesesAtrasoParaTransicion: optional(number()),   // Meses de atraso para activar transición (default: 2)
});

export type PlanPagoRequest = InferOutput<typeof PlanPagoRequestSchema>;

// ============================================
// Schemas: Cuota
// ============================================

export const CuotaSchema = object({
  nroCuota: number(),
  vencimiento: string(), // ISO Date
  montoOriginal: number(),
  montoActual: number(),
  estado: string(), // 'PENDIENTE', 'PAGADA', 'VENCIDA'
  fechaPago: optional(string()),
});

export type Cuota = InferOutput<typeof CuotaSchema>;

// ============================================
// Schemas: Inscripción
// ============================================

export const InscripcionSchema = object({
  idInscripcion: number(),
  plan: PlanPagoSchema,
  estado: string(),
  fechaInscripcion: string(),
  cuotas: array(CuotaSchema),
});

export type Inscripcion = InferOutput<typeof InscripcionSchema>;

// ============================================
// Schemas: Inscripción Request
// ============================================

export const InscripcionRequestSchema = object({
  idUsuario: string(),
  codigoPlan: string(),
  mesInicio: string(), // Month name e.g. "MARCH"
  cuotasDeseadas: number(),
});

export type InscripcionRequest = InferOutput<typeof InscripcionRequestSchema>;

// ============================================
// Schemas: Intención de Pago
// ============================================

export const IntencionPagoRequestSchema = object({
  idInscripcion: number(),
  nroCuota: number(),
});

export type IntencionPagoRequest = InferOutput<typeof IntencionPagoRequestSchema>;

export const IntencionPagoResponseSchema = object({
  id: number(),
  preferenceId: optional(string()),
  urlRedireccion: optional(string()), // For MP Redirect
  monto: number(),
  idInscripcion: number(),
});

export type IntencionPagoResponse = InferOutput<typeof IntencionPagoResponseSchema>;
