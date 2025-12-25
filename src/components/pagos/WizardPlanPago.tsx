/**
 * Wizard para Creación de Planes de Pago - Plan A + Plan B Unificado
 * 
 * Flujo Refinado:
 * 1. Plan A: Datos básicos + Día Vencimiento
 * 2. Plan B: Datos contingencia
 * 3. Reglas: Transición + Visualización Timeline (Roja en mes de control)
 * 4. Revisión
 */

import { useForm } from "@tanstack/react-form";
// Standard Schema support is native now
import { defineStepper } from "@stepperize/react";
import { 
  type PlanPagoRequest, 
  EstrategiaPlan 
} from "../../api/schemas/pagos";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { 
  InfoIcon, 
  CheckCircle2,
  LayoutList,
  DollarSign,
  GitBranch,
  FileCheck,
  CalendarDays,
} from "lucide-react";
import React from 'react';
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { 
  pipe, 
  minLength, 
  minValue, 
  number, 
  string, 
  object, 
  boolean, 
  optional,
  safeParse
} from "valibot";

// --- Schemas por Paso ---

// --- Schemas por Paso ---

const DatosGeneralesSchema = object({
  nombreParaMostrar: pipe(string(), minLength(3, 'El nombre es obligatorio (min 3 caracteres)')),
  anio: pipe(number(), minValue(2020, 'Año inválido')),
  montoTotal: pipe(number(), minValue(1000, 'El monto debe ser al menos 1000')),
  activo: boolean(),
  moneda: string(),
  estrategia: string(),
});

const VigenciaSchema = object({
  mesInicioHabilitado: number(),
  mesFinHabilitado: number(),
  diaVencimiento: number(),
});

const Step2Schema = object({
  montoTotalPlanB: pipe(number(), minValue(0, 'El monto no puede ser negativo')),
  nombrePlanB: optional(string()),
  codigoPlanB: optional(string()),
});

const Step3Schema = object({
  mesInicioControlAtraso: number(),
  cuotasMinimasAntesControl: pipe(number(), minValue(1, 'Mínimo 1 cuota')),
  mesesAtrasoParaTransicion: pipe(number(), minValue(1, 'Mínimo 1 mes')),
});

// Flujo
export const GlobalStepper = defineStepper(
  { id: "datos_generales", title: "Datos Grales.", schema: DatosGeneralesSchema },
  { id: "vigencia", title: "Vigencia", schema: VigenciaSchema },
  { id: "planB", title: "Plan B", schema: Step2Schema },
  { id: "reglas", title: "Reglas", schema: Step3Schema },
  { id: "revision", title: "Revisión", schema: object({}) }
);

interface WizardPlanPagoProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (datos: PlanPagoRequest) => void;
  cargando: boolean;
}

const STEP_ICONS = {
  datos_generales: LayoutList,
  vigencia: CalendarDays,
  planB: DollarSign,
  reglas: GitBranch,
  revision: FileCheck,
};

const MESES = [
  { val: 1, label: 'Enero' },
  { val: 2, label: 'Febrero' },
  { val: 3, label: 'Marzo' },
  { val: 4, label: 'Abril' },
  { val: 5, label: 'Mayo' },
  { val: 6, label: 'Junio' },
  { val: 7, label: 'Julio' },
  { val: 8, label: 'Agosto' },
  { val: 9, label: 'Septiembre' },
  { val: 10, label: 'Octubre' },
  { val: 11, label: 'Noviembre' },
  { val: 12, label: 'Diciembre' },
];

// Helper to map month name to number
// Removed unused monthToNum

export function WizardPlanPago(props: WizardPlanPagoProps) {
  return (
    <GlobalStepper.Scoped>
      <WizardPlanPagoContent {...props} />
    </GlobalStepper.Scoped>
  );
}

