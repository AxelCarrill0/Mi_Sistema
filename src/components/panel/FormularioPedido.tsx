"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { formatearMonedaUSD } from "@/lib/panel/formato";
import { crearPedido } from "@/lib/panel/pedidos";

export interface ClienteParaPedido {
  id: string;
  nombres: string;
  identificacion: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
}

export interface ProductoParaPedido {
  id: string;
  nombre: string;
  codigo_interno: string;
  precio_base: number | null;
}

export interface CotizacionOrigen {
  id: string;
  numero: number;
  cliente_id: string | null;
  nombre_cliente: string;
  telefono_cliente: string | null;
  email_cliente: string | null;
  direccion_cliente: string | null;
  observaciones: string | null;
  detalles: {
    producto_id: string | null;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
  }[];
}

interface Linea {
  clave: number;
  producto_id: string;
  descripcion: string;
  cantidad: string;
  precio: string;
}

interface Props {
  clientes: ClienteParaPedido[];
  productos: ProductoParaPedido[];
  cotizacionOrigen?: CotizacionOrigen | null;
}

let siguienteClave = 0;

function nuevaLinea(producto_id = "", descripcion = "", cantidad = "1", precio = ""): Linea {
  siguienteClave += 1;
  return { clave: siguienteClave, producto_id, descripcion, cantidad, precio };
}

