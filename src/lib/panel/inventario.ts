"use server";

import { revalidatePath } from "next/cache";

import { clienteAutorizado } from "./cliente";
import { esTipoMovimientoManual, normalizarCantidadMovimiento } from "./inventario-validacion";

export interface EstadoFormularioInventario {
  errores?: Record<string, string>;
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

export async function registrarMovimientoInventario(
  _estadoAnterior: EstadoFormularioInventario,
  formData: FormData,
): Promise<EstadoFormularioInventario> {
  const cliente = await clienteAutorizado();
  const {
    data: { user },
  } = await cliente.auth.getUser();
  const errores: Record<string, string> = {};

  const productoId = obtenerTexto(formData, "producto_id");
  const tipoTexto = obtenerTexto(formData, "tipo");
  const cantidadTexto = obtenerTexto(formData, "cantidad");
  const notas = obtenerTextoOpcional(formData, "notas");
  const tipoMovimiento = esTipoMovimientoManual(tipoTexto) ? tipoTexto : null;

  if (!esUuidValido(productoId)) {
    errores.producto_id = "Selecciona un producto.";
  }

  if (!tipoMovimiento) {
    errores.tipo = "Tipo de movimiento no válido.";
  }

  const cantidad = Number(cantidadTexto);
  if (
    !Number.isInteger(cantidad) ||
    cantidad === 0 ||
    (tipoMovimiento !== "ajuste" && cantidad < 0)
  ) {
    errores.cantidad =
      tipoTexto === "ajuste"
        ? "El ajuste debe ser un número entero distinto de 0."
        : "La cantidad debe ser un número entero mayor a 0.";
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  if (!tipoMovimiento) {
    return { errores: { tipo: "Tipo de movimiento no válido." } };
  }

  const cantidadMovimiento = normalizarCantidadMovimiento(tipoMovimiento, cantidad);
  if (cantidadMovimiento === null) {
    return { errores: { cantidad: "La cantidad del movimiento no es válida." } };
  }

  const { error } = await cliente.rpc("registrar_movimiento_inventario", {
    p_producto_id: productoId,
    p_tipo: tipoMovimiento,
    p_cantidad: cantidadMovimiento,
    p_origen: "manual",
    p_notas: notas ?? undefined,
    p_perfil_id: user?.id ?? undefined,
  });

  if (error) {
    return { errores: { formulario: "No se pudo registrar el movimiento. Inténtalo de nuevo." } };
  }

  revalidatePath("/panel/inventario");
  revalidatePath("/panel/productos");
  revalidatePath("/panel");
  return { exito: true };
}
