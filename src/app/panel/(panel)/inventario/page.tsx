import type { Metadata } from "next";
import Link from "next/link";

import FormularioMovimientoInventario from "@/components/panel/FormularioMovimientoInventario";
import { clienteAutorizado } from "@/lib/panel/cliente";
import {
  listarMovimientosInventario,
  listarProduccionesPanel,
  listarProductosParaMovimiento,
  obtenerConfiguracionPanel,
} from "@/lib/panel/consultas";
import {
  formatearFechaCotizacion,
  formatearFechaHora,
  formatearNumeroProduccion,
} from "@/lib/panel/formato";

interface Props {
  searchParams: Promise<{ seccion?: string; estado?: string }>;
}

export const metadata: Metadata = {
  title: "Inventario",
};

const ETIQUETAS_TIPO: Record<string, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
  produccion: "Producción",
};

const ETIQUETAS_ORIGEN: Record<string, string> = {
  venta: "Venta",
  pedido: "Pedido",
  produccion: "Producción",
  manual: "Manual",
};

const ETIQUETAS_ESTADO_PRODUCCION: Record<string, string> = {
  activa: "Activa",
  completada: "Completada",
  cancelada: "Cancelada",
};

const SECCIONES = ["movimientos", "stock", "produccion"] as const;
type Seccion = (typeof SECCIONES)[number];

