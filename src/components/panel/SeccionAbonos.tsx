"use client";

import { useActionState, useState } from "react";

import { formatearFechaHora, formatearMonedaUSD } from "@/lib/panel/formato";
import { eliminarAbono, registrarAbono, type EstadoFormularioPago } from "@/lib/panel/pagos";
import type { PagoPanel } from "@/lib/panel/tipos";

interface Props {
  pedidoId?: string;
  ventaId?: string;
  total: number;
  abonos: PagoPanel[];
  saldo: number;
  bloqueado?: boolean;
}

const METODOS: { valor: PagoPanel["metodo_pago"]; etiqueta: string }[] = [
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "transferencia", etiqueta: "Transferencia Bancaria" },
  { valor: "deposito", etiqueta: "Depósito" },
  { valor: "tarjeta", etiqueta: "Tarjeta" },
  { valor: "otro", etiqueta: "Otro" },
];

export default function SeccionAbonos({
  pedidoId,
  ventaId,
  total,
  abonos,
  saldo,
  bloqueado = false,
}: Props) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const estadoInicial: EstadoFormularioPago = {};
  const [estado, accion, pendiente] = useActionState(registrarAbono, estadoInicial);

  const totalAbonado = abonos.reduce((suma, a) => suma + a.monto, 0);
  const pagadoCompleto = saldo <= 0 && total > 0;

  return (
    <div className="ocultar-al-imprimir" style={{ marginTop: "2rem" }}>
      <div className="panel-titulo">
        <h2>Abonos y Pagos</h2>
        {!bloqueado && !pagadoCompleto && (
          <button
            type="button"
            className="boton boton--secundario"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? "Cancelar" : "+ Registrar abono"}
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", margin: "1rem 0" }}>
        <p>
          Total: <strong>{formatearMonedaUSD(total)}</strong>
        </p>
        <p>
          Abonado: <strong>{formatearMonedaUSD(totalAbonado)}</strong>
        </p>
        <p>
          Saldo pendiente:{" "}
          <strong style={{ color: saldo > 0 ? "var(--color-primario)" : "inherit" }}>
            {formatearMonedaUSD(saldo)}
          </strong>
        </p>
        <div>
          {pagadoCompleto ? (
            <span className="panel-etiqueta">Totalmente pagado</span>
          ) : totalAbonado > 0 ? (
            <span className="panel-etiqueta">Abono parcial</span>
          ) : (
            <span className="panel-etiqueta">Pendiente de pago</span>
          )}
        </div>
      </div>

      {mostrarFormulario && !bloqueado && (
        <form action={accion} className="formulario" style={{ marginBottom: "1.5rem" }}>
          <input type="hidden" name="pedido_id" value={pedidoId ?? ""} />
          <input type="hidden" name="venta_id" value={ventaId ?? ""} />

          {estado.errores?.formulario && (
            <p role="alert" className="formulario__error">
              {estado.errores.formulario}
            </p>
          )}

          <div className="formulario__fila">
            <label className="formulario__campo">
              <span className="formulario__etiqueta">Monto del abono ($) *</span>
              <input
                className="formulario__entrada"
                type="number"
                name="monto"
                step="0.01"
                min="0.01"
                max={saldo > 0 ? saldo : undefined}
                defaultValue={saldo > 0 ? saldo : ""}
                required
              />
              {estado.errores?.monto && (
                <span className="formulario__error">{estado.errores.monto}</span>
              )}
            </label>

            <label className="formulario__campo">
              <span className="formulario__etiqueta">Método de pago</span>
              <select className="formulario__entrada" name="metodo_pago" defaultValue="efectivo">
                {METODOS.map((m) => (
                  <option key={m.valor} value={m.valor}>
                    {m.etiqueta}
                  </option>
                ))}
              </select>
            </label>

            <label className="formulario__campo">
              <span className="formulario__etiqueta">Referencia / Comprobante</span>
              <input
                className="formulario__entrada"
                type="text"
                name="referencia"
                placeholder="Ej: Trf #12345"
              />
            </label>
          </div>

          <label className="formulario__campo">
            <span className="formulario__etiqueta">Notas</span>
            <input
              className="formulario__entrada"
              type="text"
              name="notas"
              placeholder="Detalle adicional"
            />
          </label>

          <div className="formulario__acciones">
            <button type="submit" disabled={pendiente} className="boton boton--primario">
              {pendiente ? "Guardando..." : "Guardar abono"}
            </button>
            <button
              type="button"
              className="boton boton--secundario"
              onClick={() => setMostrarFormulario(false)}
            >
              Cerrar
            </button>
          </div>
        </form>
      )}

      {abonos.length === 0 ? (
        <p className="mensaje-estado">Aún no se han registrado abonos.</p>
      ) : (
        <div className="panel-tabla panel-tabla--abonos">
          <div className="panel-tabla__encabezado">
            <span>Fecha</span>
            <span>Método</span>
            <span>Referencia</span>
            <span>Notas</span>
            <span>Monto</span>
            <span>Acciones</span>
          </div>
          {abonos.map((abono) => (
            <div className="panel-tabla__fila" key={abono.id}>
              <span>{formatearFechaHora(abono.creado_en)}</span>
              <span>
                <span className="panel-etiqueta">{abono.metodo_pago.toUpperCase()}</span>
              </span>
              <span>{abono.referencia || "—"}</span>
              <span>{abono.notas || "—"}</span>
              <span>
                <strong>{formatearMonedaUSD(abono.monto)}</strong>
              </span>
              <span className="panel-lista__acciones">
                {!bloqueado ? (
                  <form action={eliminarAbono}>
                    <input type="hidden" name="id" value={abono.id} />
                    <input type="hidden" name="pedido_id" value={pedidoId ?? ""} />
                    <input type="hidden" name="venta_id" value={ventaId ?? ""} />
                    <button
                      type="submit"
                      className="boton boton--peligro boton--pequeno"
                      onClick={(e) => {
                        if (!confirm("¿Eliminar este abono?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </form>
                ) : (
                  <span>—</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
