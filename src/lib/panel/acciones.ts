"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { Database } from "@/lib/supabase/database.types";

import { clienteAutorizado } from "./cliente";

export interface EstadoFormulario {
  valores?: unknown;
  errores?: Record<string, string>;
}

type ClientePanel = SupabaseClient<Database>;
type TablaConSlug = "colecciones" | "categorias" | "productos";

const TIPOS_PRODUCTO = ["disponible", "bajo_pedido", "personalizado"] as const;
const ESTADOS_PRODUCTO = ["borrador", "activo", "desactivado"] as const;
const ESTADOS_COLECCION = ["activo", "desactivado"] as const;

function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function obtenerTexto(formData: FormData, nombre: string): string {
  return String(formData.get(nombre) ?? "").trim();
}

function obtenerTextoOpcional(formData: FormData, nombre: string): string | null {
  const texto = obtenerTexto(formData, nombre);
  return texto || null;
}

function obtenerBooleano(formData: FormData, nombre: string): boolean {
  return formData.get(nombre) === "on";
}

function obtenerIdOpcional(formData: FormData, nombre: string): string | null {
  const id = obtenerTexto(formData, nombre);
  return id || null;
}

function valoresProducto(formData: FormData): Record<string, string> {
  const campos = [
    "nombre",
    "codigo_interno",
    "descripcion",
    "coleccion_id",
    "categoria_id",
    "tipo_producto",
    "precio_base",
    "stock_actual",
    "materiales",
    "medidas",
    "colores_acabados",
    "tiempo_elaboracion",
    "estado_publicacion",
    "mensaje_whatsapp",
  ];

  const valores: Record<string, string> = {};
  for (const campo of campos) {
    valores[campo] = String(formData.get(campo) ?? "");
  }
  valores.controla_stock = obtenerBooleano(formData, "controla_stock") ? "on" : "";
  valores.destacado = obtenerBooleano(formData, "destacado") ? "on" : "";
  return valores;
}

async function existeSlug(
  cliente: ClientePanel,
  tabla: TablaConSlug,
  slug: string,
  idExcluido?: string,
): Promise<boolean> {
  let consulta = cliente.from(tabla).select("id").eq("slug", slug);
  if (idExcluido) {
    consulta = consulta.neq("id", idExcluido);
  }
  const { data } = await consulta.maybeSingle();
  return Boolean(data);
}

async function slugUnico(
  cliente: ClientePanel,
  tabla: TablaConSlug,
  baseInicial: string,
  idExcluido?: string,
): Promise<string> {
  const base = baseInicial || "sin-nombre";
  if (!(await existeSlug(cliente, tabla, base, idExcluido))) {
    return base;
  }
  let sufijo = 2;
  while (await existeSlug(cliente, tabla, `${base}-${sufijo}`, idExcluido)) {
    sufijo += 1;
  }
  return `${base}-${sufijo}`;
}

export async function crearColeccion(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const cliente = await clienteAutorizado();

  const nombre = obtenerTexto(formData, "nombre");
  const descripcion = obtenerTextoOpcional(formData, "descripcion");
  const errores: Record<string, string> = {};

  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (nombre.length > 200) {
    errores.nombre = "El nombre no puede superar 200 caracteres.";
  }

  if (Object.keys(errores).length > 0) {
    return { valores: { nombre, descripcion: descripcion ?? "" }, errores };
  }

  const slug = await slugUnico(cliente, "colecciones", generarSlug(nombre));

  const { error } = await cliente.from("colecciones").insert({
    nombre,
    slug,
    descripcion,
    estado_publicacion: "activo",
  });

  if (error) {
    return {
      valores: { nombre, descripcion: descripcion ?? "" },
      errores: { formulario: "No se pudo guardar la colección. Inténtalo de nuevo." },
    };
  }

  revalidatePath("/", "layout");
  redirect("/panel/colecciones");
}

