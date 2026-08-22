import type { Metadata } from "next";
import Link from "next/link";

import FormularioIngreso from "@/components/panel/FormularioIngreso";

export const metadata: Metadata = {
  title: "Ingreso",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaginaIngreso() {
  return (
    <section className="ingreso">
      <h1>Ingreso al panel</h1>
      <p className="ingreso__aviso">Acceso restringido al personal autorizado.</p>
      <FormularioIngreso />
      <p className="ingreso__aviso">
        <Link href="/">Volver al sitio público</Link>
      </p>
    </section>
  );
}
