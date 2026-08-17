import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BotonWhatsApp from "@/components/publicos/BotonWhatsApp";
import GaleriaProducto from "@/components/publicos/GaleriaProducto";
import { obtenerProductoPublicoPorSlug } from "@/lib/catalogo/consultas";
import { formatearPrecio, obtenerMostrarPreciosPublicos } from "@/lib/catalogo/configuracion";
import { obtenerEstadoDisponibilidad } from "@/lib/catalogo/disponibilidad";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const cliente = await createClient();
  const producto = await obtenerProductoPublicoPorSlug(cliente, slug);

  if (!producto) {
    notFound();
  }

  const disponibilidad = obtenerEstadoDisponibilidad(producto);
  const precioVisible = (await obtenerMostrarPreciosPublicos()) && producto.precio_base !== null;

  return (
    <article className="detalle-producto">
      <div className="detalle-producto__galeria">
        {producto.imagenes.length > 0 ? (
          <GaleriaProducto imagenes={producto.imagenes} nombreProducto={producto.nombre} />
        ) : (
          <div className="detalle-producto__sin-imagen">Sin imagen</div>
        )}
      </div>

      <div className="detalle-producto__informacion">
        <h1>{producto.nombre}</h1>
        <p className="detalle-producto__codigo">Código: {producto.codigo_interno}</p>
        <p
          className={`detalle-producto__disponibilidad ${
            disponibilidad.disponible
              ? "detalle-producto__disponibilidad--disponible"
              : "detalle-producto__disponibilidad--agotado"
          }`}
        >
          {disponibilidad.etiqueta}
          {disponibilidad.detalle ? (
            <span className="detalle-producto__disponibilidad-detalle">
              {disponibilidad.detalle}
            </span>
          ) : null}
        </p>

        {precioVisible && producto.precio_base !== null ? (
          <p className="detalle-producto__precio">{formatearPrecio(producto.precio_base)}</p>
        ) : (
          <p className="detalle-producto__cotizar">
            Pide tu cotización personalizada sin compromiso.
          </p>
        )}

        {producto.descripcion ? <p>{producto.descripcion}</p> : null}

        <dl className="detalle-producto__datos">
          {producto.materiales ? (
            <div className="detalle-producto__dato">
              <dt>Materiales</dt>
              <dd>{producto.materiales}</dd>
            </div>
          ) : null}
          {producto.medidas ? (
            <div className="detalle-producto__dato">
              <dt>Medidas</dt>
              <dd>{producto.medidas}</dd>
            </div>
          ) : null}
          {producto.colores_acabados ? (
            <div className="detalle-producto__dato">
              <dt>Colores y acabados</dt>
              <dd>{producto.colores_acabados}</dd>
            </div>
          ) : null}
          {producto.tiempo_elaboracion ? (
            <div className="detalle-producto__dato">
              <dt>Tiempo de elaboración</dt>
              <dd>{producto.tiempo_elaboracion}</dd>
            </div>
          ) : null}
        </dl>

        {producto.coleccion ? (
          <p className="detalle-producto__referencia">
            Colección:{" "}
            <Link href={`/colecciones/${producto.coleccion.slug}`}>
              {producto.coleccion.nombre}
            </Link>
          </p>
        ) : null}
        {producto.categoria ? (
          <p className="detalle-producto__referencia">
            Categoría:{" "}
            <Link href={`/categorias/${producto.categoria.slug}`}>{producto.categoria.nombre}</Link>
          </p>
        ) : null}

        <div className="detalle-producto__acciones">
          <BotonWhatsApp producto={producto} />
        </div>
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cliente = await createClient();
  const producto = await obtenerProductoPublicoPorSlug(cliente, slug);

  return {
    title: producto ? producto.nombre : "Producto no encontrado",
  };
}
