import type { Metadata } from "next";

import { clienteAutorizado } from "@/lib/panel/cliente";
import { obtenerReporteVentas } from "@/lib/panel/consultas";
import { formatearMonedaUSD } from "@/lib/panel/formato";

interface Props {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}

export const metadata: Metadata = {
  title: "Reportes",
};

export default async function ReportesPanelPage({ searchParams }: Props) {
  const { desde, hasta } = await searchParams;
  const cliente = await clienteAutorizado();

  const reporte = await obtenerReporteVentas(cliente, { desde, hasta });

  return (
    <section>
      <div className="panel-titulo">
        <h1>Reportes de ventas</h1>
      </div>

      <form method="get" className="panel-filtros" aria-label="Filtro por rango de fechas">
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          Desde
          <input
            className="formulario__entrada"
            type="date"
            name="desde"
            defaultValue={desde ?? ""}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          Hasta
          <input
            className="formulario__entrada"
            type="date"
            name="hasta"
            defaultValue={hasta ?? ""}
          />
        </label>
        <button type="submit" className="boton boton--primario boton--pequeno">
          Aplicar
        </button>
        {(desde || hasta) && (
          <a href="/panel/reportes" className="boton boton--secundario boton--pequeno">
            Limpiar
          </a>
        )}
      </form>

      <ul className="resumen-tarjetas">
        <li className="resumen-tarjeta">
          <span className="resumen-tarjeta__valor">{reporte.numeroVentas}</span>
          <span className="resumen-tarjeta__etiqueta">Ventas en el período</span>
        </li>
        <li className="resumen-tarjeta">
          <span className="resumen-tarjeta__valor">{formatearMonedaUSD(reporte.totalVentas)}</span>
          <span className="resumen-tarjeta__etiqueta">Total vendido</span>
        </li>
        <li className="resumen-tarjeta">
          <span className="resumen-tarjeta__valor">{formatearMonedaUSD(reporte.totalAbonado)}</span>
          <span className="resumen-tarjeta__etiqueta">Total cobrado</span>
        </li>
        <li className="resumen-tarjeta">
          <span className="resumen-tarjeta__valor">
            {formatearMonedaUSD(reporte.totalSaldoPendiente)}
          </span>
          <span className="resumen-tarjeta__etiqueta">Saldo por cobrar</span>
        </li>
      </ul>

      <div style={{ marginTop: "2rem" }}>
        <h2>Top productos vendidos</h2>
        {reporte.topProductos.length === 0 ? (
          <p className="mensaje-estado">Sin ventas en el período seleccionado.</p>
        ) : (
          <div className="panel-tabla panel-tabla--ventas">
            <div className="panel-tabla__encabezado">
              <span>#</span>
              <span>Producto</span>
              <span>Unidades vendidas</span>
              <span>Total vendido</span>
            </div>
            {reporte.topProductos.map((producto, indice) => (
              <div className="panel-tabla__fila" key={`${producto.producto_id}-${indice}`}>
                <span>
                  <strong>{indice + 1}</strong>
                </span>
                <span>{producto.descripcion}</span>
                <span>{producto.unidades_vendidas}</span>
                <span>
                  <strong>{formatearMonedaUSD(producto.total_vendido)}</strong>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
