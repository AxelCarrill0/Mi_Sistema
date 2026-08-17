import Image from "next/image";
import Link from "next/link";

import { obtenerUrlPublicaImagen } from "@/lib/catalogo/imagenes";
import { obtenerEtiquetaTipoProducto } from "@/lib/catalogo/opciones";
import type { ProductoConImagenes } from "@/lib/catalogo/tipos";

export default function TarjetaProducto({ producto }: { producto: ProductoConImagenes }) {
  const imagenPrincipal = producto.imagenes[0];
  const urlImagen = imagenPrincipal ? obtenerUrlPublicaImagen(imagenPrincipal.ruta_storage) : null;

  return (
    <article className="tarjeta-producto">
      <Link href={`/productos/${producto.slug}`} className="tarjeta-producto__enlace">
        <div className="tarjeta-producto__imagen">
          {urlImagen ? (
            <Image
              src={urlImagen}
              alt={imagenPrincipal.texto_alternativo ?? producto.nombre}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
            />
          ) : (
            <span className="tarjeta-producto__sin-imagen">Sin imagen</span>
          )}
        </div>
        <div className="tarjeta-producto__info">
          <p className="tarjeta-producto__codigo">{producto.codigo_interno}</p>
          <h2 className="tarjeta-producto__nombre">{producto.nombre}</h2>
          <p className="tarjeta-producto__tipo">
            {obtenerEtiquetaTipoProducto(producto.tipo_producto)}
          </p>
        </div>
      </Link>
    </article>
  );
}
