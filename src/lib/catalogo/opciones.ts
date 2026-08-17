import type { OrdenProductos, TipoProducto } from "./tipos";

export interface OpcionOrden {
  valor: OrdenProductos;
  etiqueta: string;
}

export const ORDENES_DISPONIBLES: OpcionOrden[] = [
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "nombre_asc", etiqueta: "Nombre (A–Z)" },
  { valor: "nombre_desc", etiqueta: "Nombre (Z–A)" },
  { valor: "precio_asc", etiqueta: "Precio (menor a mayor)" },
  { valor: "precio_desc", etiqueta: "Precio (mayor a menor)" },
];

export function esOrdenValido(valor: string | undefined): valor is OrdenProductos {
  return ORDENES_DISPONIBLES.some((opcion) => opcion.valor === valor);
}

export const ETIQUETAS_TIPO_PRODUCTO: Record<TipoProducto, string> = {
  disponible: "Disponible",
  bajo_pedido: "Bajo pedido",
  personalizado: "Personalizado",
};

export function obtenerEtiquetaTipoProducto(tipo: string): string {
  return ETIQUETAS_TIPO_PRODUCTO[tipo as TipoProducto] ?? "Otros";
}
