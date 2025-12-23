/**
 * Funciones auxiliares para el calendario
 */

import { casColors } from "../../lib/colors";

export const obtenerColorEvento = (tipo: string) => {
  switch (tipo) {
    case "importante":
      return casColors.primary.orange;
    case "fecha_limite":
    case "fecha-limite":
      return casColors.primary.red;
    case "reunion":
      return casColors.nature.green[600];
    case "actividad":
      return casColors.ui.info;
    case "taller":
      return casColors.nature.green[500];
    case "excursion":
      return casColors.nature.mountain;
    default:
      return casColors.ui.text.secondary;
  }
};

export const obtenerIconoEvento = (tipo: string) => {
  switch (tipo) {
    case "importante":
      return "⭐";
    case "fecha_limite":
    case "fecha-limite":
      return "⏰";
    case "reunion":
      return "👥";
    case "actividad":
      return "🏕️";
    case "taller":
      return "📚";
    case "excursion":
      return "🥾";
    default:
      return "📅";
  }
};
