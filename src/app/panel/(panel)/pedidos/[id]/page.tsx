import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ModalCambiarEstadoPedido from "@/components/panel/ModalCambiarEstadoPedido";
import SeccionAbonos from "@/components/panel/SeccionAbonos";
import { clienteAutorizado } from "@/lib/panel/cliente";
import { obtenerPedidoPanel } from "@/lib/panel/consultas";
import {
  formatearFechaHora,
  formatearMonedaUSD,
  formatearNumeroPedido,
  formatearNumeroVenta,
} from "@/lib/panel/formato";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Detalle de pedido",
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  pendiente: "Pendiente",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default async function DetallePedidoPage({ params }: Props) {
  const { id } = await params;
  const cliente = await clienteAutorizado();
  const pedido = await obtenerPedidoPanel(cliente, id);

  if (!pedido) {
    notFound();
  }

  return (
    <section>
      <div className="panel-titulo">
        <div>
          <h1>{formatearNumeroPedido(pedido.numero)}</h1>
          <p className="formulario__ayuda" style={{ marginTop: "0.25rem" }}>
            Registrado el {formatearFechaHora(pedido.creado_en)} · Estado:{" "}
            <span className="panel-etiqueta">
              {ETIQUETAS_ESTADO[pedido.estado] ?? pedido.estado}
            </span>
          </p>
        </div>

        <div className="panel-lista__acciones">
          <Link href="/panel/pedidos" className="boton boton--secundario">
            Volver
          </Link>
          {pedido.venta && (
            <Link href={`/panel/ventas/${pedido.venta.id}`} className="boton boton--primario">
              Ver venta {formatearNumeroVenta(pedido.venta.numero)}
            </Link>
          )}
        </div>
      </div>

      {pedido.cotizacion_id && (
        <p className="formulario__ayuda" style={{ marginBottom: "1rem" }}>
          ℹ️ Este pedido se originó a partir de una cotización.{" "}
          <Link href={`/panel/cotizaciones/${pedido.cotizacion_id}`}>Ver cotización</Link>
        </p>
      )}

      <div style={{ margin: "1.5rem 0", display: "grid", gap: "0.5rem" }}>
        <h2>Cliente</h2>
        <p>
          <strong>Nombre:</strong> {pedido.nombre_cliente}
        </p>
        {pedido.telefono_cliente && (
          <p>
            <strong>Teléfono:</strong> {pedido.telefono_cliente}
          </p>
        )}
        {pedido.email_cliente && (
          <p>
            <strong>Correo:</strong> {pedido.email_cliente}
          </p>
        )}
        {pedido.direccion_cliente && (
          <p>
            <strong>Dirección de entrega:</strong> {pedido.direccion_cliente}
          </p>
        )}
        {pedido.observaciones && (
          <p>
            <strong>Observaciones:</strong> {pedido.observaciones}
          </p>
        )}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Artículos del pedido</h2>
        <div className="panel-tabla panel-tabla--detalle-pedido" style={{ marginTop: "1rem" }}>
          <div className="panel-tabla__encabezado">
            <span>Cant.</span>
            <span>Descripción</span>
            <span>Tipo / Stock</span>
            <span>Precio unitario</span>
            <span>Subtotal</span>
          </div>
          {pedido.detalles_pedido.map((linea) => (
            <div className="panel-tabla__fila" key={linea.id}>
              <span>
                <strong>{linea.cantidad}</strong>
              </span>
              <span>{linea.descripcion}</span>
              <span>
                {linea.producto ? (
                  <span className="texto-secundario">
                    {linea.producto.controla_stock
                      ? `Stock: ${linea.producto.stock_actual}`
                      : "Bajo pedido"}
                  </span>
                ) : (
                  <span className="texto-secundario">Personalizado</span>
                )}
              </span>
              <span>{formatearMonedaUSD(linea.precio_unitario)}</span>
              <span>
                <strong>{formatearMonedaUSD(linea.precio_unitario * linea.cantidad)}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      <ModalCambiarEstadoPedido
        pedidoId={pedido.id}
        estadoActual={pedido.estado}
        tieneVenta={Boolean(pedido.venta)}
      />

      {/* Abonos y pagos */}
      <SeccionAbonos
        pedidoId={pedido.id}
        total={pedido.total}
        abonos={pedido.pagos}
        saldo={pedido.saldo}
        bloqueado={pedido.estado === "cancelado"}
      />

      {/* Historial de transiciones */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Historial de estados</h2>
        {pedido.historial_estados_pedido.length === 0 ? (
          <p className="mensaje-estado">Sin registros de cambios de estado.</p>
        ) : (
          <ul className="resumen-lista" style={{ marginTop: "1rem" }}>
            {pedido.historial_estados_pedido.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  border: "1px solid var(--color-borde)",
                  borderRadius: "var(--radio-suave)",
                  marginBottom: "0.5rem",
                  background: "var(--color-superficie)",
                }}
              >
                <div>
                  <span className="panel-etiqueta" style={{ marginRight: "0.5rem" }}>
                    {item.estado_anterior
                      ? `${item.estado_anterior} → ${item.estado_nuevo}`
                      : `Inicial: ${item.estado_nuevo}`}
                  </span>
                  {item.motivo && <span>{item.motivo}</span>}
                  {item.perfil?.nombre_completo && (
                    <span
                      className="formulario__ayuda"
                      style={{ display: "block", marginTop: "0.25rem" }}
                    >
                      Por: {item.perfil.nombre_completo}
                    </span>
                  )}
                </div>
                <span className="formulario__ayuda">{formatearFechaHora(item.creado_en)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
