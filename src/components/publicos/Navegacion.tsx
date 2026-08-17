"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/catalogo", etiqueta: "Catálogo" },
  { href: "/colecciones", etiqueta: "Colecciones" },
];

export default function Navegacion() {
  const ruta = usePathname();

  return (
    <header className="navegacion">
      <div className="navegacion__contenedor">
        <Link href="/" className="navegacion__marca">
          <span className="navegacion__marca-texto">FutureLife</span>
        </Link>
        <nav aria-label="Navegación principal">
          <ul className="navegacion__lista">
            {enlaces.map((enlace) => {
              const activo = enlace.href === "/" ? ruta === "/" : ruta.startsWith(enlace.href);
              return (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className={`navegacion__enlace${activo ? " navegacion__enlace--activo" : ""}`}
                    aria-current={activo ? "page" : undefined}
                  >
                    {enlace.etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
