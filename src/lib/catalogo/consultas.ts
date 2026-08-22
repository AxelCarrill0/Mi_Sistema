import type { SupabaseClient } from "@supabase/supabase-js";

import { calcularRango, TAMANO_PAGINA_CATALOGO } from "@/lib/paginacion";

import type {
  CategoriaPublica,
  ColeccionPublica,
  Database,
  ImagenProductoPublica,
  OrdenProductos,
  ProductoConDetalle,
  ProductoConImagenes,
} from "./tipos";

export interface FiltrosProductos {
  busqueda?: string;
  coleccionId?: string;
  categoriaId?: string;
  orden?: OrdenProductos;
  soloDestacados?: boolean;
  limite?: number;
  pagina?: number;
}

export interface ResultadoProductosPublicos {
  productos: ProductoConImagenes[];
  total: number;
}

type ClientePublico = SupabaseClient<Database>;

const LONGITUD_MAXIMA_BUSQUEDA = 80;

interface OpcionOrdenamiento {
  columna: string;
  ascendente: boolean;
  nulosPrimero?: boolean;
}

function obtenerOrdenProductos(orden: OrdenProductos): OpcionOrdenamiento[] {
  switch (orden) {
    case "nombre_asc":
      return [{ columna: "nombre", ascendente: true }];
    case "nombre_desc":
      return [{ columna: "nombre", ascendente: false }];
    case "precio_asc":
      return [{ columna: "precio_base", ascendente: true, nulosPrimero: false }];
    case "precio_desc":
      return [{ columna: "precio_base", ascendente: false, nulosPrimero: false }];
    default:
      return [
        { columna: "destacado", ascendente: false },
        { columna: "creado_en", ascendente: false },
      ];
  }
}

function obtenerTerminoBusqueda(busqueda: string): string | undefined {
  const normalizado = busqueda.trim().slice(0, LONGITUD_MAXIMA_BUSQUEDA);
  return normalizado || undefined;
}

function escaparPatronIlike(termino: string): string {
  return (
    termino
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_")
      // Las comas y paréntesis rompen el parser de filtros .or() de PostgREST.
      .replace(/[,()]/g, " ")
  );
}

export async function listarColeccionesPublicas(
  cliente: ClientePublico,
): Promise<ColeccionPublica[]> {
  const { data, error } = await cliente
    .from("colecciones")
    .select("*")
    .eq("estado_publicacion", "activo")
    .order("nombre");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listarCategoriasPublicas(
  cliente: ClientePublico,
): Promise<CategoriaPublica[]> {
  const { data, error } = await cliente
    .from("categorias")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function obtenerColeccionPublicaPorSlug(
  cliente: ClientePublico,
  slug: string,
): Promise<ColeccionPublica | null> {
  const { data, error } = await cliente
    .from("colecciones")
    .select("*")
    .eq("slug", slug)
    .eq("estado_publicacion", "activo")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerCategoriaPublicaPorSlug(
  cliente: ClientePublico,
  slug: string,
): Promise<CategoriaPublica | null> {
  const { data, error } = await cliente
    .from("categorias")
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

type FilaProductoConsulta = Database["public"]["Tables"]["productos"]["Row"] & {
  imagenes_producto: ImagenProductoPublica[];
};

function construirConsultaProductos(
  cliente: ClientePublico,
  filtros: FiltrosProductos,
  opciones?: { count?: "exact" },
) {
  const termino = filtros.busqueda ? obtenerTerminoBusqueda(filtros.busqueda) : undefined;

  let consulta = cliente
    .from("productos")
    .select("*, imagenes_producto(*)", opciones)
    .eq("estado_publicacion", "activo");

  if (filtros.coleccionId) {
    consulta = consulta.eq("coleccion_id", filtros.coleccionId);
  }
  if (filtros.categoriaId) {
    consulta = consulta.eq("categoria_id", filtros.categoriaId);
  }
  if (filtros.soloDestacados) {
    consulta = consulta.eq("destacado", true);
  }
  if (termino) {
    const patron = escaparPatronIlike(termino);
    consulta = consulta.or(
      `nombre.ilike.%${patron}%,codigo_interno.ilike.%${patron}%,descripcion.ilike.%${patron}%`,
    );
  }

  for (const opcion of obtenerOrdenProductos(filtros.orden ?? "recientes")) {
    consulta = consulta.order(opcion.columna, {
      ascending: opcion.ascendente,
      nullsFirst: opcion.nulosPrimero,
    });
  }

  return consulta.order("orden", {
    referencedTable: "imagenes_producto",
    ascending: true,
  });
}

function mapearProductos(data: FilaProductoConsulta[] | null): ProductoConImagenes[] {
  return (data ?? []).map((producto) => ({
    ...producto,
    imagenes: producto.imagenes_producto,
  }));
}

export async function listarProductosPublicos(
  cliente: ClientePublico,
  filtros: FiltrosProductos = {},
): Promise<ProductoConImagenes[]> {
  let consulta = construirConsultaProductos(cliente, filtros);

  if (filtros.limite) {
    consulta = consulta.limit(filtros.limite);
  }

  const { data, error } = await consulta;

  if (error) {
    throw error;
  }

  return mapearProductos(data as FilaProductoConsulta[]);
}

export async function listarProductosPublicosPaginado(
  cliente: ClientePublico,
  filtros: FiltrosProductos = {},
): Promise<ResultadoProductosPublicos> {
  const { desde, hasta } = calcularRango(
    filtros.pagina ?? 1,
    filtros.limite ?? TAMANO_PAGINA_CATALOGO,
  );

  const { data, count, error } = await construirConsultaProductos(cliente, filtros, {
    count: "exact",
  }).range(desde, hasta);

  if (error) {
    throw error;
  }

  return { productos: mapearProductos(data as FilaProductoConsulta[]), total: count ?? 0 };
}

export async function obtenerProductoPublicoPorSlug(
  cliente: ClientePublico,
  slug: string,
): Promise<ProductoConDetalle | null> {
  const { data, error } = await cliente
    .from("productos")
    .select("*, colecciones(id, nombre, slug), categorias(id, nombre, slug), imagenes_producto(*)")
    .eq("slug", slug)
    .eq("estado_publicacion", "activo")
    .order("orden", { referencedTable: "imagenes_producto", ascending: true })
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    coleccion: data.colecciones,
    categoria: data.categorias,
    imagenes: data.imagenes_producto,
  };
}
