import type { Metadata } from "next";

import FormularioFiltros from "@/components/publicos/FormularioFiltros";
import ListaProductos from "@/components/publicos/ListaProductos";
import {
  listarCategoriasPublicas,
  listarColeccionesPublicas,
  listarProductosPublicos,
  obtenerCategoriaPublicaPorSlug,
  obtenerColeccionPublicaPorSlug,
} from "@/lib/catalogo/consultas";
import { esOrdenValido } from "@/lib/catalogo/opciones";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Catálogo",
};

const UUID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogoPage({ searchParams }: Props) {
  const parametros = await searchParams;

  const busqueda = typeof parametros.q === "string" ? parametros.q.trim() : "";
  const coleccionSlug = typeof parametros.coleccion === "string" ? parametros.coleccion : "";
  const categoriaSlug = typeof parametros.categoria === "string" ? parametros.categoria : "";
  const ordenParametro = typeof parametros.orden === "string" ? parametros.orden : undefined;
  const orden = esOrdenValido(ordenParametro) ? ordenParametro : "recientes";

  const cliente = await createClient();

  const [colecciones, categorias, coleccion, categoria] = await Promise.all([
    listarColeccionesPublicas(cliente),
    listarCategoriasPublicas(cliente),
    coleccionSlug ? obtenerColeccionPublicaPorSlug(cliente, coleccionSlug) : Promise.resolve(null),
    categoriaSlug ? obtenerCategoriaPublicaPorSlug(cliente, categoriaSlug) : Promise.resolve(null),
  ]);

  const coleccionId = coleccionSlug ? (coleccion?.id ?? UUID_INEXISTENTE) : undefined;
  const categoriaId = categoriaSlug ? (categoria?.id ?? UUID_INEXISTENTE) : undefined;

  const productos = await listarProductosPublicos(cliente, {
    busqueda,
    coleccionId,
    categoriaId,
    orden,
  });

  const tieneFiltros = Boolean(busqueda || coleccionSlug || categoriaSlug);

  return (
    <section className="catalogo-pagina">
      <header className="pagina-encabezado">
        <div>
          <p className="pagina-encabezado__eyebrow">Piezas seleccionadas</p>
          <h1>Catálogo</h1>
          <p className="introduccion">
            Explora muebles y objetos hechos para encontrar su lugar en tu hogar.
          </p>
        </div>
        <p className="pagina-encabezado__nota">
          Cada pieza se presenta con sus detalles para que puedas cotizarla con calma.
        </p>
      </header>
      <div className="catalogo-pagina__explorador">
        <div className="catalogo-pagina__explorador-cabecera">
          <span>Encuentra una pieza</span>
          <span>{productos.length} resultados</span>
        </div>
        <FormularioFiltros
          colecciones={colecciones}
          categorias={categorias}
          valores={{
            busqueda,
            coleccion: coleccionSlug,
            categoria: categoriaSlug,
            orden,
            tieneFiltros,
          }}
        />
      </div>
      <div className="catalogo-pagina__resultados">
        <ListaProductos productos={productos} />
      </div>
    </section>
  );
}
