"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clienteAutorizado } from "./cliente";

export interface EstadoFormularioPedido {
  valores?: unknown;
  errores?: Record<string, string>;
}

const ESTADOS_PEDIDO = ["pendiente", "entregado", "cancelado"] as const;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function obtenerTexto(formData: FormData, nombre: string): string {
  return String(formData.get(nombre) ?? "").trim();
}

function obtenerTextoOpcional(formData: FormData, nombre: string): string | null {
  const texto = obtenerTexto(formData, nombre);
  return texto || null;
}

function esUuidValido(valor: string): boolean {
  return UUID_REGEX.test(valor);
}

function leerLineas(formData: FormData): {
  descripciones: string[];
  cantidades: number[];
  precios: number[];
  productos: (string | null)[];
} {
  const descripciones = formData.getAll("descripcion").map((valor) => String(valor).trim());
  const cantidades = formData.getAll("cantidad").map((valor) => Number(valor));
  const precios = formData.getAll("precio_unitario").map((valor) => Number(valor));
  const productos = formData.getAll("producto_id").map((valor) => {
    const texto = String(valor).trim();
    return esUuidValido(texto) ? texto : null;
  });

  return { descripciones, cantidades, precios, productos };
}

export async function crearPedido(
  _estadoAnterior: EstadoFormularioPedido,
  formData: FormData,
): Promise<EstadoFormularioPedido> {
  const cliente = await clienteAutorizado();
  const {
    data: { user },
  } = await cliente.auth.getUser();

  const nombreCliente = obtenerTexto(formData, "nombre_cliente");
  const clienteId = obtenerTexto(formData, "cliente_id");
  const cotizacionId = obtenerTexto(formData, "cotizacion_id");
  const abonoInicialTexto = obtenerTexto(formData, "abono_inicial");
  const metodoPago = obtenerTexto(formData, "metodo_pago") || "efectivo";
  const referenciaAbono = obtenerTextoOpcional(formData, "referencia_abono");
  const observaciones = obtenerTextoOpcional(formData, "observaciones");
  const errores: Record<string, string> = {};

  let datosCliente = {
    nombre_cliente: nombreCliente,
    telefono_cliente: obtenerTextoOpcional(formData, "telefono_cliente"),
    email_cliente: obtenerTextoOpcional(formData, "email_cliente"),
    direccion_cliente: obtenerTextoOpcional(formData, "direccion_cliente"),
  };

  if (clienteId && esUuidValido(clienteId)) {
    const { data: clienteRegistrado } = await cliente
      .from("clientes")
      .select("nombres, telefono, email, direccion")
      .eq("id", clienteId)
      .maybeSingle();

    if (clienteRegistrado) {
      datosCliente = {
        nombre_cliente: clienteRegistrado.nombres,
        telefono_cliente: clienteRegistrado.telefono,
        email_cliente: clienteRegistrado.email,
        direccion_cliente: clienteRegistrado.direccion,
      };
    } else {
      errores.cliente_id = "El cliente seleccionado no existe.";
    }
  }

  if (!datosCliente.nombre_cliente) {
    errores.nombre_cliente = "El nombre del cliente es obligatorio.";
  } else if (datosCliente.nombre_cliente.length > 200) {
    errores.nombre_cliente = "El nombre no puede superar 200 caracteres.";
  }

  const lineas = leerLineas(formData);
  const numeroLineas = lineas.descripciones.length;

  if (numeroLineas === 0) {
    errores.lineas = "Agrega al menos una línea al pedido.";
  }

  for (let indice = 0; indice < numeroLineas; indice += 1) {
    if (!lineas.descripciones[indice]) {
      errores.lineas = "Cada línea debe tener una descripción.";
      break;
    }
    if (!Number.isInteger(lineas.cantidades[indice]) || lineas.cantidades[indice] < 1) {
      errores.lineas = "Las cantidades deben ser números enteros mayores a 0.";
      break;
    }
    if (!Number.isFinite(lineas.precios[indice]) || lineas.precios[indice] < 0) {
      errores.lineas = "Los precios deben ser números mayores o iguales a 0.";
      break;
    }
  }

  const abonoInicial = Number(abonoInicialTexto || "0");
  if (abonoInicialTexto && (!Number.isFinite(abonoInicial) || abonoInicial < 0)) {
    errores.abono_inicial = "El abono inicial debe ser un número mayor o igual a 0.";
  }

  if (Object.keys(errores).length > 0) {
    return {
      valores: {
        nombre_cliente: datosCliente.nombre_cliente,
        telefono_cliente: datosCliente.telefono_cliente ?? "",
        email_cliente: datosCliente.email_cliente ?? "",
        direccion_cliente: datosCliente.direccion_cliente ?? "",
        cliente_id: clienteId,
        cotizacion_id: cotizacionId,
        observaciones: observaciones ?? "",
        abono_inicial: abonoInicialTexto,
      },
      errores,
    };
  }

  const { data: pedido, error: errorPedido } = await cliente
    .from("pedidos")
    .insert({
      cliente_id: esUuidValido(clienteId) ? clienteId : null,
      cotizacion_id: esUuidValido(cotizacionId) ? cotizacionId : null,
      nombre_cliente: datosCliente.nombre_cliente,
      telefono_cliente: datosCliente.telefono_cliente,
      email_cliente: datosCliente.email_cliente,
      direccion_cliente: datosCliente.direccion_cliente,
      estado: "pendiente",
      observaciones,
    })
    .select("id")
    .single();

  if (errorPedido) {
    return { errores: { formulario: `No se pudo crear el pedido: ${errorPedido.message}` } };
  }

  // Insertar historial inicial
  await cliente.from("historial_estados_pedido").insert({
    pedido_id: pedido.id,
    estado_anterior: null,
    estado_nuevo: "pendiente",
    perfil_id: user?.id ?? null,
    motivo: cotizacionId ? "Creado a partir de cotización" : "Pedido creado",
  });

  const detalle = lineas.descripciones.map((descripcion, indice) => ({
    pedido_id: pedido.id,
    producto_id: lineas.productos[indice],
    descripcion,
    cantidad: lineas.cantidades[indice],
    precio_unitario: Math.round(lineas.precios[indice] * 100) / 100,
  }));

  const { error: errorDetalle } = await cliente.from("detalles_pedido").insert(detalle);

  if (errorDetalle) {
    return { errores: { formulario: "No se pudieron guardar las líneas del pedido." } };
  }

  // Si se ingresó un abono inicial
  if (abonoInicial > 0) {
    await cliente.from("pagos").insert({
      pedido_id: pedido.id,
      monto: Math.round(abonoInicial * 100) / 100,
      metodo_pago: metodoPago as "efectivo" | "transferencia" | "deposito" | "tarjeta" | "otro",
      referencia: referenciaAbono,
      notas: "Abono inicial registrado con el pedido",
      perfil_id: user?.id ?? null,
    });
  }

  revalidatePath("/panel/pedidos");
  revalidatePath("/panel");
  redirect(`/panel/pedidos/${pedido.id}`);
}

