import { obtenerConfiguracionWhatsApp } from "@/lib/catalogo/configuracion";
import { construirMensajeProducto, construirUrlWhatsApp } from "@/lib/catalogo/whatsapp";
import type { ProductoConDetalle } from "@/lib/catalogo/tipos";

interface Props {
  producto: ProductoConDetalle;
  etiqueta?: string;
}

export default async function BotonWhatsApp({
  producto,
  etiqueta = "Cotizar por WhatsApp",
}: Props) {
  const configuracion = await obtenerConfiguracionWhatsApp();

  if (!configuracion.numero) {
    return null;
  }

  const mensaje =
    producto.mensaje_whatsapp?.trim() ??
    configuracion.mensajePredeterminado ??
    construirMensajeProducto(producto);
  const url = construirUrlWhatsApp(configuracion.numero, mensaje);

  return (
    <a className="boton boton--whatsapp" href={url} target="_blank" rel="noopener noreferrer">
      {etiqueta}
    </a>
  );
}
