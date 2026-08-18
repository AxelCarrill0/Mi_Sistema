"use client";

import Link from "next/link";
import { useActionState } from "react";

import { crearProduccion, type EstadoFormularioProduccion } from "@/lib/panel/producciones";
import type { ProductoParaMovimiento } from "@/lib/panel/consultas";

interface Props {
  productos: ProductoParaMovimiento[];
}

export default function FormularioProduccion({ productos }: Props) {
  const estadoInicial: EstadoFormularioProduccion = {};
  const [estado, accion, pendiente] = useActionState(crearProduccion, estadoInicial);

  return (
    <form action={accion} className="formulario">
      {estado.errores?.formulario && (
        <p role="alert" className="formulario__error">
          {estado.errores.formulario}
        </p>
      )}

      <div className="formulario__fila">
        <label className="formulario__campo">
          <span className="formulario__etiqueta">Producto a producir *</span>
          <select name="producto_id" className="formulario__entrada" required defaultValue="">
            <option value="" disabled>
              Selecciona un producto
            </option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} ({producto.codigo_interno}) · Stock actual:{" "}
                {producto.stock_actual}
              </option>
            ))}
          </select>
          {estado.errores?.producto_id && (
            <span className="formulario__error">{estado.errores.producto_id}</span>
          )}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Cantidad a producir *</span>
          <input
            className="formulario__entrada"
            type="number"
            name="cantidad"
            min="1"
            step="1"
            placeholder="Ej: 20"
            required
          />
          {estado.errores?.cantidad && (
            <span className="formulario__error">{estado.errores.cantidad}</span>
          )}
        </label>
      </div>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Observaciones</span>
        <textarea className="formulario__entrada" name="observaciones" rows={3} />
      </label>

      <p className="formulario__ayuda">
        Al completar esta orden, el stock del producto se incrementará automáticamente con la
        cantidad producida.
      </p>

      <div className="formulario__acciones">
        <button type="submit" disabled={pendiente} className="boton boton--primario">
          {pendiente ? "Creando..." : "Crear orden de producción"}
        </button>
        <Link href="/panel/inventario?seccion=produccion" className="boton boton--secundario">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
