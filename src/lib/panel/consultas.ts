import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type {
  HistorialEstadoProduccionPanel,
  MovimientoInventarioPanel,
  PagoPanel,
  PedidoPanelListado,
  ProduccionPanelDetallada,
  ProduccionPanelListado,
  ReporteTopProducto,
  ReporteVentas,
  ResumenPanel,
  VentaPanelListado,
} from "./tipos";

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
  umbralStockBajo: number;
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
    umbralStockBajo: negocio.data?.umbral_stock_bajo ?? LIMITE_STOCK_BAJO,
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

  const [
    { count: colecciones },
    { count: categorias },
    { count: pedidosPendientes },
    { count: ventasRealizadas },
    { count: produccionesActivas },
  ] = await Promise.all([
    cliente
      .from("colecciones")
      .select("*", { count: "exact", head: true })
      .eq("estado_publicacion", "activo"),
    cliente.from("categorias").select("*", { count: "exact", head: true }),
    cliente.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
    cliente.from("ventas").select("*", { count: "exact", head: true }),
    cliente.from("producciones").select("*", { count: "exact", head: true }).eq("estado", "activa"),
  ]);

  const { data: configuracion } = await cliente
    .from("configuracion_negocio")
    .select("umbral_stock_bajo")
    .eq("id", 1)
    .maybeSingle();

  const umbralStockBajo = configuracion?.umbral_stock_bajo ?? LIMITE_STOCK_BAJO;

  const { data: stockBajo, error: errorStockBajo } = await cliente
    .from("productos")
    .select("id, codigo_interno, nombre, stock_actual")
    .eq("controla_stock", true)
    .eq("estado_publicacion", "activo")
    .lte("stock_actual", umbralStockBajo)
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
    pedidosPendientes: pedidosPendientes ?? 0,
    ventasRealizadas: ventasRealizadas ?? 0,
    produccionesActivas: produccionesActivas ?? 0,
    productosStockBajo: stockBajo ?? [],
  };
}

export async function listarPedidosPanel(cliente: ClientePanel): Promise<PedidoPanelListado[]> {
  const { data, error } = await cliente
    .from("pedidos")
    .select("*, detalles_pedido(precio_unitario, cantidad), ventas(id)")
    .order("creado_en", { ascending: false });

  if (error) {
    throw error;
  }

  const { data: pagos, error: errorPagos } = await cliente
    .from("pagos")
    .select("monto, pedido_id, venta_id");

  if (errorPagos) {
    throw errorPagos;
  }

  return (data ?? []).map((pedido) => {
    const total =
      pedido.detalles_pedido?.reduce(
        (suma, linea) => suma + (linea.precio_unitario ?? 0) * (linea.cantidad ?? 0),
        0,
      ) ?? 0;
    const ventaId = pedido.ventas?.id ?? null;
    const abonos =
      pagos
        ?.filter((p) => p.pedido_id === pedido.id || (ventaId && p.venta_id === ventaId))
        .reduce((suma, p) => suma + (p.monto ?? 0), 0) ?? 0;

    return {
      id: pedido.id,
      numero: pedido.numero,
      nombre_cliente: pedido.nombre_cliente,
      estado: pedido.estado as "pendiente" | "entregado" | "cancelado",
      creado_en: pedido.creado_en,
      total,
      abonos,
      saldo: Math.max(0, total - abonos),
      venta_id: pedido.ventas?.id ?? null,
    };
  });
}

export interface DetallePedidoConProducto {
  id: string;
  pedido_id: string;
  producto_id: string | null;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  creado_en: string;
  producto?: {
    id: string;
    nombre: string;
    codigo_interno: string;
    stock_actual: number;
    controla_stock: boolean;
  } | null;
}

export interface HistorialEstadoPedidoPanel {
  id: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  motivo: string | null;
  creado_en: string;
  perfil: { nombre_completo: string | null } | null;
}

export interface PedidoPanelDetallado {
  id: string;
  numero: number;
  cotizacion_id: string | null;
  cliente_id: string | null;
  nombre_cliente: string;
  telefono_cliente: string | null;
  email_cliente: string | null;
  direccion_cliente: string | null;
  estado: "pendiente" | "entregado" | "cancelado";
  observaciones: string | null;
  creado_en: string;
  actualizado_en: string;
  detalles_pedido: DetallePedidoConProducto[];
  pagos: PagoPanel[];
  historial_estados_pedido: HistorialEstadoPedidoPanel[];
  venta: { id: string; numero: number } | null;
  total: number;
  abonos: number;
  saldo: number;
}

