export const TAMANO_PAGINA_PANEL = 20;
export const TAMANO_PAGINA_CATALOGO = 24;

export interface ResultadoPaginado<T> {
  filas: T[];
  total: number;
}

export function obtenerNumeroPagina(valor: string | string[] | undefined): number {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  const numero = Number(texto);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

export function calcularRango(pagina: number, porPagina: number): { desde: number; hasta: number } {
  const paginaSegura = Math.max(1, pagina);
  const desde = (paginaSegura - 1) * porPagina;
  return { desde, hasta: desde + porPagina - 1 };
}

export function obtenerTotalPaginas(total: number, porPagina: number): number {
  return Math.max(1, Math.ceil(total / porPagina));
}
