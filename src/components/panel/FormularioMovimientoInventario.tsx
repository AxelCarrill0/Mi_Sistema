"use client";

import { useActionState } from "react";

import {
  registrarMovimientoInventario,
  type EstadoFormularioInventario,
} from "@/lib/panel/inventario";
import type { ProductoParaMovimiento } from "@/lib/panel/consultas";

interface Props {
  productos: ProductoParaMovimiento[];
}

export default function FormularioMovimientoInventario({ productos }: Props) {
  const estadoInicial: EstadoFormularioInventario = {};
  const [estado, accion, pendiente] = useActionState(registrarMovimientoInventario, estadoInicial);

  return (
    <form action={accion} className="formulario">
      {estado.errores?.formulario && (
        <p role="alert" className="formulario__error">
          {estado.errores.formulario}
        </p>
      )}

      {estado.exito && (
        <p role="status" className="formulario__ayuda">
          Movimiento registrado correctamente.
        </p>
      )}

      <div className="formulario__fila">
        <label className="formulario__campo">
          <span className="formulario__etiqueta">Producto *</span>
          <select name="producto_id" className="formulario__entrada" required defaultValue="">
            <option value="" disabled>
              Selecciona un producto
            </option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} ({producto.codigo_interno}) · Stock: {producto.stock_actual}
              </option>
            ))}
          </select>
          {estado.errores?.producto_id && (
            <span className="formulario__error">{estado.errores.producto_id}</span>
          )}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Tipo de movimiento *</span>
          <select name="tipo" className="formulario__entrada" required defaultValue="entrada">
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="ajuste">Ajuste de stock</option>
          </select>
          {estado.errores?.tipo && <span className="formulario__error">{estado.errores.tipo}</span>}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Cantidad *</span>
          <input
            className="formulario__entrada"
            type="number"
            name="cantidad"
            min="1"
            step="1"
            placeholder="Ej: 10"
            required
          />
          {estado.errores?.cantidad && (
            <span className="formulario__error">{estado.errores.cantidad}</span>
          )}
        </label>
      </div>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Notas</span>
        <input
          className="formulario__entrada"
          type="text"
          name="notas"
          placeholder="Motivo o referencia del movimiento"
        />
      </label>

      <div className="formulario__acciones">
        <button type="submit" disabled={pendiente} className="boton boton--primario">
          {pendiente ? "Registrando..." : "Registrar movimiento"}
        </button>
      </div>
    </form>
  );
}