export default function FormularioPedido({ clientes, productos, cotizacionOrigen }: Props) {
  const [estado, formAction, pendiente] = useActionState(crearPedido, {});

  const [clienteId, setClienteId] = useState(cotizacionOrigen?.cliente_id ?? "");
  const [nombreCliente, setNombreCliente] = useState(cotizacionOrigen?.nombre_cliente ?? "");
  const [telefonoCliente, setTelefonoCliente] = useState(cotizacionOrigen?.telefono_cliente ?? "");
  const [emailCliente, setEmailCliente] = useState(cotizacionOrigen?.email_cliente ?? "");
  const [direccionCliente, setDireccionCliente] = useState(
    cotizacionOrigen?.direccion_cliente ?? "",
  );
  const [observaciones, setObservaciones] = useState(cotizacionOrigen?.observaciones ?? "");
  const [abonoInicial, setAbonoInicial] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [referenciaAbono, setReferenciaAbono] = useState("");

  const lineasIniciales = cotizacionOrigen?.detalles.length
    ? cotizacionOrigen.detalles.map((d) =>
        nuevaLinea(
          d.producto_id ?? "",
          d.descripcion,
          String(d.cantidad),
          String(d.precio_unitario),
        ),
      )
    : [nuevaLinea()];

  const [lineas, setLineas] = useState<Linea[]>(lineasIniciales);
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
        if (linea.clave !== clave) return linea;
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
  const abonoNum = Number(abonoInicial) || 0;
  const saldoEstimado = Math.max(0, total - abonoNum);

  return (
    <form action={formAction} className="formulario">
      {cotizacionOrigen && (
        <p className="formulario__ayuda" style={{ marginBottom: "1rem" }}>
          📋 Creando pedido a partir de la cotización{" "}
          <strong>COT-{String(cotizacionOrigen.numero).padStart(4, "0")}</strong>.
        </p>
      )}
      {cotizacionOrigen && <input type="hidden" name="cotizacion_id" value={cotizacionOrigen.id} />}

      {estado.errores?.formulario && (
        <p role="alert" className="formulario__error">
          {estado.errores.formulario}
        </p>
      )}

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Cliente registrado</span>
        <select
          id="cliente-registrado"
          name="cliente_id"
          value={clienteId}
          onChange={(e) => seleccionarCliente(e.target.value)}
          className="formulario__entrada"
        >
          <option value="">Cliente nuevo (ingresar manualmente)</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombres} {c.identificacion ? `(${c.identificacion})` : ""}
            </option>
          ))}
        </select>
        {estado.errores?.cliente_id && (
          <span className="formulario__error">{estado.errores.cliente_id}</span>
        )}
      </label>

      {clienteSeleccionado && (
        <p className="formulario__ayuda">
          Los datos del cliente se toman del registro seleccionado.
        </p>
      )}

      <div className="formulario__fila">
        <label className="formulario__campo">
          <span className="formulario__etiqueta">Nombre del cliente *</span>
          <input
            className="formulario__entrada"
            type="text"
            name="nombre_cliente"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            readOnly={clienteSeleccionado}
            required
          />
          {estado.errores?.nombre_cliente && (
            <span className="formulario__error">{estado.errores.nombre_cliente}</span>
          )}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Teléfono</span>
          <input
            className="formulario__entrada"
            type="tel"
            name="telefono_cliente"
            value={telefonoCliente}
            onChange={(e) => setTelefonoCliente(e.target.value)}
            readOnly={clienteSeleccionado}
          />
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Correo electrónico</span>
          <input
            className="formulario__entrada"
            type="email"
            name="email_cliente"
            value={emailCliente}
            onChange={(e) => setEmailCliente(e.target.value)}
            readOnly={clienteSeleccionado}
          />
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Dirección de entrega</span>
          <input
            className="formulario__entrada"
            type="text"
            name="direccion_cliente"
            value={direccionCliente}
            onChange={(e) => setDireccionCliente(e.target.value)}
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
              onChange={(e) => cambiarProducto(linea.clave, e.target.value)}
            >
              <option value="">— Libre / Personalizado —</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.codigo_interno})
                </option>
              ))}
            </select>

            <input
              className="formulario__entrada"
              type="text"
              name="descripcion"
              value={linea.descripcion}
              onChange={(e) => actualizarLinea(linea.clave, { descripcion: e.target.value })}
              placeholder="Descripción del artículo"
              required
            />

            <input
              className="formulario__entrada"
              type="number"
              name="cantidad"
              value={linea.cantidad}
              min="1"
              step="1"
              onChange={(e) => actualizarLinea(linea.clave, { cantidad: e.target.value })}
              required
            />

            <input
              className="formulario__entrada"
              type="number"
              name="precio_unitario"
              value={linea.precio}
              min="0"
              step="0.01"
              onChange={(e) => actualizarLinea(linea.clave, { precio: e.target.value })}
              required
            />

            <span>
              {formatearMonedaUSD((Number(linea.cantidad) || 0) * (Number(linea.precio) || 0))}
            </span>

            {lineas.length > 1 ? (
              <button
                type="button"
                className="boton boton--secundario boton--pequeno"
                onClick={() => quitarLinea(linea.clave)}
                title="Quitar artículo"
              >
                ✕
              </button>
            ) : (
              <span />
            )}
          </div>
        ))}

        <div className="cotizacion-lineas__pie">
          <button
            type="button"
            className="boton boton--secundario"
            onClick={() => setLineas((actuales) => [...actuales, nuevaLinea()])}
          >
            + Agregar artículo
          </button>
          <p className="cotizacion-lineas__total">
            Total: <strong>{formatearMonedaUSD(total)}</strong>
          </p>
        </div>
      </div>

      {estado.errores?.lineas && (
        <p role="alert" className="formulario__error">
          {estado.errores.lineas}
        </p>
      )}

      <div className="formulario__fila">
        <label className="formulario__campo">
          <span className="formulario__etiqueta">Abono inicial ($)</span>
          <input
            className="formulario__entrada"
            type="number"
            name="abono_inicial"
            value={abonoInicial}
            min="0"
            step="0.01"
            max={total > 0 ? total : undefined}
            onChange={(e) => setAbonoInicial(e.target.value)}
            placeholder="0.00"
          />
          {estado.errores?.abono_inicial && (
            <span className="formulario__error">{estado.errores.abono_inicial}</span>
          )}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Método de pago</span>
          <select
            className="formulario__entrada"
            name="metodo_pago"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia Bancaria</option>
            <option value="deposito">Depósito</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="otro">Otro</option>
          </select>
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Referencia del pago</span>
          <input
            className="formulario__entrada"
            type="text"
            name="referencia_abono"
            value={referenciaAbono}
            onChange={(e) => setReferenciaAbono(e.target.value)}
            placeholder="Ej: Transferencia #12345"
          />
        </label>
      </div>

      {abonoNum > 0 && (
        <p className="formulario__ayuda">
          Saldo pendiente estimado: <strong>{formatearMonedaUSD(saldoEstimado)}</strong>
        </p>
      )}

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Observaciones</span>
        <textarea
          className="formulario__entrada"
          name="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
        />
      </label>

      <div className="formulario__acciones">
        <button type="submit" disabled={pendiente} className="boton boton--primario">
          {pendiente ? "Creando pedido..." : "Crear pedido"}
        </button>
        <Link href="/panel/pedidos" className="boton boton--secundario">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