function WizardPlanPagoContent({ abierto, onCerrar, onGuardar, cargando }: WizardPlanPagoProps) {
  const stepper = GlobalStepper.useStepper();

  const form = useForm({
    defaultValues: {
      codigo: "",
      anio: new Date().getFullYear(),
      nombreParaMostrar: "",
      montoTotal: 0,
      moneda: "ARS",
      estrategia: EstrategiaPlan.PLAN_A,
      diaVencimiento: 10,
      montoCuotaFija: undefined,
      mesInicioHabilitado: 4, // Abril
      mesFinHabilitado: 1, // Enero
      minCuotas: 10, 
      maxCuotas: 10,
      activo: true,
      
      montoTotalPlanB: 0,
      codigoPlanB: "",
      nombrePlanB: "",
      
      mesInicioControlAtraso: 7, // Julio
      cuotasMinimasAntesControl: 4,
      mesesAtrasoParaTransicion: 2,
    } as PlanPagoRequest,
    onSubmit: async ({ value }) => {
      const finalData = { ...value };
      
      // Auto-calcular min/max cuotas basado en vigencia
      const start = finalData.mesInicioHabilitado;
      const end = finalData.mesFinHabilitado;
      const totalMonths = end >= start ? (end - start + 1) : (12 - start + 1) + end;
      
      // Plan A es estricto: la cantidad de cuotas es igual a la cantidad de meses
      finalData.minCuotas = totalMonths;
      finalData.maxCuotas = totalMonths;

      if (!finalData.codigo) {
        finalData.codigo = `PLAN-A-${finalData.anio}`;
      }
      if (!finalData.codigoPlanB) {
        finalData.codigoPlanB = `PLAN-B-${finalData.anio}`;
      }
      if (!finalData.nombrePlanB) {
        finalData.nombrePlanB = `${finalData.nombreParaMostrar} (Plan B)`;
      }
      onGuardar(finalData);
    },
  });

  const handleNext = () => {
    const currentStepId = stepper.current.id;
    let stepSchema: any;

    if (currentStepId === 'datos_generales') stepSchema = DatosGeneralesSchema;
    else if (currentStepId === 'vigencia') stepSchema = VigenciaSchema;
    else if (currentStepId === 'planB') stepSchema = Step2Schema;
    else if (currentStepId === 'reglas') stepSchema = Step3Schema;
    else {
      stepper.next();
      return;
    }

    const { values } = form.state;
    // Valibot validation
    const result = safeParse(stepSchema, values);

    if (result.success) {
      // Basic logic validation
      if (currentStepId === 'planB') {
        const montoA = values.montoTotal || 0;
        const montoB = values.montoTotalPlanB || 0;
        if (montoB <= montoA) {
          form.setFieldMeta('montoTotalPlanB', (prev) => ({
             ...prev, errorMap: { onChange: 'El monto del Plan B debe ser mayor al Plan A' },
             errors: ['El monto del Plan B debe ser mayor al Plan A'],
             isTouched: true,
          }));
          return;
        }
      }

      stepper.next();
    } else {
      // Mapping errors
      result.issues.forEach((issue) => {
        const path = issue.path;
        if (path && path.length > 0) {
            const firstItem = path[0] as any;
            const fieldName = firstItem.key as string;
            // @ts-ignore 
            form.setFieldMeta(fieldName, (prev) => ({
               ...prev,
               errorMap: { onChange: issue.message, onBlur: issue.message },
               errors: [issue.message],
               isTouched: true,
            }));
        }
      });
    }
  };

  const handleBack = () => stepper.prev();

  const handleConfirmar = () => {
    const { values } = form.state;
    const finalData = { ...values };
    
    // Auto-calcular min/max cuotas basado en vigencia
    const start = finalData.mesInicioHabilitado;
    const end = finalData.mesFinHabilitado;
    const totalMonths = end >= start ? (end - start + 1) : (12 - start + 1) + end;
    
    // Plan A es estricto: la cantidad de cuotas es igual a la cantidad de meses
    finalData.minCuotas = totalMonths;
    finalData.maxCuotas = totalMonths;

    if (!finalData.codigo) {
      finalData.codigo = `PLAN-A-${finalData.anio}`;
    }
    if (!finalData.codigoPlanB) {
      finalData.codigoPlanB = `PLAN-B-${finalData.anio}`;
    }
    if (!finalData.nombrePlanB) {
      finalData.nombrePlanB = `${finalData.nombreParaMostrar} (Plan B)`;
    }
    onGuardar(finalData);
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Plan de Pago Unificado</DialogTitle>
        </DialogHeader>

        <nav aria-label="Pasos del Plan" className="group my-4 px-4">
          <ol className="flex items-center justify-between gap-2">
            {stepper.all.map((step, index, array) => {
              const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS];
              const currentIndex = stepper.all.indexOf(stepper.current);
              const isActiveOrCompleted = index <= currentIndex;
              const isCurrent = stepper.current.id === step.id;

              return (
                <React.Fragment key={step.id}>
                  <li className="flex items-center gap-4 flex-shrink-0">
                    <Button
                      type="button"
                      variant={isActiveOrCompleted ? 'default' : 'secondary'}
                      className="flex size-10 items-center justify-center rounded-full p-0"
                      onClick={() => {
                         // Permitir navegar atrás libremente, pero adelante solo si ya pasaste
                         if (index < currentIndex) stepper.goTo(step.id as any);
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </Button>
                    <span className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground hidden md:block'}`}>
                      {step.title}
                    </span>
                  </li>
                  {index < array.length - 1 && (
                    <Separator
                      className={`flex-1 h-[2px] ${
                        index < currentIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </nav>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6 py-4 px-1"
        >
          {stepper.switch({
            datos_generales: () => <StepDatosGenerales form={form} />,
            vigencia: () => <StepVigencia form={form} />,
            planB: () => <StepPlanB form={form} />,
            reglas: () => <StepReglas form={form} />,
            revision: () => <StepRevision form={form} />,
          })}

          <DialogFooter className="flex justify-between sm:justify-between px-1">
            <Button type="button" variant="outline" onClick={stepper.isFirst ? onCerrar : handleBack}>
              {stepper.isFirst ? "Cancelar" : "Atrás"}
            </Button>
            
            {stepper.isLast ? (
              <Button type="button" onClick={handleConfirmar} disabled={cargando}>
                {cargando ? "Guardando..." : "Confirmar y Crear"}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Siguiente
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StepDatosGenerales({ form }: { form: any }) {
  const formatCurrency = (val: number) => {
    if (!val && val !== 0) return "";
    return Number(val).toLocaleString("es-AR");
  };

  const parseCurrency = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "");
    return clean ? Number(clean) : 0;
  };

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 pb-2 border-b">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <LayoutList className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Datos Generales</h3>
          <p className="text-xs text-muted-foreground">Información básica del plan de pago.</p>
        </div>
      </div>

      <div className="space-y-4">
        <form.Field 
          name="nombreParaMostrar" 
        >
          {(field: any) => (
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Plan</Label>
              <Input 
                id="nombre" 
                placeholder="Ej. Campamento Andino 2026"
                value={field.state.value} 
                onChange={e => field.handleChange(e.target.value)} 
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors.length > 0 && (
                 <p className="text-xs text-red-500">
                   {Array.from(new Set(field.state.meta.errors.map((err: any) => typeof err === 'object' ? err.message : String(err)))).join(", ")}
                 </p>
              )}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="anio">
            {(field: any) => (
              <div className="space-y-2">
                <Label htmlFor="anio">Año del Evento</Label>
                <Input type="number" id="anio" value={field.state.value} onChange={e => field.handleChange(Number(e.target.value))} />
                {field.state.meta.errors.length > 0 && (
                   <p className="text-xs text-red-500">
                     {Array.from(new Set(field.state.meta.errors.map((err: any) => typeof err === 'object' ? err.message : String(err)))).join(", ")}
                   </p>
                )}
              </div>
            )}
          </form.Field>
          
          <form.Field 
            name="montoTotal"
          >
            {(field: any) => (
              <div className="space-y-2">
                <Label htmlFor="montoTotal">Monto Total Plan A</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="montoTotal" 
                    value={formatCurrency(field.state.value)} 
                    onChange={e => field.handleChange(parseCurrency(e))}
                    className={`pl-7 ${field.state.meta.errors.length ? "border-red-500" : ""}`}
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                   <p className="text-xs text-red-500">
                     {Array.from(new Set(field.state.meta.errors.map((err: any) => typeof err === 'object' ? err.message : String(err)))).join(", ")}
                   </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="activo">
          {(field: any) => (
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="activo" checked={field.state.value} onCheckedChange={field.handleChange} />
              <Label htmlFor="activo">Habilitar plan inmediatamente para inscripciones</Label>
            </div>
          )}
        </form.Field>
      </div>
    </div>
  );
}

function StepVigencia({ form }: { form: any }) {
  const anioPlan = form.getFieldValue('anio') || new Date().getFullYear();

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 pb-2 border-b">
         <div className="p-2 rounded-full bg-blue-100 text-blue-600">
            <CalendarDays className="w-5 h-5" />
         </div>
         <div>
            <h3 className="text-lg font-medium">Vigencia y Vencimientos</h3>
            <p className="text-xs text-muted-foreground">Define cuándo empieza y termina el plan de pagos.</p>
         </div>
      </div>

      <div className="space-y-6">
         <form.Subscribe selector={(state: any) => [state.values.mesInicioHabilitado, state.values.mesFinHabilitado]}>
            {([inicio, fin]: any[]) => (
               <TimelinePreview 
                  start={inicio} 
                  end={fin} 
               />
            )}
         </form.Subscribe>

         <div className="grid grid-cols-2 gap-4">
            <form.Field name="mesInicioHabilitado">
               {(field: any) => (
                 <div className="space-y-2">
                   <Label>Mes Inicio (Primera Cuota)</Label>
                   <Select value={String(field.state.value)} onValueChange={(v) => field.handleChange(Number(v))}>
                     <SelectTrigger className="bg-muted/20"><SelectValue /></SelectTrigger>
                     <SelectContent>
                       {MESES.map(m => (
                          <SelectItem key={m.val} value={String(m.val)}>
                             {m.label} <span className="text-muted-foreground text-xs ml-1">({anioPlan})</span>
                          </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               )}
            </form.Field>

            <form.Field name="mesFinHabilitado">
              {(field: any) => {
                 const inicio = form.getFieldValue('mesInicioHabilitado');
                 return (
                    <div className="space-y-2">
                      <Label>Mes Fin (Última Cuota)</Label>
                      <Select value={String(field.state.value)} onValueChange={(v) => field.handleChange(Number(v))}>
                        <SelectTrigger className="bg-muted/20"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {MESES.map(m => {
                             const isNextYear = inicio && m.val < inicio;
                             const yearDisplay = isNextYear ? anioPlan + 1 : anioPlan;
                             const highlight = isNextYear ? "text-orange-600 font-medium" : "text-muted-foreground";
                             
                             return (
                               <SelectItem key={m.val} value={String(m.val)}>
                                  {m.label} <span className={`${highlight} text-xs ml-1`}>({yearDisplay})</span>
                               </SelectItem>
                             );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                 );
              }}
            </form.Field>
         </div>

         <form.Field name="diaVencimiento">
            {(field: any) => (
              <div className="space-y-2">
                <Label>Día de Vencimiento Mensual</Label>
                <Select value={String(field.state.value)} onValueChange={(v) => field.handleChange(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar día" /></SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25].map(d => <SelectItem key={d} value={String(d)}>Día {d} de cada mes</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Fecha límite de pago para cada cuota.</p>
              </div>
            )}
         </form.Field>
      </div>
    </div>
  );
}

function StepPlanB({ form }: { form: any }) {
  const montoTotalA = form.getFieldValue('montoTotal') || 0;
  
  const formatCurrency = (val: number) => {
    if (!val && val !== 0) return "";
    return Number(val).toLocaleString("es-AR");
  };

  const parseCurrency = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "");
    return clean ? Number(clean) : 0;
  };

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 pb-2 border-b">
        <div className="p-2 rounded-full bg-orange-100 text-orange-600">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Plan B - Plan Contingencia</h3>
          <p className="text-xs text-muted-foreground">Se activa automáticamente cuando hay atrasos en Plan A.</p>
        </div>
      </div>

      <div className="space-y-4">
        <form.Field 
          name="montoTotalPlanB"
        >
          {(field: any) => (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="montoTotalPlanB">Monto Total Plan B</Label>
                <InfoTooltip text="Monto penalizado por atraso." />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <Input
                  id="montoTotalPlanB" 
                  value={formatCurrency(field.state.value)} 
                  onChange={e => field.handleChange(parseCurrency(e))}
                  className={`pl-7 ${field.state.meta.errors.length ? "border-red-500" : ""}`}
                />
              </div>
              {field.state.meta.errors ? (
                   <p className="text-xs text-red-500">
                     {Array.from(new Set(field.state.meta.errors.map((err: any) => typeof err === 'object' ? err.message : String(err)))).join(", ")}
                   </p>
              ) : null}
              {field.state.value > 0 && montoTotalA > 0 && field.state.value > montoTotalA && (
                <p className="text-xs text-orange-600 font-medium mt-1">
                  Recargo: +${formatCurrency(field.state.value - montoTotalA)}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="nombrePlanB">
          {(field: any) => (
            <div className="space-y-2">
              <Label htmlFor="nombrePlanB">Nombre Plan B (opcional)</Label>
              <Input 
                id="nombrePlanB" 
                placeholder="Se genera automáticamente"
                value={field.state.value} 
                onChange={e => field.handleChange(e.target.value)} 
              />
            </div>
          )}
        </form.Field>
      </div>
    </div>
  );
}

function StepReglas({ form }: { form: any }) {
  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 pb-2 border-b">
        <div className="p-2 rounded-full bg-violet-100 text-violet-600">
          <GitBranch className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Reglas de Transición</h3>
          <p className="text-xs text-muted-foreground">Configura cuándo y cómo se pasa de Plan A a Plan B.</p>
        </div>
      </div>
      
      <form.Subscribe selector={(state: any) => state.values}>
        {(values: any) => (
          <>
            <TimelinePreview 
               start={values.mesInicioHabilitado || 3} 
               end={values.mesFinHabilitado || 1} 
               controlMonth={values.mesInicioControlAtraso} 
               toleranceMonths={values.mesesAtrasoParaTransicion}
            />

            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-primary/5 p-3 rounded-md text-sm border border-primary/20">
                   <p className="font-medium text-primary mb-1">Lógica de Transición:</p>
                   <p className="text-muted-foreground leading-relaxed">
                     A partir de <strong>{MESES.find(m => m.val === values.mesInicioControlAtraso)?.label}</strong> (inclusive), 
                     comenzamos a controlar los pagos. <br/>
                     Para evitar la migración en ese mes, el usuario debería tener abonadas al menos <strong>{values.cuotasMinimasAntesControl} cuotas</strong>.<br/>
                     <span className="text-xs mt-1 block opacity-80">
                       * Si posteriormente acumula <strong>{values.mesesAtrasoParaTransicion} meses</strong> de deuda, migrará al Plan B.
                     </span>
                   </p>
                </div>

                <form.Field name="mesInicioControlAtraso">
                  {(field: any) => (
                    <div className="space-y-2">
                      <Label>Mes de Inicio de Control</Label>
                      <div className="flex gap-2 items-center">
                         <Select value={String(field.state.value)} onValueChange={(v) => field.handleChange(Number(v))}>
                          <SelectTrigger className="w-full border-l-4 border-l-red-500"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {MESES.map(m => <SelectItem key={m.val} value={String(m.val)}>{m.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Inicio (Rojo)</span>
                      </div>
                    </div>
                  )}
                </form.Field>

                <div className="grid grid-cols-2 gap-4">
                  <form.Field name="cuotasMinimasAntesControl">
                    {(field: any) => (
                      <div className="space-y-2">
                        <Label>Cuotas Mínimas Pagas</Label>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" type="button" 
                            onClick={() => field.handleChange(Math.max(1, field.state.value - 1))}>-</Button>
                          <span className="font-mono w-8 text-center">{field.state.value}</span>
                          <Button variant="outline" size="icon" type="button" 
                            onClick={() => field.handleChange(Math.min(12, field.state.value + 1))}>+</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Al llegar al mes de control.</p>
                        {field.state.meta.errors ? (
                            <p className="text-xs text-red-500">
                              {Array.from(new Set(field.state.meta.errors.map((err: any) => typeof err === 'object' ? err.message : String(err)))).join(", ")}
                            </p>
                        ) : null}
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="mesesAtrasoParaTransicion">
                    {(field: any) => (
                      <div className="space-y-2">
                        <Label>Meses Atraso Tolerados</Label>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" type="button" 
                            onClick={() => field.handleChange(Math.max(1, field.state.value - 1))}>-</Button>
                          <span className="font-mono w-8 text-center">{field.state.value}</span>
                          <Button variant="outline" size="icon" type="button" 
                            onClick={() => field.handleChange(Math.min(6, field.state.value + 1))}>+</Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-orange-600 font-medium">Zona de Tolerancia (Naranja)</p>
                        {field.state.meta.errors ? (
                            <p className="text-xs text-red-500">
                              {Array.from(new Set(field.state.meta.errors.map((err: any) => typeof err === 'object' ? err.message : String(err)))).join(", ")}
                            </p>
                        ) : null}
                      </div>
                    )}
                  </form.Field>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </form.Subscribe>
    </div>
  );
}

function StepRevision({ form }: { form: any }) {
  const formatCurrency = (val: number) => {
    if (!val && val !== 0) return "";
    return Number(val).toLocaleString("es-AR");
  };

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 pb-2 border-b">
        <div className="p-2 rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Revisión Final</h3>
          <p className="text-xs text-muted-foreground">Confirma los datos antes de crear los planes.</p>
        </div>
      </div>

      <form.Subscribe selector={(state: any) => state.values}>
        {(values: any) => (
          <div className="grid gap-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold text-primary mb-2">Plan A (Estricto)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Nombre:</span></div>
                  <div className="font-medium">{values.nombreParaMostrar}</div>
                  <div><span className="text-muted-foreground">Monto Total:</span></div>
                  <div className="font-medium">${formatCurrency(values.montoTotal)}</div>
                  <div><span className="text-muted-foreground">Vigencia:</span></div>
                  <div className="font-medium">
                    {MESES.find(m => m.val === values.mesInicioHabilitado)?.label} - {MESES.find(m => m.val === values.mesFinHabilitado)?.label}
                  </div>
                  <div><span className="text-muted-foreground">Vencimiento:</span></div>
                  <div className="font-medium">Día {values.diaVencimiento} de cada mes</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-orange-600 mb-2">Plan B (Contingencia)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Monto Total:</span></div>
                  <div className="font-medium">${formatCurrency(values.montoTotalPlanB)}</div>
                  <div><span className="text-muted-foreground">Activación:</span></div>
                  <div className="font-medium text-orange-600">Automática por atraso</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-200">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-violet-600 mb-2">Reglas</h4>
                <p className="text-sm text-muted-foreground">
                  El control de atrasos inicia en <strong>{MESES.find(m => m.val === values.mesInicioControlAtraso)?.label}</strong>.
                  Si un usuario acumula <strong>{values.mesesAtrasoParaTransicion} meses</strong> de deuda, migra a Plan B.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </form.Subscribe>
    </div>
  );
}

// Visual Helper
function TimelinePreview({ start, end, controlMonth, toleranceMonths = 0 }: { start: number; end: number; controlMonth?: number; toleranceMonths?: number }) {
  const available = end >= start ? (end - start + 1) : (12 - start + 1) + end;
  
  const timeline: { val: number; offset: number }[] = [];
  if (end >= start) {
    for (let i = start; i <= end; i++) timeline.push({ val: i, offset: 0 });
  } else {
    for (let i = start; i <= 12; i++) timeline.push({ val: i, offset: 0 });
    for (let i = 1; i <= end; i++) timeline.push({ val: i, offset: 1 });
  }

  // Calculate tolerance range
  const toleranceIndices: number[] = [];
  if (controlMonth && toleranceMonths > 0) {
     const controlIdx = timeline.findIndex(t => t.val === controlMonth);
     if (controlIdx !== -1) {
        for(let i=1; i <= toleranceMonths; i++) {
           if (controlIdx + i < timeline.length) toleranceIndices.push(controlIdx + i);
        }
     }
  }

  return (
    <div className="bg-background border rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-sm font-medium">Línea de Tiempo del Plan</h5>
        <div className="flex items-center gap-4 text-[10px] uppercase font-bold">
           <span className="flex items-center gap-1 text-red-600">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Inicio Control
           </span>
           {toleranceMonths > 0 && (
             <span className="flex items-center gap-1 text-orange-500">
                <div className="w-2 h-2 rounded-full bg-orange-400" /> Tolerancia ({toleranceMonths}m)
             </span>
           )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 mb-2 overflow-visible pb-4 pt-4 px-2 scrollbar-thin">
        {timeline.map((item, idx) => {
          const m = MESES.find(m => m.val === item.val);
          const isNextYear = item.offset > 0;
          const isControl = controlMonth === item.val; 
          const isTolerance = toleranceIndices.includes(idx);
          
          return (
            <div key={`${item.val}-${item.offset}`} className="flex flex-col items-center gap-2 min-w-[3rem]">
              <div 
                className={`relative w-10 h-10 rounded-md border flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300
                  ${isControl ? 'bg-red-50 text-red-600 border-red-500 ring-4 ring-red-100 z-10 scale-125 shadow-lg' : 
                    isTolerance ? 'bg-orange-50 text-orange-600 border-orange-400 ring-2 ring-orange-100 scale-110' :
                    isNextYear ? 'text-white border-orange-700' : 'bg-primary text-primary-foreground border-primary'}`}
                style={isNextYear && !isTolerance && !isControl ? { backgroundColor: "#FF6B35" } : {}}
              >
                {idx + 1}
                {isNextYear && !isControl && !isTolerance && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] font-bold shadow-sm border"
                    style={{ color: "#FF6B35", borderColor: "#FF6B35" }}>+1</span>
                )}
              </div>
              <span className={`text-[10px] font-medium uppercase mt-1 ${isControl ? 'text-red-700 font-bold' : isTolerance ? 'text-orange-600 font-bold' : 'text-muted-foreground'}`}>
                {m?.label.substring(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground text-right pt-2 border-t mt-2">
        Duración: <strong>{available} meses</strong> (plan estricto).
      </p>
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="w-4 h-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
