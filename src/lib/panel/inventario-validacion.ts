export const TIPOS_MOVIMIENTO_MANUAL = ["entrada", "salida", "ajuste"] as const;

export type TipoMovimientoManual = (typeof TIPOS_MOVIMIENTO_MANUAL)[number];

export function esTipoMovimientoManual(valor: string): valor is TipoMovimientoManual {
  return TIPOS_MOVIMIENTO_MANUAL.includes(valor as TipoMovimientoManual);
}

/**
 * Convierte la cantidad visible del formulario al signo persistido.
 * Entrada y salida usan cantidades positivas en la interfaz; el ajuste
 * conserva el signo para permitir correcciones hacia arriba o hacia abajo.
 */
export function normalizarCantidadMovimiento(
  tipo: TipoMovimientoManual,
  cantidad: number,
): number | null {
  if (!Number.isInteger(cantidad) || cantidad === 0) {
    return null;
  }

  if (tipo === "entrada") {
    return Math.abs(cantidad);
  }

  if (tipo === "salida") {
    return -Math.abs(cantidad);
  }

  return cantidad;
}