export default async function InventarioPanelPage({ searchParams }: Props) {
  const { seccion, estado: filtroEstado } = await searchParams;
  const seccionActiva: Seccion = SECCIONES.includes(seccion as Seccion)
    ? (seccion as Seccion)
    : "movimientos";

  const cliente = await clienteAutorizado();

  const [productos, movimientos, configuracion, producciones] = await Promise.all([
    listarProductosParaMovimiento(cliente),
    listarMovimientosInventario(cliente),
    obtenerConfiguracionPanel(cliente),
    listarProduccionesPanel(cliente),
  ]);

  const { data: stockBajo, error: errorStockBajo } = await cliente
    .from("productos")
    .select("id, codigo_interno, nombre, stock_actual")
    .eq("controla_stock", true)
    .eq("estado_publicacion", "activo")
    .lte("stock_actual", configuracion.umbralStockBajo)
    .order("stock_actual", { ascending: true })
    .limit(50);

  if (errorStockBajo) {
    throw errorStockBajo;
  }

  const produccionesFiltradas = filtroEstado
    ? producciones.filter((p) => p.estado === filtroEstado)
    : producciones;

  const conteosProduccion = {
    todas: producciones.length,
    activa: producciones.filter((p) => p.estado === "activa").length,
    completada: producciones.filter((p) => p.estado === "completada").length,
    cancelada: producciones.filter((p) => p.estado === "cancelada").length,
  };

  return (
    <section>
      <div className="panel-titulo">
        <h1>Inventario</h1>
        {seccionActiva === "produccion" && (
          <Link href="/panel/inventario/produccion-nueva" className="boton boton--primario">
            Nueva orden de producción
          </Link>
        )}
      </div>

      <nav className="panel-filtros-tabs" aria-label="Secciones de inventario">
        <Link
          href="/panel/inventario?seccion=movimientos"
          className={`panel-tab ${seccionActiva === "movimientos" ? "panel-tab--activo" : ""}`}
        >
          Movimientos
        </Link>
        <Link
          href="/panel/inventario?seccion=stock"
          className={`panel-tab ${seccionActiva === "stock" ? "panel-tab--activo" : ""}`}
        >
          Stock bajo
        </Link>
        <Link
          href="/panel/inventario?seccion=produccion"
          className={`panel-tab ${seccionActiva === "produccion" ? "panel-tab--activo" : ""}`}
        >
          Producción
        </Link>
      </nav>

      {seccionActiva === "movimientos" && (
        <div style={{ display: "grid", gap: "2.5rem", marginTop: "2rem" }}>
          <div>
            <h2>Registrar movimiento</h2>
            <FormularioMovimientoInventario productos={productos} />
          </div>

          <div>
            <h2>Últimos movimientos</h2>
            {movimientos.length === 0 ? (
              <p className="mensaje-estado">Aún no hay movimientos de inventario.</p>
            ) : (
              <div className="panel-tabla panel-tabla--ventas">
                <div className="panel-tabla__encabezado">
                  <span>Fecha</span>
                  <span>Producto</span>
                  <span>Tipo</span>
                  <span>Origen</span>
                  <span>Cantidad</span>
                  <span>Stock resultante</span>
                  <span>Notas</span>
                </div>
                {movimientos.map((movimiento) => (
                  <div className="panel-tabla__fila" key={movimiento.id}>
                    <span>{formatearFechaHora(movimiento.creado_en)}</span>
                    <span>
                      {movimiento.producto
                        ? `${movimiento.producto.nombre} (${movimiento.producto.codigo_interno})`
                        : "—"}
                    </span>
                    <span>
                      <span className="panel-etiqueta">
                        {ETIQUETAS_TIPO[movimiento.tipo] ?? movimiento.tipo}
                      </span>
                    </span>
                    <span>{ETIQUETAS_ORIGEN[movimiento.origen] ?? movimiento.origen}</span>
                    <span>
                      <strong>
                        {movimiento.cantidad > 0 ? "+" : ""}
                        {movimiento.cantidad}
                      </strong>
                    </span>
                    <span>{movimiento.stock_resultante}</span>
                    <span>{movimiento.notas || "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {seccionActiva === "stock" && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Productos con stock bajo</h2>
          <p className="formulario__ayuda">
            Umbral configurado: <strong>{configuracion.umbralStockBajo} unidades</strong>.{" "}
            <Link href="/panel/configuracion">Cambiar en Configuración</Link>.
          </p>
          {stockBajo.length === 0 ? (
            <p className="mensaje-estado">Sin productos con stock bajo.</p>
          ) : (
            <ul className="resumen-lista">
              {stockBajo.map((producto) => (
                <li key={producto.id}>
                  <span>
                    {producto.codigo_interno} · {producto.nombre}
                  </span>
                  <span className="resumen-lista__stock">{producto.stock_actual} unidades</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {seccionActiva === "produccion" && (
        <div style={{ marginTop: "2rem" }}>
          <div className="panel-filtros" aria-label="Filtros de estado de producción">
            <Link
              href="/panel/inventario?seccion=produccion"
              className={`boton ${!filtroEstado ? "boton--primario" : "boton--secundario"} boton--pequeno`}
            >
              Todas ({conteosProduccion.todas})
            </Link>
            <Link
              href="/panel/inventario?seccion=produccion&estado=activa"
              className={`boton ${filtroEstado === "activa" ? "boton--primario" : "boton--secundario"} boton--pequeno`}
            >
              Activas ({conteosProduccion.activa})
            </Link>
            <Link
              href="/panel/inventario?seccion=produccion&estado=completada"
              className={`boton ${filtroEstado === "completada" ? "boton--primario" : "boton--secundario"} boton--pequeno`}
            >
              Completadas ({conteosProduccion.completada})
            </Link>
            <Link
              href="/panel/inventario?seccion=produccion&estado=cancelada"
              className={`boton ${filtroEstado === "cancelada" ? "boton--primario" : "boton--secundario"} boton--pequeno`}
            >
              Canceladas ({conteosProduccion.cancelada})
            </Link>
          </div>

          {produccionesFiltradas.length === 0 ? (
            <p className="mensaje-estado">Aún no hay órdenes de producción.</p>
          ) : (
            <div className="panel-tabla panel-tabla--pedidos">
              <div className="panel-tabla__encabezado">
                <span>Nº</span>
                <span>Producto</span>
                <span>Cantidad</span>
                <span>Estado</span>
                <span>Fecha</span>
                <span>Acciones</span>
              </div>
              {produccionesFiltradas.map((produccion) => (
                <div className="panel-tabla__fila" key={produccion.id}>
                  <span>
                    <strong>{formatearNumeroProduccion(produccion.numero)}</strong>
                  </span>
                  <span>
                    {produccion.producto
                      ? `${produccion.producto.nombre} (${produccion.producto.codigo_interno})`
                      : "—"}
                  </span>
                  <span>{produccion.cantidad}</span>
                  <span>
                    <span className="panel-etiqueta">
                      {ETIQUETAS_ESTADO_PRODUCCION[produccion.estado] ?? produccion.estado}
                    </span>
                  </span>
                  <span>{formatearFechaCotizacion(produccion.creado_en)}</span>
                  <span className="panel-lista__acciones">
                    <Link
                      href={`/panel/inventario/produccion/${produccion.id}`}
                      className="boton boton--secundario"
                    >
                      Ver
                    </Link>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
