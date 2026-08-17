import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ListaProductos from "@/components/publicos/ListaProductos";
import { listarProductosPublicos, obtenerCategoriaPublicaPorSlug } from "@/lib/catalogo/consultas";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params;
  const cliente = await createClient();
  const categoria = await obtenerCategoriaPublicaPorSlug(cliente, slug);

  if (!categoria) {
    notFound();
  }

  const productos = await listarProductosPublicos(cliente, { categoriaId: categoria.id });

  return (
    <section>
      <h1>{categoria.nombre}</h1>
      {categoria.descripcion ? <p className="introduccion">{categoria.descripcion}</p> : null}
      <ListaProductos
        productos={productos}
        mensajeVacio="Esta categoría aún no tiene productos publicados."
      />
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cliente = await createClient();
  const categoria = await obtenerCategoriaPublicaPorSlug(cliente, slug);

  return {
    title: categoria ? categoria.nombre : "Categoría",
  };
}
