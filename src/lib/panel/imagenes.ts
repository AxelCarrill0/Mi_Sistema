"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { clienteAutorizado } from "./cliente";

const BUCKET = "catalogo";
const TAMANO_MAXIMO = 5 * 1024 * 1024;
const MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
const EXTENSIONES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function subirImagenProducto(
  productoId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const cliente = await clienteAutorizado();

  const archivo = formData.get("imagen");

  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Selecciona una imagen." };
  }

  if (!MIME_PERMITIDOS.includes(archivo.type as (typeof MIME_PERMITIDOS)[number])) {
    return { error: "Formato no permitido. Usa JPG, PNG, WEBP o AVIF." };
  }

  if (archivo.size > TAMANO_MAXIMO) {
    return { error: "La imagen supera el límite de 5 MB." };
  }

  const extension = EXTENSIONES[archivo.type];
  const ruta = `${productoId}/${randomUUID()}.${extension}`;

  const { error: errorSubida } = await cliente.storage.from(BUCKET).upload(ruta, archivo, {
    contentType: archivo.type,
    upsert: false,
  });

  if (errorSubida) {
    return { error: "No se pudo subir la imagen al almacenamiento." };
  }

  const { count } = await cliente
    .from("imagenes_producto")
    .select("*", { count: "exact", head: true })
    .eq("producto_id", productoId);

  const { error: errorRegistro } = await cliente.from("imagenes_producto").insert({
    producto_id: productoId,
    ruta_storage: ruta,
    es_principal: (count ?? 0) === 0,
    orden: count ?? 0,
  });

  if (errorRegistro) {
    await cliente.storage.from(BUCKET).remove([ruta]);
    return { error: "No se pudo registrar la imagen." };
  }

  revalidatePath(`/panel/productos/${productoId}/editar`);
  revalidatePath("/productos", "layout");
  return {};
}

export async function cambiarImagenPrincipal(id: string): Promise<void> {
  const cliente = await clienteAutorizado();

  const { data: imagen } = await cliente
    .from("imagenes_producto")
    .select("producto_id")
    .eq("id", id)
    .maybeSingle();

  if (!imagen) {
    return;
  }

  const { error: errorQuitar } = await cliente
    .from("imagenes_producto")
    .update({ es_principal: false })
    .eq("producto_id", imagen.producto_id);

  if (errorQuitar) {
    throw errorQuitar;
  }

  const { error: errorPoner } = await cliente
    .from("imagenes_producto")
    .update({ es_principal: true })
    .eq("id", id);

  if (errorPoner) {
    throw errorPoner;
  }

  revalidatePath(`/panel/productos/${imagen.producto_id}/editar`);
  revalidatePath("/productos", "layout");
}

export async function eliminarImagenProducto(id: string): Promise<void> {
  const cliente = await clienteAutorizado();

  const { data: imagen } = await cliente
    .from("imagenes_producto")
    .select("producto_id, ruta_storage, es_principal")
    .eq("id", id)
    .maybeSingle();

  if (!imagen) {
    return;
  }

  const { error: errorEliminar } = await cliente.from("imagenes_producto").delete().eq("id", id);

  if (errorEliminar) {
    throw errorEliminar;
  }

  await cliente.storage.from(BUCKET).remove([imagen.ruta_storage]);

  if (imagen.es_principal) {
    const { data: restantes } = await cliente
      .from("imagenes_producto")
      .select("id")
      .eq("producto_id", imagen.producto_id)
      .order("orden", { ascending: true })
      .limit(1);

    if (restantes && restantes[0]) {
      await cliente
        .from("imagenes_producto")
        .update({ es_principal: true })
        .eq("id", restantes[0].id);
    }
  }

  revalidatePath(`/panel/productos/${imagen.producto_id}/editar`);
  revalidatePath("/productos", "layout");
}
