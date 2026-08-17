export function formatearNumeroCotizacion(numero: number): string {
  return `COT-${String(numero).padStart(4, "0")}`;
}

export function formatearFechaCotizacion(fechaIso: string): string {
  return new Date(fechaIso).toLocaleDateString("es-EC");
}

export function obtenerFechaVigencia(fechaIso: string, vigenciaDias: number): string {
  const fecha = new Date(fechaIso);
  fecha.setDate(fecha.getDate() + vigenciaDias);
  return fecha.toLocaleDateString("es-EC");
}
