export function formatearNumeroCotizacion(numero: number): string {
  return `COT-${String(numero).padStart(4, "0")}`;
}

export function formatearNumeroPedido(numero: number): string {
  return `PED-${String(numero).padStart(4, "0")}`;
}

export function formatearNumeroVenta(numero: number): string {
  return `VTA-${String(numero).padStart(4, "0")}`;
}

export function formatearNumeroProduccion(numero: number): string {
  return `PRD-${String(numero).padStart(4, "0")}`;
}

export function formatearFechaCotizacion(fechaIso: string): string {
  return new Date(fechaIso).toLocaleDateString("es-EC");
}

export function formatearFechaHora(fechaIso: string): string {
  return new Date(fechaIso).toLocaleString("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function obtenerFechaVigencia(fechaIso: string, vigenciaDias: number): string {
  const fecha = new Date(fechaIso);
  fecha.setDate(fecha.getDate() + vigenciaDias);
  return fecha.toLocaleDateString("es-EC");
}

export function formatearMonedaUSD(monto: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto);
}
