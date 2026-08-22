import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";

function obtenerVariablesSupabase(): { url: string; clavePublicable: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clavePublicable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !clavePublicable) {
    throw new Error(
      "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Revisa .env.local o la configuración del despliegue.",
    );
  }

  return { url, clavePublicable };
}

export function createClient() {
  const { url, clavePublicable } = obtenerVariablesSupabase();
  return createBrowserClient<Database>(url, clavePublicable);
}
