"use client";

import { useActionState } from "react";

import type { EstadoFormulario } from "@/lib/panel/acciones";

export interface OpcionPanel {
  id: string;
  nombre: string;
  activa?: boolean;
}

export interface ValoresProductoFormulario {
  nombre?: string;
  codigo_interno?: string;
  descripcion?: string;
  coleccion_id?: string;
  categoria_id?: string;
  tipo_producto?: string;
  precio_base?: string;
  controla_stock?: boolean;
  stock_actual?: string;
  materiales?: string;
  medidas?: string;
  colores_acabados?: string;
  tiempo_elaboracion?: string;
  estado_publicacion?: string;
  destacado?: boolean;
  mensaje_whatsapp?: string;
}

interface Props {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  colecciones: OpcionPanel[];
  categorias: OpcionPanel[];
  valoresIniciales?: ValoresProductoFormulario;
}

export default function FormularioProducto({
  accion,
  colecciones,
  categorias,
  valoresIniciales = {},
}: Props) {
  const [estado, formAction, pendiente] = useActionState(accion, {
    valores: valoresIniciales,
  });

  return (
    <form action={formAction} className="formulario">
      {estado.errores?.formulario ? (
        <p role="alert" className="formulario__error">
          {estado.errores.formulario}
        </p>
      ) : null}

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Nombre</span>
        <input
          className="formulario__entrada"
          type="text"
          name="nombre"
          defaultValue={valoresIniciales.nombre ?? ""}
          required
        />
        {estado.errores?.nombre ? (
          <span className="formulario__error">{estado.errores.nombre}</span>
        ) : null}
      </label>

      <div className="formulario__fila">
        <label className="formulario__campo">
          <span className="formulario__etiqueta">Código interno</span>
          <input
            className="formulario__entrada"
            type="text"
            name="codigo_interno"
            defaultValue={valoresIniciales.codigo_interno ?? ""}
            required
          />
          {estado.errores?.codigo_interno ? (
            <span className="formulario__error">{estado.errores.codigo_interno}</span>
          ) : null}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Colección</span>
          <select
            className="formulario__entrada"
            name="coleccion_id"
            defaultValue={valoresIniciales.coleccion_id ?? ""}
          >
            <option value="">Sin colección</option>
            {colecciones.map((coleccion) => (
              <option key={coleccion.id} value={coleccion.id}>
                {coleccion.nombre}
                {coleccion.activa === false ? " (desactivada)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Categoría</span>
          <select
            className="formulario__entrada"
            name="categoria_id"
            defaultValue={valoresIniciales.categoria_id ?? ""}
          >
            <option value="">Sin categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
                {categoria.activa === false ? " (desactivada)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="formulario__fila">
        <label className="formulario__campo">
          <span className="formulario__etiqueta">Tipo de producto</span>
          <select
            className="formulario__entrada"
            name="tipo_producto"
            defaultValue={valoresIniciales.tipo_producto ?? "disponible"}
            required
          >
            <option value="disponible">Disponible</option>
            <option value="bajo_pedido">Bajo pedido</option>
            <option value="personalizado">Personalizado</option>
          </select>
          {estado.errores?.tipo_producto ? (
            <span className="formulario__error">{estado.errores.tipo_producto}</span>
          ) : null}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Estado de publicación</span>
          <select
            className="formulario__entrada"
            name="estado_publicacion"
            defaultValue={valoresIniciales.estado_publicacion ?? "borrador"}
            required
          >
            <option value="borrador">Borrador</option>
            <option value="activo">Activo</option>
            <option value="desactivado">Desactivado</option>
          </select>
          {estado.errores?.estado_publicacion ? (
            <span className="formulario__error">{estado.errores.estado_publicacion}</span>
          ) : null}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Precio base (USD)</span>
          <input
            className="formulario__entrada"
            type="number"
            name="precio_base"
            min="0"
            step="0.01"
            defaultValue={valoresIniciales.precio_base ?? ""}
          />
          {estado.errores?.precio_base ? (
            <span className="formulario__error">{estado.errores.precio_base}</span>
          ) : null}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Stock actual</span>
          <input
            className="formulario__entrada"
            type="number"
            name="stock_actual"
            min="0"
            step="1"
            defaultValue={valoresIniciales.stock_actual ?? "0"}
          />
          {estado.errores?.stock_actual ? (
            <span className="formulario__error">{estado.errores.stock_actual}</span>
          ) : null}
        </label>
      </div>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Descripción</span>
        <textarea
          className="formulario__entrada"
          name="descripcion"
          rows={4}
          defaultValue={valoresIniciales.descripcion ?? ""}
        />
      </label>

      <div className="formulario__fila">
        <label className="formulario__campo">
          <span className="formulario__etiqueta">Materiales</span>
          <input
            className="formulario__entrada"
            type="text"
            name="materiales"
            defaultValue={valoresIniciales.materiales ?? ""}
          />
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Medidas</span>
          <input
            className="formulario__entrada"
            type="text"
            name="medidas"
            defaultValue={valoresIniciales.medidas ?? ""}
          />
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Colores y acabados</span>
          <input
            className="formulario__entrada"
            type="text"
            name="colores_acabados"
            defaultValue={valoresIniciales.colores_acabados ?? ""}
          />
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Tiempo de elaboración</span>
          <input
            className="formulario__entrada"
            type="text"
            name="tiempo_elaboracion"
            defaultValue={valoresIniciales.tiempo_elaboracion ?? ""}
          />
        </label>
      </div>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Mensaje de WhatsApp personalizado</span>
        <textarea
          className="formulario__entrada"
          name="mensaje_whatsapp"
          rows={3}
          defaultValue={valoresIniciales.mensaje_whatsapp ?? ""}
        />
      </label>

      <div className="formulario__opciones">
        <label className="formulario__opcion">
          <input
            type="checkbox"
            name="controla_stock"
            defaultChecked={valoresIniciales.controla_stock ?? false}
          />
          Controlar stock (el producto agota existencias)
        </label>
        <label className="formulario__opcion">
          <input
            type="checkbox"
            name="destacado"
            defaultChecked={valoresIniciales.destacado ?? false}
          />
          Destacar en el inicio
        </label>
      </div>

      <div className="formulario__acciones">
        <button type="submit" className="boton boton--primario" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
