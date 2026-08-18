import type { Database } from "@/lib/supabase/database.types";

export type RolPanel = "administrador" | "operador";

export interface UsuarioAutorizado {
  id: string;
  email: string;
  rol: RolPanel;
}

export interface ProductoStockBajo {
  id: string;
  codigo_interno: string;
  nombre: string;
  stock_actual: number;
}

export interface ResumenPanel {
  productosActivos: number;
  productosBorrador: number;
  productosDesactivados: number;
  colecciones: number;
  categorias: number;
  pedidosPendientes: number;
  ventasRealizadas: number;
  produccionesActivas: number;
  productosStockBajo: ProductoStockBajo[];
}

export type TablaPanel = keyof Pick<
  Database["public"]["Tables"],
  | "productos"
  | "colecciones"
  | "categorias"
  | "perfiles"
  | "pedidos"
  | "ventas"
  | "pagos"
  | "movimientos_inventario"
  | "producciones"
>;

export interface PagoPanel {
  id: string;
  pedido_id: string | null;
  venta_id: string | null;
  monto: number;
  metodo_pago: "efectivo" | "transferencia" | "deposito" | "tarjeta" | "otro";
  referencia: string | null;
  notas: string | null;
  creado_en: string;
}

export interface PedidoPanelListado {
  id: string;
  numero: number;
  nombre_cliente: string;
  estado: "pendiente" | "entregado" | "cancelado";
  creado_en: string;
  total: number;
  abonos: number;
  saldo: number;
  venta_id?: string | null;
}

export interface VentaPanelListado {
  id: string;
  numero: number;
  nombre_cliente: string;
  creado_en: string;
  total: number;
  abonos: number;
  saldo: number;
  pedido_numero?: number | null;
}

export type TipoMovimientoInventario = "entrada" | "salida" | "ajuste" | "produccion";
export type OrigenMovimientoInventario = "venta" | "pedido" | "produccion" | "manual";
export type EstadoProduccion = "activa" | "completada" | "cancelada";

export interface MovimientoInventarioPanel {
  id: string;
  producto_id: string;
  producto: { id: string; nombre: string; codigo_interno: string } | null;
  tipo: TipoMovimientoInventario;
  cantidad: number;
  stock_resultante: number;
  origen: OrigenMovimientoInventario;
  notas: string | null;
  creado_en: string;
  perfil: { nombre_completo: string | null } | null;
}

export interface ProductoConStockPanel {
  id: string;
  nombre: string;
  codigo_interno: string;
  stock_actual: number;
}

export interface ProduccionPanelListado {
  id: string;
  numero: number;
  producto: { id: string; nombre: string; codigo_interno: string } | null;
  cantidad: number;
  estado: EstadoProduccion;
  creado_en: string;
}

export interface HistorialEstadoProduccionPanel {
  id: string;
  estado_anterior: string | null;
  estado_nuevo: EstadoProduccion;
  motivo: string | null;
  creado_en: string;
  perfil: { nombre_completo: string | null } | null;
}

export interface ProduccionPanelDetallada {
  id: string;
  numero: number;
  producto_id: string;
  producto: {
    id: string;
    nombre: string;
    codigo_interno: string;
    stock_actual: number;
    controla_stock: boolean;
  } | null;
  cantidad: number;
  estado: EstadoProduccion;
  observaciones: string | null;
  creado_en: string;
  actualizado_en: string;
  historial_estados_produccion: HistorialEstadoProduccionPanel[];
}

export interface ReporteTopProducto {
  producto_id: string | null;
  descripcion: string;
  unidades_vendidas: number;
  total_vendido: number;
}

export interface ReporteVentas {
  numeroVentas: number;
  totalVentas: number;
  totalAbonado: number;
  totalSaldoPendiente: number;
  topProductos: ReporteTopProducto[];
}
