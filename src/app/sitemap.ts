import type { MetadataRoute } from "next";

import {
  listarCategoriasPublicas,
  listarColeccionesPublicas,
  listarProductosPublicos,
} from "@/lib/catalogo/consultas";
import { obtenerUrlBase } from "@/lib/catalogo/origen";
import { createClient } from "@/lib/supabase/server";

const LIMITE_PRODUCTOS_SITEMAP = 500;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await obtenerUrlBase();
  const cliente = await createClient();

  const [colecciones, categorias, productos] = await Promise.all([
    listarColeccionesPublicas(cliente),
    listarCategoriasPublicas(cliente),
    listarProductosPublicos(cliente, { limite: LIMITE_PRODUCTOS_SITEMAP }),
  ]);

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/colecciones`, changeFrequency: "monthly", priority: 0.7 },
    ...colecciones.map((coleccion) => ({
      url: `${base}/colecciones/${encodeURIComponent(coleccion.slug)}`,
      lastModified: coleccion.actualizado_en ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...categorias.map((categoria) => ({
      url: `${base}/categorias/${encodeURIComponent(categoria.slug)}`,
      lastModified: categoria.actualizado_en ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...productos.map((producto) => ({
      url: `${base}/productos/${encodeURIComponent(producto.slug)}`,
      lastModified: producto.actualizado_en ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
