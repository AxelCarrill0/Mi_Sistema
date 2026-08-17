import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { ResumenPanel } from "./tipos";

type ClientePanel = SupabaseClient<Database>;

const LIMITE_STOCK_BAJO = 5;
const STOCK_BAJO_CANTIDAD_MAXIMA = 10;

export interface ProductoPanelListado {
  id: string;
  codigo_interno: string;
  nombre: string;
  slug: string;
  tipo_producto: string;
  precio_base: number | null;
  controla_stock: boolean;
  stock_actual: number;
  destacado: boolean;
  estado_publicacion: string;
  coleccion: { id: string; nombre: string } | null;
  categoria: { id: string; nombre: string } | null;
}

async function contarProductosPorEstado(
  cliente: ClientePanel,
  estadoPublicacion: "activo" | "borrador" | "desactivado",
): Promise<number> {
  const { count, error } = await cliente
    .from("productos")
    .select("*", { count: "exact", head: true })
    .eq("estado_publicacion", estadoPublicacion);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

interface OpcionesListadoRelacion {
  soloActivas?: boolean;
  incluirId?: string;
}

export async function listarColeccionesPanel(
  cliente: ClientePanel,
  opciones: OpcionesListadoRelacion = {},
) {
  const { data, error } = await cliente.from("colecciones").select("*").order("nombre");

  if (error) {
    throw error;
  }

  return (data ?? []).filter(
    (coleccion) =>
      !opciones.soloActivas ||
      coleccion.estado_publicacion === "activo" ||
      coleccion.id === opciones.incluirId,
  );
}

export async function obtenerColeccionPanel(cliente: ClientePanel, id: string) {
  const { data, error } = await cliente.from("colecciones").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function listarCategoriasPanel(
  cliente: ClientePanel,
  opciones: OpcionesListadoRelacion = {},
) {
  const { data, error } = await cliente.from("categorias").select("*").order("nombre");

  if (error) {
    throw error;
  }

  return (data ?? []).filter(
    (categoria) => !opciones.soloActivas || categoria.activo || categoria.id === opciones.incluirId,
  );
}

export async function obtenerCategoriaPanel(cliente: ClientePanel, id: string) {
  const { data, error } = await cliente.from("categorias").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function listarProductosPanel(cliente: ClientePanel): Promise<ProductoPanelListado[]> {
  const { data, error } = await cliente
    .from("productos")
    .select("*, colecciones(id, nombre), categorias(id, nombre)")
    .order("creado_en", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((producto) => ({
    id: producto.id,
    codigo_interno: producto.codigo_interno,
    nombre: producto.nombre,
    slug: producto.slug,
    tipo_producto: producto.tipo_producto,
    precio_base: producto.precio_base,
    controla_stock: producto.controla_stock,
    stock_actual: producto.stock_actual,
    destacado: producto.destacado,
    estado_publicacion: producto.estado_publicacion,
    coleccion: producto.colecciones,
    categoria: producto.categorias,
  }));
}

export async function obtenerProductoPanel(cliente: ClientePanel, id: string) {
  const { data, error } = await cliente.from("productos").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export interface ImagenProductoPanel {
  id: string;
  ruta_storage: string;
  texto_alternativo: string | null;
  orden: number;
  es_principal: boolean;
}

export async function listarImagenesProducto(
  cliente: ClientePanel,
  productoId: string,
): Promise<ImagenProductoPanel[]> {
  const { data, error } = await cliente
    .from("imagenes_producto")
    .select("id, ruta_storage, texto_alternativo, orden, es_principal")
    .eq("producto_id", productoId)
    .order("es_principal", { ascending: false })
    .order("orden", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((imagen) => ({
    id: imagen.id,
    ruta_storage: imagen.ruta_storage,
    texto_alternativo: imagen.texto_alternativo,
    orden: imagen.orden,
    es_principal: imagen.es_principal,
  }));
}

export interface ConfiguracionPanel {
  nombreNegocio: string;
  mostrarPreciosPublicos: boolean;
  numeroWhatsApp: string;
  mensajePredeterminado: string;
}

export async function obtenerConfiguracionPanel(
  cliente: ClientePanel,
): Promise<ConfiguracionPanel> {
  const [negocio, whatsapp] = await Promise.all([
    cliente.from("configuracion_negocio").select("*").eq("id", 1).maybeSingle(),
    cliente.from("configuracion_whatsapp").select("*").eq("id", 1).maybeSingle(),
  ]);

  if (negocio.error) {
    throw negocio.error;
  }
  if (whatsapp.error) {
    throw whatsapp.error;
  }

  return {
    nombreNegocio: negocio.data?.nombre_negocio ?? "FutureLife",
    mostrarPreciosPublicos: negocio.data?.mostrar_precios_publicos ?? false,
    numeroWhatsApp: whatsapp.data?.numero_whatsapp ?? "",
    mensajePredeterminado: whatsapp.data?.mensaje_predeterminado ?? "",
  };
}

export async function listarClientesPanel(cliente: ClientePanel) {
  const { data, error } = await cliente.from("clientes").select("*").order("nombres");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function obtenerClientePanel(cliente: ClientePanel, id: string) {
  const { data, error } = await cliente.from("clientes").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export interface CotizacionPanelListado {
  id: string;
  numero: number;
  nombre_cliente: string;
  estado: string;
  creado_en: string;
  total: number;
}

export async function listarCotizacionesPanel(
  cliente: ClientePanel,
): Promise<CotizacionPanelListado[]> {
  const { data, error } = await cliente
    .from("cotizaciones")
    .select("*, cotizaciones_detalle(precio_unitario, cantidad)")
    .order("creado_en", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((cotizacion) => ({
    id: cotizacion.id,
    numero: cotizacion.numero,
    nombre_cliente: cotizacion.nombre_cliente,
    estado: cotizacion.estado,
    creado_en: cotizacion.creado_en,
    total:
      cotizacion.cotizaciones_detalle?.reduce(
        (suma, linea) => suma + (linea.precio_unitario ?? 0) * (linea.cantidad ?? 0),
        0,
      ) ?? 0,
  }));
}

export async function obtenerCotizacionPanel(cliente: ClientePanel, id: string) {
  const { data, error } = await cliente
    .from("cotizaciones")
    .select("*, cotizaciones_detalle(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const detalle = [...(data.cotizaciones_detalle ?? [])].sort((a, b) =>
    a.creado_en.localeCompare(b.creado_en),
  );

  return {
    ...data,
    cotizaciones_detalle: detalle,
    total: detalle.reduce((suma, linea) => suma + linea.precio_unitario * linea.cantidad, 0),
  };
}

export interface ProductoParaCotizar {
  id: string;
  nombre: string;
  codigo_interno: string;
  precio_base: number | null;
}

export async function listarProductosParaCotizar(
  cliente: ClientePanel,
): Promise<ProductoParaCotizar[]> {
  const { data, error } = await cliente
    .from("productos")
    .select("id, nombre, codigo_interno, precio_base")
    .in("estado_publicacion", ["activo", "borrador"])
    .order("nombre");

  if (error) {
    throw error;
  }

  return (data ?? []).map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    codigo_interno: producto.codigo_interno,
    precio_base: producto.precio_base,
  }));
}

export async function obtenerResumenPanel(cliente: ClientePanel): Promise<ResumenPanel> {
  const [productosActivos, productosBorrador, productosDesactivados] = await Promise.all([
    contarProductosPorEstado(cliente, "activo"),
    contarProductosPorEstado(cliente, "borrador"),
    contarProductosPorEstado(cliente, "desactivado"),
  ]);

  const [{ count: colecciones }, { count: categorias }] = await Promise.all([
    cliente
      .from("colecciones")
      .select("*", { count: "exact", head: true })
      .eq("estado_publicacion", "activo"),
    cliente.from("categorias").select("*", { count: "exact", head: true }),
  ]);

  const { data: stockBajo, error: errorStockBajo } = await cliente
    .from("productos")
    .select("id, codigo_interno, nombre, stock_actual")
    .eq("controla_stock", true)
    .eq("estado_publicacion", "activo")
    .lte("stock_actual", LIMITE_STOCK_BAJO)
    .order("stock_actual", { ascending: true })
    .limit(STOCK_BAJO_CANTIDAD_MAXIMA);

  if (errorStockBajo) {
    throw errorStockBajo;
  }

  return {
    productosActivos,
    productosBorrador,
    productosDesactivados,
    colecciones: colecciones ?? 0,
    categorias: categorias ?? 0,
    productosStockBajo: stockBajo ?? [],
  };
}
