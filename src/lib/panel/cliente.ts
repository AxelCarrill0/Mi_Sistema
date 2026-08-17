import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

type ClientePanel = SupabaseClient<Database>;

export async function clienteAutorizado(): Promise<ClientePanel> {
  const cliente = await createClient();
  const {
    data: { user },
  } = await cliente.auth.getUser();

  if (!user) {
    redirect("/panel/ingreso");
  }

  const { data: perfil } = await cliente
    .from("perfiles")
    .select("rol, activo")
    .eq("id", user.id)
    .maybeSingle();

  const permitido =
    perfil && perfil.activo && (perfil.rol === "administrador" || perfil.rol === "operador");

  if (!permitido) {
    redirect("/panel/ingreso");
  }

  return cliente;
}
