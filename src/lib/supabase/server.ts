import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function createClient() {
  const cookieStore = await cookies();
  const { url, clavePublicable } = obtenerVariablesSupabase();

  return createServerClient<Database>(url, clavePublicable, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies; the auth proxy will handle refreshes.
        }
      },
    },
  });
}