export async function obtenerPedidoPanel(
  cliente: ClientePanel,
  id: string,
): Promise<PedidoPanelDetallado | null> {
  const { data, error } = await cliente
    .from("pedidos")
    .select(
      `
      *,
      detalles_pedido(*, productos(id, nombre, codigo_interno, stock_actual, controla_stock)),
      historial_estados_pedido(*, perfiles(nombre_completo)),
      ventas(id, numero)
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const ventaId = data.ventas?.id ?? null;
  const filtroPagos = ventaId
    ? `pedido_id.eq.${data.id},venta_id.eq.${ventaId}`
    : `pedido_id.eq.${data.id}`;
  const { data: pagosRelacionados, error: errorPagos } = await cliente
    .from("pagos")
    .select("*")
    .or(filtroPagos);

  if (errorPagos) {
    throw errorPagos;
  }

  const detalles = [...(data.detalles_pedido ?? [])].sort((a, b) =>
    a.creado_en.localeCompare(b.creado_en),
  );
  const pagos = [...(pagosRelacionados ?? [])].sort((a, b) =>
    a.creado_en.localeCompare(b.creado_en),
  );
  const historial = [...(data.historial_estados_pedido ?? [])].sort((a, b) =>
    a.creado_en.localeCompare(b.creado_en),
  );

  const total = detalles.reduce(
    (suma, linea) => suma + (linea.precio_unitario ?? 0) * (linea.cantidad ?? 0),
    0,
  );
  const abonos = pagos.reduce((suma, p) => suma + (p.monto ?? 0), 0);

  return {
    id: data.id,
    numero: data.numero,
    cotizacion_id: data.cotizacion_id,
    cliente_id: data.cliente_id,
    nombre_cliente: data.nombre_cliente,
    telefono_cliente: data.telefono_cliente,
    email_cliente: data.email_cliente,
    direccion_cliente: data.direccion_cliente,
    estado: data.estado as "pendiente" | "entregado" | "cancelado",
    observaciones: data.observaciones,
    creado_en: data.creado_en,
    actualizado_en: data.actualizado_en,
    detalles_pedido: detalles.map((d) => ({
      id: d.id,
      pedido_id: d.pedido_id,
      producto_id: d.producto_id,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      creado_en: d.creado_en,
      producto: d.productos,
    })),
    pagos: pagos.map((p) => ({
      id: p.id,
      pedido_id: p.pedido_id,
      venta_id: p.venta_id,
      monto: p.monto,
      metodo_pago: p.metodo_pago as PagoPanel["metodo_pago"],
      referencia: p.referencia,
      notas: p.notas,
      creado_en: p.creado_en,
    })),
    historial_estados_pedido: historial.map((h) => ({
      id: h.id,
      estado_anterior: h.estado_anterior,
      estado_nuevo: h.estado_nuevo,
      motivo: h.motivo,
      creado_en: h.creado_en,
      perfil: h.perfiles,
    })),
    venta: data.ventas ? { id: data.ventas.id, numero: data.ventas.numero } : null,
    total,
    abonos,
    saldo: Math.max(0, total - abonos),
  };
}

export async function listarVentasPanel(cliente: ClientePanel): Promise<VentaPanelListado[]> {
  const { data, error } = await cliente
    .from("ventas")
    .select("*, detalles_venta(precio_unitario, cantidad), pedidos(id, numero)")
    .order("creado_en", { ascending: false });

  if (error) {
    throw error;
  }

  const { data: pagos, error: errorPagos } = await cliente
    .from("pagos")
    .select("monto, pedido_id, venta_id");

  if (errorPagos) {
    throw errorPagos;
  }

  return (data ?? []).map((venta) => {
    const total =
      venta.detalles_venta?.reduce(
        (suma, linea) => suma + (linea.precio_unitario ?? 0) * (linea.cantidad ?? 0),
        0,
      ) ?? 0;
    const pedidoId = venta.pedidos?.id ?? null;
    const abonos =
      pagos
        ?.filter((p) => p.venta_id === venta.id || (pedidoId && p.pedido_id === pedidoId))
        .reduce((suma, p) => suma + (p.monto ?? 0), 0) ?? 0;

    return {
      id: venta.id,
      numero: venta.numero,
      nombre_cliente: venta.nombre_cliente,
      creado_en: venta.creado_en,
      total,
      abonos,
      saldo: Math.max(0, total - abonos),
      pedido_numero: venta.pedidos?.numero ?? null,
    };
  });
}

export interface DetalleVentaConProducto {
  id: string;
  venta_id: string;
  producto_id: string | null;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  creado_en: string;
  producto?: { id: string; nombre: string; codigo_interno: string } | null;
}

export interface VentaPanelDetallada {
  id: string;
  numero: number;
  pedido_id: string | null;
  cliente_id: string | null;
  nombre_cliente: string;
  telefono_cliente: string | null;
  email_cliente: string | null;
  direccion_cliente: string | null;
  observaciones: string | null;
  creado_en: string;
  actualizado_en: string;
  detalles_venta: DetalleVentaConProducto[];
  pagos: PagoPanel[];
  pedido: { id: string; numero: number } | null;
  total: number;
  abonos: number;
  saldo: number;
}

export async function obtenerVentaPanel(
  cliente: ClientePanel,
  id: string,
): Promise<VentaPanelDetallada | null> {
  const { data, error } = await cliente
    .from("ventas")
    .select(
      `
      *,
      detalles_venta(*, productos(id, nombre, codigo_interno)),
      pedidos(id, numero)
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const pedidoId = data.pedidos?.id ?? null;
  const filtroPagos = pedidoId
    ? `venta_id.eq.${data.id},pedido_id.eq.${pedidoId}`
    : `venta_id.eq.${data.id}`;
  const { data: pagosRelacionados, error: errorPagos } = await cliente
    .from("pagos")
    .select("*")
    .or(filtroPagos);

  if (errorPagos) {
    throw errorPagos;
  }

  const detalles = [...(data.detalles_venta ?? [])].sort((a, b) =>
    a.creado_en.localeCompare(b.creado_en),
  );
  const pagos = [...(pagosRelacionados ?? [])].sort((a, b) =>
    a.creado_en.localeCompare(b.creado_en),
  );

  const total = detalles.reduce(
    (suma, linea) => suma + (linea.precio_unitario ?? 0) * (linea.cantidad ?? 0),
    0,
  );
  const abonos = pagos.reduce((suma, p) => suma + (p.monto ?? 0), 0);

  return {
    id: data.id,
    numero: data.numero,
    pedido_id: data.pedido_id,
    cliente_id: data.cliente_id,
    nombre_cliente: data.nombre_cliente,
    telefono_cliente: data.telefono_cliente,
    email_cliente: data.email_cliente,
    direccion_cliente: data.direccion_cliente,
    observaciones: data.observaciones,
    creado_en: data.creado_en,
    actualizado_en: data.actualizado_en,
    detalles_venta: detalles.map((d) => ({
      id: d.id,
      venta_id: d.venta_id,
      producto_id: d.producto_id,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      creado_en: d.creado_en,
      producto: d.productos,
    })),
    pagos: pagos.map((p) => ({
      id: p.id,
      pedido_id: p.pedido_id,
      venta_id: p.venta_id,
      monto: p.monto,
      metodo_pago: p.metodo_pago as PagoPanel["metodo_pago"],
      referencia: p.referencia,
      notas: p.notas,
      creado_en: p.creado_en,
    })),
    pedido: data.pedidos ? { id: data.pedidos.id, numero: data.pedidos.numero } : null,
    total,
    abonos,
    saldo: Math.max(0, total - abonos),
  };
}

export interface ProductoParaMovimiento {
  id: string;
  nombre: string;
  codigo_interno: string;
  stock_actual: number;
}

export async function listarProductosParaMovimiento(
  cliente: ClientePanel,
): Promise<ProductoParaMovimiento[]> {
  const { data, error } = await cliente
    .from("productos")
    .select("id, nombre, codigo_interno, stock_actual")
    .eq("controla_stock", true)
    .in("estado_publicacion", ["activo", "borrador"])
    .order("nombre");

  if (error) {
    throw error;
  }

  return (data ?? []).map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    codigo_interno: producto.codigo_interno,
    stock_actual: producto.stock_actual,
  }));
}

