import type { Metadata } from "next";
import Link from "next/link";

import Paginacion from "@/components/Paginacion";
import { clienteAutorizado } from "@/lib/panel/cliente";
import { listarVentasPanel } from "@/lib/panel/consultas";
import {
  formatearFechaCotizacion,
  formatearMonedaUSD,
  formatearNumeroPedido,
  formatearNumeroVenta,
} from "@/lib/panel/formato";
import { obtenerNumeroPagina, TAMANO_PAGINA_PANEL } from "@/lib/paginacion";

export const metadata: Metadata = {
  title: "Ventas",
};

interface Props {
  searchParams: Promise<{ pagina?: string | string[] }>;
}

export default async function VentasPanelPage({ searchParams }: Props) {
  const { pagina: paginaParametro } = await searchParams;
  const pagina = obtenerNumeroPagina(paginaParametro);
  const cliente = await clienteAutorizado();
  const { filas: ventas, total } = await listarVentasPanel(cliente, { pagina });

  return (
    <section>
      <div className="panel-titulo">
        <h1>Ventas</h1>
        <Link href="/panel/ventas/nueva" className="boton boton--primario">
          Nueva venta
        </Link>
      </div>

      {ventas.length === 0 ? (
        <p className="mensaje-estado">Aún no hay ventas registradas.</p>
      ) : (
        <>
          <div className="panel-tabla panel-tabla--ventas">
            <div className="panel-tabla__encabezado">
              <span>Nº</span>
              <span>Cliente</span>
              <span>Origen</span>
              <span>Fecha</span>
              <span>Total</span>
              <span>Cobrado</span>
              <span>Saldo</span>
              <span>Acciones</span>
            </div>
            {ventas.map((venta) => (
              <div className="panel-tabla__fila" key={venta.id}>
                <span>
                  <strong>{formatearNumeroVenta(venta.numero)}</strong>
                </span>
                <span>{venta.nombre_cliente}</span>
                <span>
                  {venta.pedido_numero ? (
                    <span className="panel-etiqueta">
                      Pedido {formatearNumeroPedido(venta.pedido_numero)}
                    </span>
                  ) : (
                    <span className="texto-secundario">Venta directa</span>
                  )}
                </span>
                <span>{formatearFechaCotizacion(venta.creado_en)}</span>
                <span>{formatearMonedaUSD(venta.total)}</span>
                <span>{formatearMonedaUSD(venta.abonos)}</span>
                <span>
                  <strong>{formatearMonedaUSD(venta.saldo)}</strong>
                </span>
                <span className="panel-lista__acciones">
                  <Link href={`/panel/ventas/${venta.id}`} className="boton boton--secundario">
                    Ver
                  </Link>
                </span>
              </div>
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            total={total}
            porPagina={TAMANO_PAGINA_PANEL}
            construirHref={(siguiente) => `/panel/ventas?pagina=${siguiente}`}
          />
        </>
      )}
    </section>
  );
}
