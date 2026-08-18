import type { Metadata } from "next";
import Link from "next/link";

import { clienteAutorizado } from "@/lib/panel/cliente";
import { listarPedidosPanel } from "@/lib/panel/consultas";
import {
  formatearFechaCotizacion,
  formatearMonedaUSD,
  formatearNumeroPedido,
} from "@/lib/panel/formato";

interface Props {
  searchParams: Promise<{ estado?: string }>;
}

export const metadata: Metadata = {
  title: "Pedidos",
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  pendiente: "Pendiente",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default async function PedidosPanelPage({ searchParams }: Props) {
  const { estado: filtroEstado } = await searchParams;
  const cliente = await clienteAutorizado();
  const todosLosPedidos = await listarPedidosPanel(cliente);

  const pedidos = filtroEstado
    ? todosLosPedidos.filter((p) => p.estado === filtroEstado)
    : todosLosPedidos;

  const conteos = {
    todos: todosLosPedidos.length,
    pendiente: todosLosPedidos.filter((p) => p.estado === "pendiente").length,
    entregado: todosLosPedidos.filter((p) => p.estado === "entregado").length,
    cancelado: todosLosPedidos.filter((p) => p.estado === "cancelado").length,
  };

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
          href="/panel/pedidos"
          className={`boton ${!filtroEstado ? "boton--primario" : "boton--secundario"} boton--pequeno`}
        >
          Todos ({conteos.todos})
        </Link>
        <Link
          href="/panel/pedidos?estado=pendiente"
          className={`boton ${filtroEstado === "pendiente" ? "boton--primario" : "boton--secundario"} boton--pequeno`}
        >
          Pendientes ({conteos.pendiente})
        </Link>
        <Link
          href="/panel/pedidos?estado=entregado"
          className={`boton ${filtroEstado === "entregado" ? "boton--primario" : "boton--secundario"} boton--pequeno`}
        >
          Entregados ({conteos.entregado})
        </Link>
        <Link
          href="/panel/pedidos?estado=cancelado"
          className={`boton ${filtroEstado === "cancelado" ? "boton--primario" : "boton--secundario"} boton--pequeno`}
        >
          Cancelados ({conteos.cancelado})
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <p className="mensaje-estado">Aún no hay pedidos.</p>
      ) : (
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
      )}
    </section>
  );
}
