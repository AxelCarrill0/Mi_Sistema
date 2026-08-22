import type { Metadata } from "next";
import { redirect } from "next/navigation";

import EncabezadoPanel from "@/components/panel/EncabezadoPanel";
import { obtenerUsuarioAutorizado } from "@/lib/panel/autorizacion";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cliente = await createClient();
  const usuario = await obtenerUsuarioAutorizado(cliente);

  if (!usuario) {
    redirect("/panel/ingreso");
  }

  return (
    <div className="panel">
      <EncabezadoPanel email={usuario.email} rol={usuario.rol} />
      {children}
    </div>
  );
}
