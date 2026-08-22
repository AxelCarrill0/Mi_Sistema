import { obtenerConfiguracionWhatsApp } from "@/lib/catalogo/configuracion";
import { obtenerOrigenActual } from "@/lib/catalogo/origen";
import {
  construirMensajeWhatsApp,
  construirUrlProducto,
  construirUrlWhatsApp,
} from "@/lib/catalogo/whatsapp";
import type { ProductoConDetalle } from "@/lib/catalogo/tipos";

interface Props {
  producto: ProductoConDetalle;
  etiqueta?: string;
}

export default async function BotonWhatsApp({
  producto,
  etiqueta = "Cotizar por WhatsApp",
}: Props) {
  const [configuracion, origen] = await Promise.all([
    obtenerConfiguracionWhatsApp(),
    obtenerOrigenActual(),
  ]);

  if (!configuracion.numero) {
    return null;
  }

  const mensaje = construirMensajeWhatsApp(
    producto,
    configuracion.mensajePredeterminado,
    construirUrlProducto(producto.slug, origen),
  );
  const url = construirUrlWhatsApp(configuracion.numero, mensaje);

  return (
    <a className="boton boton--whatsapp" href={url} target="_blank" rel="noopener noreferrer">
      {etiqueta}
    </a>
  );
}
