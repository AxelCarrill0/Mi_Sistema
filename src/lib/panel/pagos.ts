"use server";

import { revalidatePath } from "next/cache";

import { clienteAutorizado } from "./cliente";

export interface EstadoFormularioPago {
  errores?: Record<string, string>;
  exito?: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function esUuidValido(valor: string): boolean {
  return UUID_REGEX.test(valor);
}

function obtenerTexto(formData: FormData, nombre: string): string {
  return String(formData.get(nombre) ?? "").trim();
}

function obtenerTextoOpcional(formData: FormData, nombre: string): string | null {
  const texto = obtenerTexto(formData, nombre);
  return texto || null;
}

const METODOS_VALIDOS = ["efectivo", "transferencia", "deposito", "tarjeta", "otro"] as const;
type MetodoPago = (typeof METODOS_VALIDOS)[number];

function esMetodoPago(valor: string): valor is MetodoPago {
  return METODOS_VALIDOS.includes(valor as MetodoPago);
}

export async function registrarAbono(
  _estadoAnterior: EstadoFormularioPago,
  formData: FormData,
): Promise<EstadoFormularioPago> {
  const cliente = await clienteAutorizado();
  const {
    data: { user },
  } = await cliente.auth.getUser();
  const errores: Record<string, string> = {};

  const pedidoId = obtenerTextoOpcional(formData, "pedido_id");
  const ventaId = obtenerTextoOpcional(formData, "venta_id");
  const montoTexto = obtenerTexto(formData, "monto");
  const metodoPagoTexto = obtenerTexto(formData, "metodo_pago");
  const referencia = obtenerTextoOpcional(formData, "referencia");
  const notas = obtenerTextoOpcional(formData, "notas");

  const monto = Number(montoTexto);
  if (isNaN(monto) || monto <= 0) {
    errores.monto = "El monto debe ser mayor a cero.";
  }

  if (!esMetodoPago(metodoPagoTexto)) {
    errores.metodo_pago = "Método de pago no válido.";
  }

  const pedidoIdValido = pedidoId && esUuidValido(pedidoId) ? pedidoId : null;
  const ventaIdValido = ventaId && esUuidValido(ventaId) ? ventaId : null;

  if (!pedidoIdValido && !ventaIdValido) {
    errores.formulario = "Se requiere un pedido o venta al que asociar el abono.";
  }

  if (pedidoIdValido && ventaIdValido) {
    errores.formulario = "El abono debe asociarse a un pedido o a una venta, no a ambos.";
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  const { error } = await cliente.from("pagos").insert({
    pedido_id: pedidoIdValido,
    venta_id: ventaIdValido,
    monto,
    metodo_pago: metodoPagoTexto as MetodoPago,
    referencia,
    notas,
    perfil_id: user?.id ?? null,
  });

  if (error) {
    return { errores: { formulario: "No se pudo registrar el abono. Inténtalo de nuevo." } };
  }

  if (pedidoIdValido) {
    revalidatePath(`/panel/pedidos/${pedidoIdValido}`);
  }
  if (ventaIdValido) {
    revalidatePath(`/panel/ventas/${ventaIdValido}`);
  }

  return { exito: true };
}

export async function eliminarAbono(formData: FormData): Promise<void> {
  const cliente = await clienteAutorizado();

  const id = String(formData.get("id") ?? "").trim();
  const pedidoId = obtenerTextoOpcional(formData, "pedido_id");
  const ventaId = obtenerTextoOpcional(formData, "venta_id");

  if (!esUuidValido(id)) return;

  await cliente.from("pagos").delete().eq("id", id);

  const pedidoIdValido = pedidoId && esUuidValido(pedidoId) ? pedidoId : null;
  const ventaIdValido = ventaId && esUuidValido(ventaId) ? ventaId : null;

  if (pedidoIdValido) {
    revalidatePath(`/panel/pedidos/${pedidoIdValido}`);
  }
  if (ventaIdValido) {
    revalidatePath(`/panel/ventas/${ventaIdValido}`);
  }
}
