"use client";

import { usePathname } from "next/navigation";

import Navegacion from "@/components/publicos/Navegacion";
import PiePagina from "@/components/publicos/PiePagina";

export default function MarcoPublico({ children }: Readonly<{ children: React.ReactNode }>) {
  const ruta = usePathname();
  const esPanel = ruta.startsWith("/panel");

  return (
    <>
      {!esPanel ? <Navegacion /> : null}
      <main className={`contenido${esPanel ? " contenido--panel" : ""}`}>{children}</main>
      {!esPanel ? <PiePagina /> : null}
    </>
  );
}
