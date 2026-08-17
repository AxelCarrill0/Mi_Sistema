import type { Metadata } from "next";
import Link from "next/link";

import { listarColeccionesPublicas } from "@/lib/catalogo/consultas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Colecciones",
};

export default async function ColeccionesPage() {
  const cliente = await createClient();
  const colecciones = await listarColeccionesPublicas(cliente);

  if (colecciones.length === 0) {
    return (
      <section>
        <h1>Colecciones</h1>
        <p className="mensaje-estado">Aún no hay colecciones publicadas.</p>
      </section>
    );
  }

  return (
    <section className="colecciones-pagina">
      <header className="pagina-encabezado pagina-encabezado--centrado">
        <p className="pagina-encabezado__eyebrow">Curaduría FutureLife</p>
        <h1>Colecciones</h1>
        <p className="introduccion">
          Explora universos de piezas reunidos por estilo, material y forma de vivir.
        </p>
      </header>
      <ul className="grilla-colecciones">
        {colecciones.map((coleccion, indice) => (
          <li key={coleccion.id}>
            <Link className="tarjeta-coleccion" href={`/colecciones/${coleccion.slug}`}>
              <div
                className={`tarjeta-coleccion__arte tarjeta-coleccion__arte--${(indice % 3) + 1}`}
                aria-hidden="true"
              >
                <span>{String(indice + 1).padStart(2, "0")}</span>
              </div>
              <div className="tarjeta-coleccion__contenido">
                <p className="tarjeta-coleccion__eyebrow">Colección</p>
                <h2 className="tarjeta-coleccion__nombre">{coleccion.nombre}</h2>
                {coleccion.descripcion ? (
                  <p className="tarjeta-coleccion__descripcion">{coleccion.descripcion}</p>
                ) : null}
                <span className="tarjeta-coleccion__enlace">Explorar colección</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
