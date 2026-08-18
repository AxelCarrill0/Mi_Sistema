"use client";

import { useActionState, useState } from "react";

import { cambiarEstadoPedido, type EstadoCambioPedido } from "@/lib/panel/pedidos";

interface Props {
  pedidoId: string;
  estadoActual: "pendiente" | "entregado" | "cancelado";
  tieneVenta: boolean;
}

export default function ModalCambiarEstadoPedido({ pedidoId, estadoActual, tieneVenta }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<
    "pendiente" | "entregado" | "cancelado"
  >(estadoActual === "pendiente" ? "entregado" : estadoActual);
  const estadoInicial: EstadoCambioPedido = {};
  const [estadoAction, accion, pendiente] = useActionState(cambiarEstadoPedido, estadoInicial);

  if (estadoActual === "entregado" || tieneVenta) {
    return null;
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {!abierto ? (
        <button type="button" className="boton boton--primario" onClick={() => setAbierto(true)}>
          Cambiar estado del pedido
        </button>
      ) : (
        <form action={accion} className="formulario" style={{ maxWidth: "42rem" }}>
          <input type="hidden" name="id" value={pedidoId} />

          <h2>Actualizar estado</h2>

          {estadoAction?.error && (
            <p role="alert" className="formulario__error">
              {estadoAction.error}
            </p>
          )}

          <label className="formulario__campo">
            <span className="formulario__etiqueta">Nuevo estado</span>
            <select
              id="nuevo-estado-select"
              name="estado"
              value={estadoSeleccionado}
              onChange={(e) =>
                setEstadoSeleccionado(e.target.value as "pendiente" | "entregado" | "cancelado")
              }
              className="formulario__entrada"
            >
              <option value="pendiente">Pendiente</option>
              <option value="entregado">Entregado (Finalizar y convertir a venta)</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>

          {estadoSeleccionado === "entregado" && (
            <p className="formulario__ayuda">
              Al marcar como <strong>Entregado</strong>, el sistema generará automáticamente una{" "}
              <strong>Venta</strong>, descontará el stock de inventario y transferirá los abonos.
            </p>
          )}

          {estadoSeleccionado === "cancelado" && (
            <p className="formulario__ayuda">
              El pedido quedará cancelado en el historial (no se descuenta inventario).
            </p>
          )}

          <label className="formulario__campo">
            <span className="formulario__etiqueta">Motivo o notas del cambio</span>
            <input
              id="motivo-cambio"
              type="text"
              name="motivo"
              placeholder="Ej: Entregado al cliente en tienda"
              className="formulario__entrada"
            />
          </label>

          <div className="formulario__acciones">
            <button type="submit" disabled={pendiente} className="boton boton--primario">
              {pendiente ? "Procesando..." : "Confirmar cambio"}
            </button>
            <button
              type="button"
              className="boton boton--secundario"
              onClick={() => setAbierto(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
