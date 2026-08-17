import { createClient } from "@/lib/supabase/server";

import { normalizarNumeroTelefono } from "./whatsapp";
import { formatearPrecio } from "./precio";

export { formatearPrecio };

// Configuración pública del catálogo leída desde Supabase (tablas creadas en la
// Etapa 7). Se mantiene esta interfaz para que las páginas no dependan del origen.

const PRECIOS_VISIBLES_POR_DEFECTO = false;
const NOMBRE_NEGOCIO_POR_DEFECTO = "FutureLife";

export async function obtenerMostrarPreciosPublicos(): Promise<boolean> {
  const cliente = await createClient();
  const { data } = await cliente
    .from("configuracion_negocio")
    .select("mostrar_precios_publicos")
    .eq("id", 1)
    .maybeSingle();

  return data?.mostrar_precios_publicos ?? PRECIOS_VISIBLES_POR_DEFECTO;
}

export async function obtenerNombreNegocio(): Promise<string> {
  const cliente = await createClient();
  const { data } = await cliente
    .from("configuracion_negocio")
    .select("nombre_negocio")
    .eq("id", 1)
    .maybeSingle();

  return data?.nombre_negocio ?? NOMBRE_NEGOCIO_POR_DEFECTO;
}

export interface ConfiguracionWhatsApp {
  numero: string | null;
  mensajePredeterminado: string | null;
}

export async function obtenerConfiguracionWhatsApp(): Promise<ConfiguracionWhatsApp> {
  const cliente = await createClient();
  const { data } = await cliente
    .from("configuracion_whatsapp")
    .select("numero_whatsapp, mensaje_predeterminado")
    .eq("id", 1)
    .maybeSingle();

  return {
    numero: normalizarNumeroTelefono(data?.numero_whatsapp ?? process.env.WHATSAPP_NUMERO),
    mensajePredeterminado: data?.mensaje_predeterminado?.trim() || null,
  };
}
