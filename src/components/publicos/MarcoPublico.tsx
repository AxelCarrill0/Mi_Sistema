"use client";

import { usePathname } from "next/navigation";

import Navegacion from "@/components/publicos/Navegacion";
import PiePagina from "@/components/publicos/PiePagina";

interface Props {
  children: React.ReactNode;
  nombreNegocio: string;
}

export default function MarcoPublico({ children, nombreNegocio }: Readonly<Props>) {
  const ruta = usePathname();
  const esPanel = ruta.startsWith("/panel");

  return (
    <>
      {!esPanel ? <Navegacion nombreNegocio={nombreNegocio} /> : null}
      <main className={`contenido${esPanel ? " contenido--panel" : ""}`}>{children}</main>
      {!esPanel ? <PiePagina nombreNegocio={nombreNegocio} /> : null}
    </>
  );
}
