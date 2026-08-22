import type { Metadata } from "next";
import Link from "next/link";

import Paginacion from "@/components/Paginacion";
import { clienteAutorizado } from "@/lib/panel/cliente";
import { listarPedidosPanel } from "@/lib/panel/consultas";
import {
  formatearFechaCotizacion,
  formatearMonedaUSD,
  formatearNumeroPedido,
} from "@/lib/panel/formato";
import { obtenerNumeroPagina, TAMANO_PAGINA_PANEL } from "@/lib/paginacion";

interface Props {
  searchParams: Promise<{ estado?: string; pagina?: string | string[] }>;
}

export const metadata: Metadata = {
  title: "Pedidos",
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  pendiente: "Pendiente",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const ESTADOS_VALIDOS = ["pendiente", "entregado", "cancelado"] as const;

export default async function PedidosPanelPage({ searchParams }: Props) {
  const { estado: filtroEstado, pagina: paginaParametro } = await searchParams;
  const pagina = obtenerNumeroPagina(paginaParametro);
  const cliente = await clienteAutorizado();
  const estado = ESTADOS_VALIDOS.includes(filtroEstado as (typeof ESTADOS_VALIDOS)[number])
    ? filtroEstado
    : undefined;

  const { filas: pedidos, total, conteos } = await listarPedidosPanel(cliente, { estado, pagina });

  const construirHrefFiltro = (estadoFiltro?: string) =>
    estadoFiltro ? `/panel/pedidos?estado=${estadoFiltro}` : "/panel/pedidos";

  return (
    <section>
      <div className="panel-titulo">
        <h1>Pedidos</h1>
        <Link href="/panel/pedidos/nuevo" className="boton boton--primario">
          Nuevo pedido
        </Link>
      </div>

      <div className="panel-filtros" aria-label="Filtros de estado">
        <Link
          href={construirHrefFiltro()}
          className={`boton ${!estado ? "boton--primario" : "boton--secundario"} boton--pequeno`}
        >
          Todos ({conteos.todos})
        </Link>
        <Link
          href={construirHrefFiltro("pendiente")}
          className={`boton ${estado === "pendiente" ? "boton--primario" : "boton--secundario"} boton--pequeno`}
        >
          Pendientes ({conteos.pendiente})
        </Link>
        <Link
          href={construirHrefFiltro("entregado")}
          className={`boton ${estado === "entregado" ? "boton--primario" : "boton--secundario"} boton--pequeno`}
        >
          Entregados ({conteos.entregado})
        </Link>
        <Link
          href={construirHrefFiltro("cancelado")}
          className={`boton ${estado === "cancelado" ? "boton--primario" : "boton--secundario"} boton--pequeno`}
        >
          Cancelados ({conteos.cancelado})
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <p className="mensaje-estado">Aún no hay pedidos.</p>
      ) : (
        <>
          <div className="panel-tabla panel-tabla--pedidos">
            <div className="panel-tabla__encabezado">
              <span>Nº</span>
              <span>Cliente</span>
              <span>Estado</span>
              <span>Fecha</span>
              <span>Total</span>
              <span>Abonos</span>
              <span>Saldo</span>
              <span>Acciones</span>
            </div>
            {pedidos.map((pedido) => (
              <div className="panel-tabla__fila" key={pedido.id}>
                <span>
                  <strong>{formatearNumeroPedido(pedido.numero)}</strong>
                </span>
                <span>{pedido.nombre_cliente}</span>
                <span>
                  <span className="panel-etiqueta">
                    {ETIQUETAS_ESTADO[pedido.estado] ?? pedido.estado}
                  </span>
                </span>
                <span>{formatearFechaCotizacion(pedido.creado_en)}</span>
                <span>{formatearMonedaUSD(pedido.total)}</span>
                <span>{formatearMonedaUSD(pedido.abonos)}</span>
                <span>
                  <strong>{formatearMonedaUSD(pedido.saldo)}</strong>
                </span>
                <span className="panel-lista__acciones">
                  <Link href={`/panel/pedidos/${pedido.id}`} className="boton boton--secundario">
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
            construirHref={(siguiente) => {
              const parametros = new URLSearchParams();
              if (estado) {
                parametros.set("estado", estado);
              }
              parametros.set("pagina", String(siguiente));
              return `/panel/pedidos?${parametros.toString()}`;
            }}
          />
        </>
      )}
    </section>
  );
}
