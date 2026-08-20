import type { ProductoPublico } from "./tipos";

type DatosMensajeProducto = Pick<ProductoPublico, "nombre" | "codigo_interno" | "mensaje_whatsapp">;

export function normalizarNumeroTelefono(valor: string | null | undefined): string | null {
  const numero = valor?.replace(/\D/g, "");

  return numero ? numero : null;
}

export function construirMensajeProducto(producto: DatosMensajeProducto): string {
  return [
    `Hola, quisiera cotizar el producto: ${producto.nombre}.`,
    `Código: ${producto.codigo_interno}.`,
    "¿Podrían indicarme precio, disponibilidad y tiempo de elaboración?",
  ].join("\n");
}

export function construirMensajeWhatsApp(
  producto: DatosMensajeProducto,
  mensajePredeterminado?: string | null,
  urlProducto?: string | null,
): string {
  const mensajeBase = producto.mensaje_whatsapp?.trim() || mensajePredeterminado?.trim();

  return [
    `Hola, quisiera cotizar el producto: ${producto.nombre}.`,
    `Código: ${producto.codigo_interno}.`,
    urlProducto ? `Ver producto: ${urlProducto}` : null,
    mensajeBase || "¿Podrían indicarme precio, disponibilidad y tiempo de elaboración?",
  ]
    .filter(Boolean)
    .join("\n");
}

export function construirUrlProducto(slug: string, origen?: string): string {
  const base =
    origen?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return `${base}/productos/${encodeURIComponent(slug)}`;
}

export function construirUrlWhatsApp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