export async function actualizarColeccion(
  id: string,
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const cliente = await clienteAutorizado();

  const nombre = obtenerTexto(formData, "nombre");
  const descripcion = obtenerTextoOpcional(formData, "descripcion");
  const errores: Record<string, string> = {};

  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (nombre.length > 200) {
    errores.nombre = "El nombre no puede superar 200 caracteres.";
  }

  if (Object.keys(errores).length > 0) {
    return { valores: { nombre, descripcion: descripcion ?? "" }, errores };
  }

  const slug = await slugUnico(cliente, "colecciones", generarSlug(nombre), id);

  const { error } = await cliente
    .from("colecciones")
    .update({ nombre, slug, descripcion })
    .eq("id", id);

  if (error) {
    return {
      valores: { nombre, descripcion: descripcion ?? "" },
      errores: { formulario: "No se pudo guardar la colección. Inténtalo de nuevo." },
    };
  }

  revalidatePath("/", "layout");
  redirect("/panel/colecciones");
}

export async function cambiarEstadoColeccion(formData: FormData): Promise<void> {
  const cliente = await clienteAutorizado();

  const id = obtenerTexto(formData, "id");
  const estado = obtenerTexto(formData, "estado");

  if (!ESTADOS_COLECCION.includes(estado as (typeof ESTADOS_COLECCION)[number])) {
    return;
  }

  await cliente.from("colecciones").update({ estado_publicacion: estado }).eq("id", id);
  revalidatePath("/", "layout");
}

export async function crearCategoria(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const cliente = await clienteAutorizado();

  const nombre = obtenerTexto(formData, "nombre");
  const descripcion = obtenerTextoOpcional(formData, "descripcion");
  const errores: Record<string, string> = {};

  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (nombre.length > 200) {
    errores.nombre = "El nombre no puede superar 200 caracteres.";
  }

  if (Object.keys(errores).length > 0) {
    return { valores: { nombre, descripcion: descripcion ?? "" }, errores };
  }

  const slug = await slugUnico(cliente, "categorias", generarSlug(nombre));

  const { error } = await cliente.from("categorias").insert({
    nombre,
    slug,
    descripcion,
    activo: true,
  });

  if (error) {
    return {
      valores: { nombre, descripcion: descripcion ?? "" },
      errores: { formulario: "No se pudo guardar la categoría. Inténtalo de nuevo." },
    };
  }

  revalidatePath("/", "layout");
  redirect("/panel/categorias");
}

export async function actualizarCategoria(
  id: string,
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const cliente = await clienteAutorizado();

  const nombre = obtenerTexto(formData, "nombre");
  const descripcion = obtenerTextoOpcional(formData, "descripcion");
  const errores: Record<string, string> = {};

  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (nombre.length > 200) {
    errores.nombre = "El nombre no puede superar 200 caracteres.";
  }

  if (Object.keys(errores).length > 0) {
    return { valores: { nombre, descripcion: descripcion ?? "" }, errores };
  }

  const slug = await slugUnico(cliente, "categorias", generarSlug(nombre), id);

  const { error } = await cliente
    .from("categorias")
    .update({ nombre, slug, descripcion })
    .eq("id", id);

  if (error) {
    return {
      valores: { nombre, descripcion: descripcion ?? "" },
      errores: { formulario: "No se pudo guardar la categoría. Inténtalo de nuevo." },
    };
  }

  revalidatePath("/", "layout");
  redirect("/panel/categorias");
}

export async function cambiarEstadoCategoria(formData: FormData): Promise<void> {
  const cliente = await clienteAutorizado();

  const id = obtenerTexto(formData, "id");
  const activo = formData.get("activo") === "true";

  await cliente.from("categorias").update({ activo }).eq("id", id);
  revalidatePath("/", "layout");
}

