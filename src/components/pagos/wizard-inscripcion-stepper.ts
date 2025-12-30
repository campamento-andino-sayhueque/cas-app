/**
 * Definición del stepper para el wizard de inscripción a planes de pago.
 * Archivo separado para evitar problemas con Fast Refresh de Vite.
 */

import { defineStepper } from "@stepperize/react";
import { object } from "valibot";

export const InscripcionStepper = defineStepper(
    { id: "detalles", title: "Detalles", schema: object({}) },
    { id: "compromiso", title: "Compromiso", schema: object({}) },
    { id: "confirmacion", title: "Confirmar", schema: object({}) }
);
