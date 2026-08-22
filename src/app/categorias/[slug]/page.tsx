import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import ListaProductos from "@/components/publicos/ListaProductos";
import { listarProductosPublicos, obtenerCategoriaPublicaPorSlug } from "@/lib/catalogo/consultas";
import { obtenerOrigenActual } from "@/lib/catalogo/origen";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

// Comparte la categoría entre la página y generateMetadata en la misma petición.
const obtenerCategoria = cache(async (slug: string) => {
  const cliente = await createClient();
  return obtenerCategoriaPublicaPorSlug(cliente, slug);
});

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params;
  const categoria = await obtenerCategoria(slug);

  if (!categoria) {
    notFound();
  }

  const cliente = await createClient();
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
  const [categoria, origen] = await Promise.all([obtenerCategoria(slug), obtenerOrigenActual()]);

  if (!categoria) {
    return { title: "Categoría" };
  }

  const url = origen ? `${origen}/categorias/${encodeURIComponent(slug)}` : undefined;
  const description =
    categoria.descripcion?.slice(0, 160) ??
    `Descubre los productos de la categoría ${categoria.nombre} en FutureLife y cotiza por WhatsApp.`;

  return {
    title: categoria.nombre,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: categoria.nombre,
      description,
      url,
      type: "website",
    },
  };
}
