"use client";

import { useActionState, useState } from "react";

import {
  cancelarProduccion,
  completarProduccion,
  type EstadoAccionProduccion,
} from "@/lib/panel/producciones";
import type { EstadoProduccion } from "@/lib/panel/tipos";

interface Props {
  produccionId: string;
  estadoActual: EstadoProduccion;
}

export default function AccionesProduccion({ produccionId, estadoActual }: Props) {
  const [accionActual, setAccionActual] = useState<"completar" | "cancelar" | null>(null);
  const [estadoCompletar, accionCompletar, pendienteCompletar] = useActionState(
    completarProduccion,
    {} as EstadoAccionProduccion,
  );
  const [estadoCancelar, accionCancelar, pendienteCancelar] = useActionState(
    cancelarProduccion,
    {} as EstadoAccionProduccion,
  );

  if (estadoActual !== "activa") {
    return null;
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {!accionActual ? (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="boton boton--primario"
            onClick={() => setAccionActual("completar")}
          >
            Completar producción
          </button>
          <button
            type="button"
            className="boton boton--secundario"
            onClick={() => setAccionActual("cancelar")}
          >
            Cancelar orden
          </button>
        </div>
      ) : (
        <form
          action={accionActual === "completar" ? accionCompletar : accionCancelar}
          className="formulario"
          style={{ maxWidth: "42rem" }}
        >
          <input type="hidden" name="id" value={produccionId} />

          <h2>{accionActual === "completar" ? "Completar producción" : "Cancelar orden"}</h2>

          {(accionActual === "completar" ? estadoCompletar.error : estadoCancelar.error) && (
            <p role="alert" className="formulario__error">
              {accionActual === "completar" ? estadoCompletar.error : estadoCancelar.error}
            </p>
          )}

          {accionActual === "completar" ? (
            <p className="formulario__ayuda">
              Al completar, el stock del producto se incrementará automáticamente y se registrará el
              movimiento de producción.
            </p>
          ) : (
            <p className="formulario__ayuda">
              La orden quedará cancelada y no se modificará el inventario.
            </p>
          )}

          <label className="formulario__campo">
            <span className="formulario__etiqueta">Motivo o notas</span>
            <input
              type="text"
              name="motivo"
              placeholder={
                accionActual === "completar" ? "Ej: Lote terminado" : "Ej: Falta de insumos"
              }
              className="formulario__entrada"
            />
          </label>

          <div className="formulario__acciones">
            <button
              type="submit"
              disabled={pendienteCompletar || pendienteCancelar}
              className="boton boton--primario"
            >
              {pendienteCompletar || pendienteCancelar ? "Procesando..." : "Confirmar"}
            </button>
            <button
              type="button"
              className="boton boton--secundario"
              onClick={() => setAccionActual(null)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