export async function crearProducto(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const cliente = await clienteAutorizado();

  const nombre = obtenerTexto(formData, "nombre");
  const codigoInterno = obtenerTexto(formData, "codigo_interno");
  const tipoProducto = obtenerTexto(formData, "tipo_producto");
  const estadoPublicacion = obtenerTexto(formData, "estado_publicacion");
  const errores: Record<string, string> = {};

  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (nombre.length > 200) {
    errores.nombre = "El nombre no puede superar 200 caracteres.";
  }

  if (!codigoInterno) {
    errores.codigo_interno = "El código interno es obligatorio.";
  } else if (codigoInterno.length > 30) {
    errores.codigo_interno = "El código interno no puede superar 30 caracteres.";
  }

  if (!TIPOS_PRODUCTO.includes(tipoProducto as (typeof TIPOS_PRODUCTO)[number])) {
    errores.tipo_producto = "Selecciona un tipo de producto válido.";
  }

  if (!ESTADOS_PRODUCTO.includes(estadoPublicacion as (typeof ESTADOS_PRODUCTO)[number])) {
    errores.estado_publicacion = "Selecciona un estado de publicación válido.";
  }

  const precioTexto = obtenerTexto(formData, "precio_base");
  let precioBase: number | null = null;
  if (precioTexto) {
    const precio = Number(precioTexto);
    if (!Number.isFinite(precio) || precio < 0) {
      errores.precio_base = "El precio debe ser un número mayor o igual a 0.";
    } else {
      precioBase = Math.round(precio * 100) / 100;
    }
  }

  const controlaStock = obtenerBooleano(formData, "controla_stock");
  const stock = Number(obtenerTexto(formData, "stock_actual") || "0");
  if (!Number.isInteger(stock) || stock < 0) {
    errores.stock_actual = "El stock debe ser un número entero mayor o igual a 0.";
  }

  const { data: existeCodigo } = await cliente
    .from("productos")
    .select("id")
    .eq("codigo_interno", codigoInterno)
    .maybeSingle();

  if (existeCodigo) {
    errores.codigo_interno = "Ya existe un producto con ese código interno.";
  }

  if (Object.keys(errores).length > 0) {
    return { valores: valoresProducto(formData), errores };
  }

  const slug = await slugUnico(cliente, "productos", generarSlug(nombre));

  const { data: productoCreado, error } = await cliente
    .from("productos")
    .insert({
      nombre,
      slug,
      codigo_interno: codigoInterno,
      descripcion: obtenerTextoOpcional(formData, "descripcion"),
      coleccion_id: obtenerIdOpcional(formData, "coleccion_id"),
      categoria_id: obtenerIdOpcional(formData, "categoria_id"),
      tipo_producto: tipoProducto,
      precio_base: precioBase,
      controla_stock: controlaStock,
      stock_actual: controlaStock ? stock : 0,
      materiales: obtenerTextoOpcional(formData, "materiales"),
      medidas: obtenerTextoOpcional(formData, "medidas"),
      colores_acabados: obtenerTextoOpcional(formData, "colores_acabados"),
      tiempo_elaboracion: obtenerTextoOpcional(formData, "tiempo_elaboracion"),
      estado_publicacion: estadoPublicacion,
      destacado: obtenerBooleano(formData, "destacado"),
      mensaje_whatsapp: obtenerTextoOpcional(formData, "mensaje_whatsapp"),
    })
    .select("id")
    .maybeSingle();

  if (error || !productoCreado) {
    return {
      valores: valoresProducto(formData),
      errores: { formulario: "No se pudo guardar el producto. Revisa el código interno." },
    };
  }

  revalidatePath("/", "layout");
  redirect("/panel/productos");
}

