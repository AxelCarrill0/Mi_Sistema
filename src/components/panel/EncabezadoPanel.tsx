"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BotonCerrarSesion from "@/components/panel/BotonCerrarSesion";
import type { RolPanel } from "@/lib/panel/tipos";

interface Props {
  email: string;
  rol: RolPanel;
}

const ETIQUETA_ROL: Record<RolPanel, string> = {
  administrador: "Administrador",
  operador: "Operador",
};

const gruposNavegacion = [
  {
    etiqueta: "Catálogo",
    enlaces: [
      { href: "/panel", etiqueta: "Resumen" },
      { href: "/panel/colecciones", etiqueta: "Colecciones" },
      { href: "/panel/categorias", etiqueta: "Categorías" },
      { href: "/panel/productos", etiqueta: "Productos" },
    ],
  },
  {
    etiqueta: "Comercial",
    enlaces: [
      { href: "/panel/clientes", etiqueta: "Clientes" },
      { href: "/panel/cotizaciones", etiqueta: "Cotizaciones" },
    ],
  },
  {
    etiqueta: "Sistema",
    enlaces: [{ href: "/panel/configuracion", etiqueta: "Configuración" }],
  },
];

export default function EncabezadoPanel({ email, rol }: Props) {
  const ruta = usePathname();

  return (
    <header className="panel-encabezado">
      <div className="panel-encabezado__contenedor">
        <div className="panel-encabezado__superior">
          <Link href="/panel" className="panel-encabezado__marca">
            <span className="panel-encabezado__marca-punto" aria-hidden="true" />
            <span>
              Panel <strong>FutureLife</strong>
            </span>
          </Link>
          <div className="panel-encabezado__cuenta">
            <span className="panel-encabezado__usuario">
              <strong>{ETIQUETA_ROL[rol]}</strong>
              <span>{email}</span>
            </span>
            <BotonCerrarSesion />
          </div>
        </div>
        <nav className="panel-encabezado__navegacion" aria-label="Navegación del panel">
          {gruposNavegacion.map((grupo) => (
            <div className="panel-encabezado__grupo" key={grupo.etiqueta}>
              <span className="panel-encabezado__grupo-etiqueta">{grupo.etiqueta}</span>
              <ul className="panel-encabezado__lista">
                {grupo.enlaces.map((enlace) => {
                  const activo =
                    enlace.href === "/panel" ? ruta === "/panel" : ruta.startsWith(enlace.href);

                  return (
                    <li key={enlace.href}>
                      <Link
                        href={enlace.href}
                        className={activo ? "panel-encabezado__enlace--activo" : undefined}
                        aria-current={activo ? "page" : undefined}
                      >
                        {enlace.etiqueta}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
