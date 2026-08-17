"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clienteAutorizado } from "./cliente";

export interface EstadoFormulario {
  valores?: unknown;
  errores?: Record<string, string>;
}

const ESTADOS_COTIZACION = ["borrador", "enviada", "aceptada", "rechazada"] as const;

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

export async function crearCotizacion(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const cliente = await clienteAutorizado();

  const nombreCliente = obtenerTexto(formData, "nombre_cliente");
  const clienteId = obtenerTexto(formData, "cliente_id");
  const vigenciaTexto = obtenerTexto(formData, "vigencia_dias");
  const vigenciaDias = Number(vigenciaTexto || "15");
  const errores: Record<string, string> = {};

  let datosCliente: {
    nombre_cliente: string;
    telefono_cliente: string | null;
    email_cliente: string | null;
    direccion_cliente: string | null;
  } = {
    nombre_cliente: nombreCliente,
    telefono_cliente: obtenerTextoOpcional(formData, "telefono_cliente"),
    email_cliente: obtenerTextoOpcional(formData, "email_cliente"),
    direccion_cliente: obtenerTextoOpcional(formData, "direccion_cliente"),
  };

  if (clienteId) {
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

  if (!Number.isInteger(vigenciaDias) || vigenciaDias < 1) {
    errores.vigencia_dias = "La vigencia debe ser un número entero mayor o igual a 1.";
  }

  const lineas = leerLineas(formData);
  const numeroLineas = lineas.descripciones.length;

  if (numeroLineas === 0) {
    errores.lineas = "Agrega al menos una línea a la cotización.";
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

  if (Object.keys(errores).length > 0) {
    return {
      valores: {
        nombre_cliente: datosCliente.nombre_cliente,
        telefono_cliente: datosCliente.telefono_cliente ?? "",
        email_cliente: datosCliente.email_cliente ?? "",
        direccion_cliente: datosCliente.direccion_cliente ?? "",
        cliente_id: clienteId,
        vigencia_dias: vigenciaTexto,
      },
      errores,
    };
  }

  const { data: cotizacion, error: errorCotizacion } = await cliente
    .from("cotizaciones")
    .insert({
      cliente_id: esUuidValido(clienteId) ? clienteId : null,
      nombre_cliente: datosCliente.nombre_cliente,
      telefono_cliente: datosCliente.telefono_cliente,
      email_cliente: datosCliente.email_cliente,
      direccion_cliente: datosCliente.direccion_cliente,
      estado: "borrador",
      vigencia_dias: vigenciaDias,
      observaciones: obtenerTextoOpcional(formData, "observaciones"),
    })
    .select("id")
    .single();

  if (errorCotizacion) {
    return { errores: { formulario: "No se pudo crear la cotización. Inténtalo de nuevo." } };
  }

  const detalle = lineas.descripciones.map((descripcion, indice) => ({
    cotizacion_id: cotizacion.id,
    producto_id: lineas.productos[indice],
    descripcion,
    cantidad: lineas.cantidades[indice],
    precio_unitario: Math.round(lineas.precios[indice] * 100) / 100,
  }));

  const { error: errorDetalle } = await cliente.from("cotizaciones_detalle").insert(detalle);

  if (errorDetalle) {
    return { errores: { formulario: "No se pudieron guardar las líneas de la cotización." } };
  }

  revalidatePath("/panel/cotizaciones");
  redirect(`/panel/cotizaciones/${cotizacion.id}`);
}

export async function cambiarEstadoCotizacion(formData: FormData): Promise<void> {
  const cliente = await clienteAutorizado();

  const id = obtenerTexto(formData, "id");
  const estado = obtenerTexto(formData, "estado");

  if (!ESTADOS_COTIZACION.includes(estado as (typeof ESTADOS_COTIZACION)[number])) {
    return;
  }

  await cliente.from("cotizaciones").update({ estado }).eq("id", id);
  revalidatePath(`/panel/cotizaciones/${id}`);
  redirect(`/panel/cotizaciones/${id}`);
}
