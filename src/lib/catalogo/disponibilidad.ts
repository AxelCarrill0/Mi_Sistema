import type { ProductoPublico } from "./tipos";

export interface EstadoDisponibilidad {
  etiqueta: string;
  disponible: boolean;
  detalle?: string;
}

export function obtenerEstadoDisponibilidad(producto: ProductoPublico): EstadoDisponibilidad {
  switch (producto.tipo_producto) {
    case "disponible": {
      if (producto.controla_stock && producto.stock_actual <= 0) {
        return { etiqueta: "Agotado", disponible: false };
      }
      if (producto.controla_stock && producto.stock_actual > 0) {
        return {
          etiqueta: "Disponible",
          disponible: true,
          detalle: `Quedan ${producto.stock_actual} ${
            producto.stock_actual === 1 ? "unidad" : "unidades"
          }`,
        };
      }
      return { etiqueta: "Disponible", disponible: true };
    }
    case "bajo_pedido":
      return { etiqueta: "Bajo pedido", disponible: true };
    case "personalizado":
      return { etiqueta: "Personalizado", disponible: true };
    default:
      return { etiqueta: "Disponible", disponible: true };
  }
}
