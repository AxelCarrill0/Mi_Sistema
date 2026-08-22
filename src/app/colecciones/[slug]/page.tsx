import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import ListaProductos from "@/components/publicos/ListaProductos";
import { listarProductosPublicos, obtenerColeccionPublicaPorSlug } from "@/lib/catalogo/consultas";
import { obtenerOrigenActual } from "@/lib/catalogo/origen";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

// Comparte la colección entre la página y generateMetadata en la misma petición.
const obtenerColeccion = cache(async (slug: string) => {
  const cliente = await createClient();
  return obtenerColeccionPublicaPorSlug(cliente, slug);
});

export default async function ColeccionPage({ params }: Props) {
  const { slug } = await params;
  const coleccion = await obtenerColeccion(slug);

  if (!coleccion) {
    notFound();
  }

  const cliente = await createClient();
  const productos = await listarProductosPublicos(cliente, { coleccionId: coleccion.id });

  return (
    <section>
      <h1>{coleccion.nombre}</h1>
      {coleccion.descripcion ? <p className="introduccion">{coleccion.descripcion}</p> : null}
      <ListaProductos
        productos={productos}
        mensajeVacio="Esta colección aún no tiene productos publicados."
      />
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [coleccion, origen] = await Promise.all([obtenerColeccion(slug), obtenerOrigenActual()]);

  if (!coleccion) {
    return { title: "Colección" };
  }

  const url = origen ? `${origen}/colecciones/${encodeURIComponent(slug)}` : undefined;
  const description =
    coleccion.descripcion?.slice(0, 160) ??
    `Explora la colección ${coleccion.nombre} de FutureLife y cotiza tus piezas favoritas por WhatsApp.`;

  return {
    title: coleccion.nombre,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: coleccion.nombre,
      description,
      url,
      type: "website",
    },
  };
}
