"use server";

import { revalidatePath } from "next/cache";

import { normalizarNumeroTelefono } from "@/lib/catalogo/whatsapp";

import { clienteAutorizado } from "./cliente";

export interface EstadoFormulario {
  errores?: Record<string, string>;
}

export async function guardarConfiguracion(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const cliente = await clienteAutorizado();

  const nombreNegocio = String(formData.get("nombre_negocio") ?? "").trim();
  const mostrarPreciosPublicos = formData.get("mostrar_precios_publicos") === "on";
  const numeroTexto = String(formData.get("numero_whatsapp") ?? "").trim();
  const mensajePredeterminado = String(formData.get("mensaje_predeterminado") ?? "").trim();
  const errores: Record<string, string> = {};

  if (!nombreNegocio) {
    errores.nombre_negocio = "El nombre del negocio es obligatorio.";
  } else if (nombreNegocio.length > 100) {
    errores.nombre_negocio = "El nombre no puede superar 100 caracteres.";
  }

  const numero = normalizarNumeroTelefono(numeroTexto);
  if (numeroTexto && !numero) {
    errores.numero_whatsapp = "El número debe contener solo dígitos.";
  } else if (numero && numero.length > 15) {
    errores.numero_whatsapp = "El número no puede superar 15 dígitos.";
  }

  if (mensajePredeterminado.length > 500) {
    errores.mensaje_predeterminado = "El mensaje no puede superar 500 caracteres.";
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  const { error: errorNegocio } = await cliente
    .from("configuracion_negocio")
    .update({
      nombre_negocio: nombreNegocio,
      mostrar_precios_publicos: mostrarPreciosPublicos,
    })
    .eq("id", 1);

  if (errorNegocio) {
    return { errores: { formulario: "No se pudo guardar la configuración del negocio." } };
  }

  const { error: errorWhatsapp } = await cliente
    .from("configuracion_whatsapp")
    .update({
      numero_whatsapp: numero,
      mensaje_predeterminado: mensajePredeterminado || null,
    })
    .eq("id", 1);

  if (errorWhatsapp) {
    return { errores: { formulario: "No se pudo guardar la configuración de WhatsApp." } };
  }

  revalidatePath("/", "layout");
  return {};
}
