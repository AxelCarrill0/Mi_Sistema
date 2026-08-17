import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { RolPanel, UsuarioAutorizado } from "./tipos";

type ClientePanel = SupabaseClient<Database>;

const ROLES_PERMITIDOS: readonly RolPanel[] = ["administrador", "operador"];

export async function obtenerUsuarioAutorizado(
  cliente: ClientePanel,
): Promise<UsuarioAutorizado | null> {
  const {
    data: { user },
  } = await cliente.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: perfil } = await cliente
    .from("perfiles")
    .select("rol, activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil || !perfil.activo || !ROLES_PERMITIDOS.includes(perfil.rol as RolPanel)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
    rol: perfil.rol as RolPanel,
  };
}
