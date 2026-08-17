"use client";

import { useActionState, useState } from "react";

import { formatearPrecio } from "@/lib/catalogo/precio";
import type { EstadoFormulario } from "@/lib/panel/cotizaciones";

export interface ClienteParaCotizacion {
  id: string;
  nombres: string;
  identificacion: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
}

export interface ProductoParaCotizacion {
  id: string;
  nombre: string;
  codigo_interno: string;
  precio_base: number | null;
}

interface Linea {
  clave: number;
  producto_id: string;
  descripcion: string;
  cantidad: string;
  precio: string;
}

interface Props {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  clientes: ClienteParaCotizacion[];
  productos: ProductoParaCotizacion[];
}

let siguienteClave = 0;

function nuevaLinea(): Linea {
  siguienteClave += 1;
  return { clave: siguienteClave, producto_id: "", descripcion: "", cantidad: "1", precio: "" };
}

export default function FormularioCotizacion({ accion, clientes, productos }: Props) {
  const [estado, formAction, pendiente] = useActionState(accion, {});
  const [lineas, setLineas] = useState<Linea[]>([nuevaLinea()]);
  const [clienteId, setClienteId] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [direccionCliente, setDireccionCliente] = useState("");

  const clienteSeleccionado = Boolean(clienteId);

  function seleccionarCliente(id: string) {
    setClienteId(id);
    const cliente = clientes.find((c) => c.id === id);
    if (cliente) {
      setNombreCliente(cliente.nombres);
      setTelefonoCliente(cliente.telefono ?? "");
      setEmailCliente(cliente.email ?? "");
      setDireccionCliente(cliente.direccion ?? "");
    }
  }

  function cambiarProducto(clave: number, productoId: string) {
    setLineas((actuales) =>
      actuales.map((linea) => {
        if (linea.clave !== clave) {
          return linea;
        }
        const producto = productos.find((p) => p.id === productoId);
        return {
          ...linea,
          producto_id: productoId,
          descripcion: producto
            ? `${producto.nombre} (${producto.codigo_interno})`
            : linea.descripcion,
          precio:
            producto && producto.precio_base !== null ? String(producto.precio_base) : linea.precio,
        };
      }),
    );
  }

  function actualizarLinea(clave: number, cambios: Partial<Linea>) {
    setLineas((actuales) =>
      actuales.map((linea) => (linea.clave === clave ? { ...linea, ...cambios } : linea)),
    );
  }

  function quitarLinea(clave: number) {
    setLineas((actuales) => actuales.filter((linea) => linea.clave !== clave));
  }

  const total = lineas.reduce(
    (suma, linea) => suma + (Number(linea.cantidad) || 0) * (Number(linea.precio) || 0),
    0,
  );

  return (
    <form action={formAction} className="formulario">
      {estado.errores?.formulario ? (
        <p role="alert" className="formulario__error">
          {estado.errores.formulario}
        </p>
      ) : null}

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Cliente</span>
        <select
          className="formulario__entrada"
          name="cliente_id"
          value={clienteId}
          onChange={(evento) => seleccionarCliente(evento.target.value)}
        >
          <option value="">Cliente nuevo (sin registrar)</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombres}
            </option>
          ))}
        </select>
      </label>

      {clienteSeleccionado ? (
        <p className="formulario__ayuda">
          Los datos del cliente se toman del registro seleccionado.
        </p>
      ) : null}

      <div className="formulario__fila">
        <label className="formulario__campo">
          <span className="formulario__etiqueta">Nombre del cliente</span>
          <input
            className="formulario__entrada"
            type="text"
            name="nombre_cliente"
            value={nombreCliente}
            onChange={(evento) => setNombreCliente(evento.target.value)}
            readOnly={clienteSeleccionado}
            required
          />
          {estado.errores?.nombre_cliente ? (
            <span className="formulario__error">{estado.errores.nombre_cliente}</span>
          ) : null}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Teléfono</span>
          <input
            className="formulario__entrada"
            type="text"
            name="telefono_cliente"
            value={telefonoCliente}
            onChange={(evento) => setTelefonoCliente(evento.target.value)}
            readOnly={clienteSeleccionado}
          />
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Correo</span>
          <input
            className="formulario__entrada"
            type="email"
            name="email_cliente"
            value={emailCliente}
            onChange={(evento) => setEmailCliente(evento.target.value)}
            readOnly={clienteSeleccionado}
          />
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Dirección</span>
          <input
            className="formulario__entrada"
            type="text"
            name="direccion_cliente"
            value={direccionCliente}
            onChange={(evento) => setDireccionCliente(evento.target.value)}
            readOnly={clienteSeleccionado}
          />
        </label>
      </div>

      <div className="cotizacion-lineas">
        <div className="cotizacion-lineas__encabezado">
          <span>Producto</span>
          <span>Descripción</span>
          <span>Cant.</span>
          <span>Precio unitario</span>
          <span>Subtotal</span>
          <span />
        </div>

        {lineas.map((linea) => (
          <div className="cotizacion-lineas__fila" key={linea.clave}>
            <select
              className="formulario__entrada"
              name="producto_id"
              value={linea.producto_id}
              onChange={(evento) => cambiarProducto(linea.clave, evento.target.value)}
            >
              <option value="">— Libre —</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                </option>
              ))}
            </select>

            <input
              className="formulario__entrada"
              type="text"
              name="descripcion"
              value={linea.descripcion}
              onChange={(evento) =>
                actualizarLinea(linea.clave, { descripcion: evento.target.value })
              }
              required
            />

            <input
              className="formulario__entrada"
              type="number"
              name="cantidad"
              min="1"
              step="1"
              value={linea.cantidad}
              onChange={(evento) => actualizarLinea(linea.clave, { cantidad: evento.target.value })}
              required
            />

            <input
              className="formulario__entrada"
              type="number"
              name="precio_unitario"
              min="0"
              step="0.01"
              value={linea.precio}
              onChange={(evento) => actualizarLinea(linea.clave, { precio: evento.target.value })}
            />

            <span className="cotizacion-lineas__subtotal">
              {formatearPrecio((Number(linea.cantidad) || 0) * (Number(linea.precio) || 0))}
            </span>

            <button
              type="button"
              className="boton boton--peligro"
              onClick={() => quitarLinea(linea.clave)}
            >
              Quitar
            </button>
          </div>
        ))}

        <div className="cotizacion-lineas__pie">
          <button
            type="button"
            className="boton boton--secundario"
            onClick={() => setLineas((actuales) => [...actuales, nuevaLinea()])}
          >
            Agregar línea
          </button>
          <span className="cotizacion-lineas__total">Total: {formatearPrecio(total)}</span>
        </div>

        {estado.errores?.lineas ? (
          <p role="alert" className="formulario__error">
            {estado.errores.lineas}
          </p>
        ) : null}
      </div>

      <div className="formulario__fila">
        <label className="formulario__campo">
          <span className="formulario__etiqueta">Vigencia (días)</span>
          <input
            className="formulario__entrada"
            type="number"
            name="vigencia_dias"
            min="1"
            step="1"
            defaultValue="15"
          />
          {estado.errores?.vigencia_dias ? (
            <span className="formulario__error">{estado.errores.vigencia_dias}</span>
          ) : null}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Observaciones</span>
          <textarea className="formulario__entrada" name="observaciones" rows={3} />
        </label>
      </div>

      <div className="formulario__acciones">
        <button type="submit" className="boton boton--primario" disabled={pendiente}>
          {pendiente ? "Creando…" : "Crear cotización"}
        </button>
      </div>
    </form>
  );
}
