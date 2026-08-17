import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ListaProductos from "@/components/publicos/ListaProductos";
import { listarProductosPublicos, obtenerColeccionPublicaPorSlug } from "@/lib/catalogo/consultas";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ColeccionPage({ params }: Props) {
  const { slug } = await params;
  const cliente = await createClient();
  const coleccion = await obtenerColeccionPublicaPorSlug(cliente, slug);

  if (!coleccion) {
    notFound();
  }

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
  const cliente = await createClient();
  const coleccion = await obtenerColeccionPublicaPorSlug(cliente, slug);

  return {
    title: coleccion ? coleccion.nombre : "Colección",
  };
}
