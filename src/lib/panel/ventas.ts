"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clienteAutorizado } from "./cliente";

export interface EstadoFormularioVenta {
  valores?: unknown;
  errores?: Record<string, string>;
}

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

export async function crearVentaDirecta(
  _estadoAnterior: EstadoFormularioVenta,
  formData: FormData,
): Promise<EstadoFormularioVenta> {
  const cliente = await clienteAutorizado();
  const {
    data: { user },
  } = await cliente.auth.getUser();

  const nombreCliente = obtenerTexto(formData, "nombre_cliente");
  const clienteId = obtenerTexto(formData, "cliente_id");
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
    errores.lineas = "Agrega al menos una línea a la venta.";
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
    errores.abono_inicial = "El pago registrado debe ser un número mayor o igual a 0.";
  }

  if (Object.keys(errores).length > 0) {
    return {
      valores: {
        nombre_cliente: datosCliente.nombre_cliente,
        telefono_cliente: datosCliente.telefono_cliente ?? "",
        email_cliente: datosCliente.email_cliente ?? "",
        direccion_cliente: datosCliente.direccion_cliente ?? "",
        cliente_id: clienteId,
        observaciones: observaciones ?? "",
        abono_inicial: abonoInicialTexto,
      },
      errores,
    };
  }

  const jsonLineas = lineas.descripciones.map((descripcion, indice) => ({
    producto_id: lineas.productos[indice],
    descripcion,
    cantidad: lineas.cantidades[indice],
    precio_unitario: Math.round(lineas.precios[indice] * 100) / 100,
  }));

  const { data: ventaId, error: errorRpc } = await cliente.rpc("registrar_venta_directa", {
    p_cliente_id: (esUuidValido(clienteId) ? clienteId : undefined) as unknown as string,
    p_nombre_cliente: datosCliente.nombre_cliente,
    p_telefono_cliente: datosCliente.telefono_cliente ?? "",
    p_email_cliente: datosCliente.email_cliente ?? "",
    p_direccion_cliente: datosCliente.direccion_cliente ?? "",
    p_observaciones: observaciones ?? "",
    p_lineas: jsonLineas,
    p_abono_monto: abonoInicial > 0 ? abonoInicial : undefined,
    p_abono_metodo: metodoPago,
    p_abono_referencia: referenciaAbono ?? undefined,
    p_perfil_id: user?.id ?? undefined,
  });

  if (errorRpc) {
    return { errores: { formulario: "No se pudo registrar la venta. Inténtalo de nuevo." } };
  }

  revalidatePath("/panel/ventas");
  revalidatePath("/panel/productos");
  revalidatePath("/panel");
  redirect(`/panel/ventas/${ventaId}`);
}
