import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { CheckCircle2, XCircle, Clock, ArrowRight, RefreshCw, CreditCard, AlertTriangle } from "lucide-react";

/**
 * Ruta pública para el retorno de Mercado Pago.
 * No requiere autenticación para evitar problemas con Keycloak redirect.
 */
export const Route = createFileRoute("/pago-resultado")({
  component: PagoResultadoPage,
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string) || "unknown",
    payment_id: search.payment_id as string | undefined,
    external_reference: search.external_reference as string | undefined,
  }),
});

type PaymentStatus = "success" | "failure" | "pending" | "unknown";

function PagoResultadoPage() {
  const { status } = useSearch({ from: "/pago-resultado" });
  const navigate = useNavigate();
  const auth = useAuth();
  const [countdown, setCountdown] = useState(8);

  const paymentStatus = (["success", "failure", "pending"].includes(status) 
    ? status 
    : "unknown") as PaymentStatus;

  // Auto-redirect countdown solo para success
  useEffect(() => {
    if (paymentStatus !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGoToPayments();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus]);

  const handleGoToPayments = () => {
    if (auth.isAuthenticated) {
      navigate({ to: "/pagos", search: { mes: undefined, devMode: false } });
    } else {
      auth.signinRedirect({ redirect_uri: `${window.location.origin}/callback` });
    }
  };

  const handleRetryPayment = () => {
    handleGoToPayments();
  };

  // ========================================
  // ESCENARIO: PAGO EXITOSO
  // ========================================
  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Animación de éxito */}
          <div className="relative">
            <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-14 h-14 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs animate-pulse">
              ✓
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-green-700">¡Pago exitoso!</h1>
            <p className="text-gray-600 text-lg">
              Tu pago ha sido procesado correctamente.
            </p>
          </div>

          {/* Info card */}
          <div className="bg-white rounded-xl shadow-md p-5 text-left space-y-3 border border-green-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 text-sm">
                Las cuotas pagadas se actualizarán automáticamente en tu cuenta.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 text-sm">
                Recibirás un comprobante de pago en tu correo electrónico.
              </p>
            </div>
          </div>

          {/* Countdown */}
          <p className="text-sm text-gray-500">
            Redirigiendo a tus pagos en <span className="font-bold text-green-600">{countdown}</span> segundos...
          </p>

          {/* Botón principal */}
          <button
            onClick={handleGoToPayments}
            className="w-full py-4 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-200"
          >
            Ver mis pagos
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // ESCENARIO: PAGO RECHAZADO
  // ========================================
  if (paymentStatus === "failure") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icono de error */}
          <div className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-14 h-14 text-red-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-red-700">Pago rechazado</h1>
            <p className="text-gray-600 text-lg">
              No pudimos procesar tu pago.
            </p>
          </div>

          {/* Razones comunes */}
          <div className="bg-white rounded-xl shadow-md p-5 text-left space-y-3 border border-red-100">
            <p className="font-medium text-gray-800 text-sm">Posibles razones:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                Fondos insuficientes en la tarjeta
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                Datos de la tarjeta incorrectos
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                Límite de compra excedido
              </li>
            </ul>
          </div>

          {/* Acciones */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleRetryPayment}
              className="w-full py-4 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-red-200"
            >
              <RefreshCw className="w-5 h-5" />
              Intentar nuevamente
            </button>
            
            <button
              onClick={handleGoToPayments}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Usar otro medio de pago
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // ESCENARIO: PAGO PENDIENTE
  // ========================================
  if (paymentStatus === "pending") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icono animado de pendiente */}
          <div className="mx-auto w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-14 h-14 text-amber-600 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-amber-700">Pago en proceso</h1>
            <p className="text-gray-600 text-lg">
              Tu pago está siendo verificado.
            </p>
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl shadow-md p-5 text-left space-y-3 border border-amber-100">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 text-sm">
                Esto puede tardar unos minutos. Te notificaremos cuando se confirme.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 text-sm">
                Si pagaste en efectivo, puede demorar hasta 2 horas hábiles.
              </p>
            </div>
          </div>

          {/* Botón */}
          <button
            onClick={handleGoToPayments}
            className="w-full py-4 px-6 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
          >
            Ver estado de mis pagos
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // ESCENARIO: ESTADO DESCONOCIDO
  // ========================================
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
          <AlertTriangle className="w-14 h-14 text-gray-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-700">Estado desconocido</h1>
          <p className="text-gray-600">
            No pudimos determinar el estado de tu pago.
          </p>
        </div>

        <button
          onClick={handleGoToPayments}
          className="w-full py-4 px-6 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          Revisar mis pagos
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