export async function listarMovimientosInventario(
  cliente: ClientePanel,
): Promise<MovimientoInventarioPanel[]> {
  const { data, error } = await cliente
    .from("movimientos_inventario")
    .select("*, productos(id, nombre, codigo_interno), perfiles(nombre_completo)")
    .order("creado_en", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return (data ?? []).map((movimiento) => ({
    id: movimiento.id,
    producto_id: movimiento.producto_id,
    producto: movimiento.productos,
    tipo: movimiento.tipo as MovimientoInventarioPanel["tipo"],
    cantidad: movimiento.cantidad,
    stock_resultante: movimiento.stock_resultante,
    origen: movimiento.origen as MovimientoInventarioPanel["origen"],
    notas: movimiento.notas,
    creado_en: movimiento.creado_en,
    perfil: movimiento.perfiles,
  }));
}

export async function listarProduccionesPanel(
  cliente: ClientePanel,
): Promise<ProduccionPanelListado[]> {
  const { data, error } = await cliente
    .from("producciones")
    .select("*, productos(id, nombre, codigo_interno)")
    .order("creado_en", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((produccion) => ({
    id: produccion.id,
    numero: produccion.numero,
    producto: produccion.productos,
    cantidad: produccion.cantidad,
    estado: produccion.estado as ProduccionPanelListado["estado"],
    creado_en: produccion.creado_en,
  }));
}

export async function obtenerProduccionPanel(
  cliente: ClientePanel,
  id: string,
): Promise<ProduccionPanelDetallada | null> {
  const { data, error } = await cliente
    .from("producciones")
    .select(
      `
      *,
      productos(id, nombre, codigo_interno, stock_actual, controla_stock),
      historial_estados_produccion(*, perfiles(nombre_completo))
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const historial = [...(data.historial_estados_produccion ?? [])].sort((a, b) =>
    a.creado_en.localeCompare(b.creado_en),
  );

  return {
    id: data.id,
    numero: data.numero,
    producto_id: data.producto_id,
    producto: data.productos,
    cantidad: data.cantidad,
    estado: data.estado as ProduccionPanelDetallada["estado"],
    observaciones: data.observaciones,
    creado_en: data.creado_en,
    actualizado_en: data.actualizado_en,
    historial_estados_produccion: historial.map((h) => ({
      id: h.id,
      estado_anterior: h.estado_anterior,
      estado_nuevo: h.estado_nuevo as HistorialEstadoProduccionPanel["estado_nuevo"],
      motivo: h.motivo,
      creado_en: h.creado_en,
      perfil: h.perfiles,
    })),
  };
}

interface RangoFechas {
  desde?: string;
  hasta?: string;
}

export async function obtenerReporteVentas(
  cliente: ClientePanel,
  rango: RangoFechas = {},
): Promise<ReporteVentas> {
  const { desde, hasta } = rango;

  let consulta = cliente
    .from("ventas")
    .select("*, detalles_venta(precio_unitario, cantidad, producto_id, descripcion)");

  if (desde) {
    consulta = consulta.gte("creado_en", `${desde}T00:00:00`);
  }
  if (hasta) {
    consulta = consulta.lte("creado_en", `${hasta}T23:59:59`);
  }

  const { data: ventas, error } = await consulta.order("creado_en", { ascending: true });

  if (error) {
    throw error;
  }

  const ventasListado = ventas ?? [];
  const totalVentas = ventasListado.reduce(
    (suma, venta) =>
      suma +
      (venta.detalles_venta?.reduce(
        (s, linea) => s + (linea.precio_unitario ?? 0) * (linea.cantidad ?? 0),
        0,
      ) ?? 0),
    0,
  );

  const ventaIds = ventasListado.map((v) => v.id);
  const { data: pagos, error: errorPagos } = ventaIds.length
    ? await cliente.from("pagos").select("monto, venta_id").in("venta_id", ventaIds)
    : { data: [] as { monto: number | null }[], error: null };

  if (errorPagos) {
    throw errorPagos;
  }

  const totalAbonado = (pagos ?? []).reduce((suma, pago) => suma + (pago.monto ?? 0), 0);
  const totalSaldoPendiente = Math.max(0, totalVentas - totalAbonado);

  const agregadoProductos = new Map<string, ReporteTopProducto>();
  for (const venta of ventasListado) {
    for (const linea of venta.detalles_venta ?? []) {
      const clave = linea.producto_id ?? `libre:${linea.descripcion}`;
      const existente = agregadoProductos.get(clave);
      const subtotal = (linea.precio_unitario ?? 0) * (linea.cantidad ?? 0);
      if (existente) {
        existente.unidades_vendidas += linea.cantidad ?? 0;
        existente.total_vendido += subtotal;
      } else {
        agregadoProductos.set(clave, {
          producto_id: linea.producto_id,
          descripcion: linea.descripcion,
          unidades_vendidas: linea.cantidad ?? 0,
          total_vendido: subtotal,
        });
      }
    }
  }

  const topProductos = [...agregadoProductos.values()]
    .sort((a, b) => b.total_vendido - a.total_vendido)
    .slice(0, 10)
    .map((producto) => ({
      ...producto,
      total_vendido: Math.round(producto.total_vendido * 100) / 100,
    }));

  return {
    numeroVentas: ventasListado.length,
    totalVentas: Math.round(totalVentas * 100) / 100,
    totalAbonado: Math.round(totalAbonado * 100) / 100,
    totalSaldoPendiente: Math.round(totalSaldoPendiente * 100) / 100,
    topProductos,
  };
}
