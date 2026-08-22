"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clienteAutorizado } from "./cliente";

export interface EstadoFormularioProduccion {
  errores?: Record<string, string>;
}

export interface EstadoAccionProduccion {
  error?: string;
  exito?: boolean;
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

export async function crearProduccion(
  _estadoAnterior: EstadoFormularioProduccion,
  formData: FormData,
): Promise<EstadoFormularioProduccion> {
  const cliente = await clienteAutorizado();
  const {
    data: { user },
  } = await cliente.auth.getUser();
  const errores: Record<string, string> = {};

  const productoId = obtenerTexto(formData, "producto_id");
  const cantidadTexto = obtenerTexto(formData, "cantidad");
  const observaciones = obtenerTextoOpcional(formData, "observaciones");

  if (!esUuidValido(productoId)) {
    errores.producto_id = "Selecciona un producto.";
  }

  const cantidad = Number(cantidadTexto);
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    errores.cantidad = "La cantidad debe ser un número entero mayor a 0.";
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  const { data: produccion, error: errorProduccion } = await cliente
    .from("producciones")
    .insert({
      producto_id: productoId,
      cantidad,
      estado: "activa",
      observaciones,
      perfil_id: user?.id ?? null,
    })
    .select("id")
    .single();

  if (errorProduccion) {
    return { errores: { formulario: "No se pudo crear la producción. Inténtalo de nuevo." } };
  }

  await cliente.from("historial_estados_produccion").insert({
    produccion_id: produccion.id,
    estado_anterior: null,
    estado_nuevo: "activa",
    perfil_id: user?.id ?? null,
    motivo: "Orden de producción creada",
  });

  revalidatePath("/panel/inventario");
  revalidatePath("/panel");
  redirect(`/panel/inventario/produccion/${produccion.id}`);
}

export async function completarProduccion(
  _estadoAnterior: EstadoAccionProduccion,
  formData: FormData,
): Promise<EstadoAccionProduccion> {
  const cliente = await clienteAutorizado();
  const {
    data: { user },
  } = await cliente.auth.getUser();

  const id = obtenerTexto(formData, "id");
  const motivo = obtenerTextoOpcional(formData, "motivo") ?? undefined;

  if (!esUuidValido(id)) {
    return { error: "Identificador de producción inválido." };
  }

  const { error } = await cliente.rpc("completar_produccion", {
    p_produccion_id: id,
    p_perfil_id: user?.id ?? undefined,
    p_motivo: motivo ?? "Producción completada",
  });

  if (error) {
    return { error: "No se pudo completar la producción. Inténtalo de nuevo." };
  }

  revalidatePath(`/panel/inventario/produccion/${id}`);
  revalidatePath("/panel/inventario");
  revalidatePath("/panel/productos");
  revalidatePath("/panel");
  return { exito: true };
}

export async function cancelarProduccion(
  _estadoAnterior: EstadoAccionProduccion,
  formData: FormData,
): Promise<EstadoAccionProduccion> {
  const cliente = await clienteAutorizado();
  const {
    data: { user },
  } = await cliente.auth.getUser();

  const id = obtenerTexto(formData, "id");
  const motivo = obtenerTextoOpcional(formData, "motivo") ?? undefined;

  if (!esUuidValido(id)) {
    return { error: "Identificador de producción inválido." };
  }

  const { error } = await cliente.rpc("cancelar_produccion", {
    p_produccion_id: id,
    p_perfil_id: user?.id ?? undefined,
    p_motivo: motivo ?? "Orden cancelada",
  });

  if (error) {
    return { error: "No se pudo cancelar la producción. Inténtalo de nuevo." };
  }

  revalidatePath(`/panel/inventario/produccion/${id}`);
  revalidatePath("/panel/inventario");
  revalidatePath("/panel");
  return { exito: true };
}
