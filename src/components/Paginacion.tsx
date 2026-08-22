import Link from "next/link";

import { obtenerTotalPaginas } from "@/lib/paginacion";

interface Props {
  pagina: number;
  total: number;
  porPagina: number;
  construirHref: (pagina: number) => string;
}

export default function Paginacion({ pagina, total, porPagina, construirHref }: Props) {
  const totalPaginas = obtenerTotalPaginas(total, porPagina);

  if (totalPaginas <= 1) {
    return null;
  }

  return (
    <nav className="panel-filtros" aria-label="Paginación de resultados">
      {pagina > 1 ? (
        <Link className="boton boton--secundario boton--pequeno" href={construirHref(pagina - 1)}>
          Anterior
        </Link>
      ) : null}
      <span className="texto-secundario">
        Página {pagina} de {totalPaginas} · {total} en total
      </span>
      {pagina < totalPaginas ? (
        <Link className="boton boton--secundario boton--pequeno" href={construirHref(pagina + 1)}>
          Siguiente
        </Link>
      ) : null}
    </nav>
  );
}