export interface EstadoCambioPedido {
  error?: string;
  exito?: boolean;
}

export async function cambiarEstadoPedido(
  _estadoAnterior: EstadoCambioPedido,
  formData: FormData,
): Promise<EstadoCambioPedido> {
  const cliente = await clienteAutorizado();
  const {
    data: { user },
  } = await cliente.auth.getUser();

  const id = obtenerTexto(formData, "id");
  const nuevoEstado = obtenerTexto(formData, "estado");
  const motivo = obtenerTextoOpcional(formData, "motivo") ?? undefined;

  if (!id || !esUuidValido(id)) {
    return { error: "Identificador de pedido inválido." };
  }

  if (!ESTADOS_PEDIDO.includes(nuevoEstado as (typeof ESTADOS_PEDIDO)[number])) {
    return { error: "Estado no válido." };
  }

  const { data: pedidoActual } = await cliente
    .from("pedidos")
    .select("estado")
    .eq("id", id)
    .single();

  if (!pedidoActual) {
    return { error: "El pedido no existe." };
  }

  if (pedidoActual.estado === nuevoEstado) {
    return { exito: true };
  }

  if (nuevoEstado === "entregado") {
    // Conversión atómica a venta con descuento de stock
    const { data: ventaId, error: errorConversion } = await cliente.rpc(
      "convertir_pedido_en_venta",
      {
        p_pedido_id: id,
        p_perfil_id: user?.id ?? undefined,
        p_motivo: motivo ?? "Pedido marcado como entregado",
      },
    );

    if (errorConversion) {
      return { error: errorConversion.message };
    }

    revalidatePath(`/panel/pedidos/${id}`);
    revalidatePath("/panel/pedidos");
    revalidatePath("/panel/ventas");
    revalidatePath("/panel");
    if (ventaId) {
      redirect(`/panel/ventas/${ventaId}`);
    }
    return { exito: true };
  } else {
    // Cambio a cancelado u otro
    const { error: errorUpdate } = await cliente
      .from("pedidos")
      .update({ estado: nuevoEstado as (typeof ESTADOS_PEDIDO)[number] })
      .eq("id", id);

    if (errorUpdate) {
      return { error: errorUpdate.message };
    }

    await cliente.from("historial_estados_pedido").insert({
      pedido_id: id,
      estado_anterior: pedidoActual.estado,
      estado_nuevo: nuevoEstado,
      perfil_id: user?.id ?? null,
      motivo: motivo ?? `Estado cambiado a ${nuevoEstado}`,
    });

    revalidatePath(`/panel/pedidos/${id}`);
    revalidatePath("/panel/pedidos");
    revalidatePath("/panel");
    return { exito: true };
  }
}
