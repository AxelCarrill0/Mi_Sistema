import type { ProductoPublico } from "./tipos";

type DatosMensajeProducto = Pick<ProductoPublico, "nombre" | "codigo_interno" | "mensaje_whatsapp">;

export function normalizarNumeroTelefono(valor: string | null | undefined): string | null {
  const numero = valor?.replace(/\D/g, "");

  return numero ? numero : null;
}

export function construirMensajeProducto(producto: DatosMensajeProducto): string {
  const mensajePersonalizado = producto.mensaje_whatsapp?.trim();

  if (mensajePersonalizado) {
    return mensajePersonalizado;
  }

  return [
    `Hola, quisiera cotizar el producto: ${producto.nombre}.`,
    `Código: ${producto.codigo_interno}.`,
    "¿Podrían indicarme precio, disponibilidad y tiempo de elaboración?",
  ].join("\n");
}

export function construirUrlWhatsApp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
