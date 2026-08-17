"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clienteAutorizado } from "./cliente";

export interface EstadoFormulario {
  valores?: unknown;
  errores?: Record<string, string>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function obtenerTexto(formData: FormData, nombre: string): string {
  return String(formData.get(nombre) ?? "").trim();
}

function obtenerTextoOpcional(formData: FormData, nombre: string): string | null {
  const texto = obtenerTexto(formData, nombre);
  return texto || null;
}

function valoresCliente(formData: FormData): Record<string, string> {
  return {
    nombres: obtenerTexto(formData, "nombres"),
    identificacion: obtenerTexto(formData, "identificacion"),
    telefono: obtenerTexto(formData, "telefono"),
    email: obtenerTexto(formData, "email"),
    direccion: obtenerTexto(formData, "direccion"),
    notas: obtenerTexto(formData, "notas"),
  };
}

export async function crearCliente(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const cliente = await clienteAutorizado();

  const nombres = obtenerTexto(formData, "nombres");
  const email = obtenerTexto(formData, "email");
  const identificacion = obtenerTexto(formData, "identificacion");
  const errores: Record<string, string> = {};

  if (!nombres) {
    errores.nombres = "Los nombres son obligatorios.";
  } else if (nombres.length > 200) {
    errores.nombres = "Los nombres no pueden superar 200 caracteres.";
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errores.email = "Ingresa un correo válido.";
  }

  if (identificacion && identificacion.length > 20) {
    errores.identificacion = "La identificación no puede superar 20 caracteres.";
  }

  if (Object.keys(errores).length > 0) {
    return { valores: valoresCliente(formData), errores };
  }

  const { error } = await cliente.from("clientes").insert({
    nombres,
    identificacion: obtenerTextoOpcional(formData, "identificacion"),
    telefono: obtenerTextoOpcional(formData, "telefono"),
    email: email || null,
    direccion: obtenerTextoOpcional(formData, "direccion"),
    notas: obtenerTextoOpcional(formData, "notas"),
  });

  if (error) {
    return {
      valores: valoresCliente(formData),
      errores: { formulario: "No se pudo guardar el cliente. Inténtalo de nuevo." },
    };
  }

  revalidatePath("/panel/clientes");
  redirect("/panel/clientes");
}

export async function actualizarCliente(
  id: string,
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const cliente = await clienteAutorizado();

  const nombres = obtenerTexto(formData, "nombres");
  const email = obtenerTexto(formData, "email");
  const identificacion = obtenerTexto(formData, "identificacion");
  const errores: Record<string, string> = {};

  if (!nombres) {
    errores.nombres = "Los nombres son obligatorios.";
  } else if (nombres.length > 200) {
    errores.nombres = "Los nombres no pueden superar 200 caracteres.";
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errores.email = "Ingresa un correo válido.";
  }

  if (identificacion && identificacion.length > 20) {
    errores.identificacion = "La identificación no puede superar 20 caracteres.";
  }

  if (Object.keys(errores).length > 0) {
    return { valores: valoresCliente(formData), errores };
  }

  const { error } = await cliente
    .from("clientes")
    .update({
      nombres,
      identificacion: obtenerTextoOpcional(formData, "identificacion"),
      telefono: obtenerTextoOpcional(formData, "telefono"),
      email: email || null,
      direccion: obtenerTextoOpcional(formData, "direccion"),
      notas: obtenerTextoOpcional(formData, "notas"),
    })
    .eq("id", id);

  if (error) {
    return {
      valores: valoresCliente(formData),
      errores: { formulario: "No se pudo guardar el cliente. Inténtalo de nuevo." },
    };
  }

  revalidatePath("/panel/clientes");
  redirect("/panel/clientes");
}