export async function actualizarProducto(
  id: string,
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const cliente = await clienteAutorizado();

  const nombre = obtenerTexto(formData, "nombre");
  const codigoInterno = obtenerTexto(formData, "codigo_interno");
  const tipoProducto = obtenerTexto(formData, "tipo_producto");
  const estadoPublicacion = obtenerTexto(formData, "estado_publicacion");
  const errores: Record<string, string> = {};

  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (nombre.length > 200) {
    errores.nombre = "El nombre no puede superar 200 caracteres.";
  }

  if (!codigoInterno) {
    errores.codigo_interno = "El código interno es obligatorio.";
  } else if (codigoInterno.length > 30) {
    errores.codigo_interno = "El código interno no puede superar 30 caracteres.";
  }

  if (!TIPOS_PRODUCTO.includes(tipoProducto as (typeof TIPOS_PRODUCTO)[number])) {
    errores.tipo_producto = "Selecciona un tipo de producto válido.";
  }

  if (!ESTADOS_PRODUCTO.includes(estadoPublicacion as (typeof ESTADOS_PRODUCTO)[number])) {
    errores.estado_publicacion = "Selecciona un estado de publicación válido.";
  }

  const precioTexto = obtenerTexto(formData, "precio_base");
  let precioBase: number | null = null;
  if (precioTexto) {
    const precio = Number(precioTexto);
    if (!Number.isFinite(precio) || precio < 0) {
      errores.precio_base = "El precio debe ser un número mayor o igual a 0.";
    } else {
      precioBase = Math.round(precio * 100) / 100;
    }
  }

  const controlaStock = obtenerBooleano(formData, "controla_stock");
  const stock = Number(obtenerTexto(formData, "stock_actual") || "0");
  if (!Number.isInteger(stock) || stock < 0) {
    errores.stock_actual = "El stock debe ser un número entero mayor o igual a 0.";
  }

  const { data: existeCodigo } = await cliente
    .from("productos")
    .select("id")
    .eq("codigo_interno", codigoInterno)
    .neq("id", id)
    .maybeSingle();

  if (existeCodigo) {
    errores.codigo_interno = "Ya existe un producto con ese código interno.";
  }

  if (Object.keys(errores).length > 0) {
    return { valores: valoresProducto(formData), errores };
  }

  const slug = await slugUnico(cliente, "productos", generarSlug(nombre), id);

  const { data: productoActualizado, error } = await cliente
    .from("productos")
    .update({
      nombre,
      slug,
      codigo_interno: codigoInterno,
      descripcion: obtenerTextoOpcional(formData, "descripcion"),
      coleccion_id: obtenerIdOpcional(formData, "coleccion_id"),
      categoria_id: obtenerIdOpcional(formData, "categoria_id"),
      tipo_producto: tipoProducto,
      precio_base: precioBase,
      controla_stock: controlaStock,
      stock_actual: controlaStock ? stock : 0,
      materiales: obtenerTextoOpcional(formData, "materiales"),
      medidas: obtenerTextoOpcional(formData, "medidas"),
      colores_acabados: obtenerTextoOpcional(formData, "colores_acabados"),
      tiempo_elaboracion: obtenerTextoOpcional(formData, "tiempo_elaboracion"),
      estado_publicacion: estadoPublicacion,
      destacado: obtenerBooleano(formData, "destacado"),
      mensaje_whatsapp: obtenerTextoOpcional(formData, "mensaje_whatsapp"),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !productoActualizado) {
    return {
      valores: valoresProducto(formData),
      errores: { formulario: "No se pudo guardar el producto. Inténtalo de nuevo." },
    };
  }

  revalidatePath("/", "layout");
  redirect("/panel/productos");
}

export async function cambiarEstadoProducto(formData: FormData): Promise<void> {
  const cliente = await clienteAutorizado();

  const id = obtenerTexto(formData, "id");
  const estado = obtenerTexto(formData, "estado");

  if (!ESTADOS_PRODUCTO.includes(estado as (typeof ESTADOS_PRODUCTO)[number])) {
    return;
  }

  await cliente.from("productos").update({ estado_publicacion: estado }).eq("id", id);
  revalidatePath("/", "layout");
}
