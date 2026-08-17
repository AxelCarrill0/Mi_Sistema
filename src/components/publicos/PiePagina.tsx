import Link from "next/link";

const enlaces = [
  { href: "/catalogo", etiqueta: "Catálogo" },
  { href: "/colecciones", etiqueta: "Colecciones" },
];

export default function PiePagina() {
  return (
    <footer className="pie">
      <div className="pie__contenedor">
        <div className="pie__marca">FutureLife</div>
        <p className="pie__texto">
          Artículos de madera y decoración hechos a mano, con calidez y calidad artesanal.
        </p>
        <nav aria-label="Enlaces del pie de página">
          <ul className="pie__lista">
            {enlaces.map((enlace) => (
              <li key={enlace.href}>
                <Link href={enlace.href}>{enlace.etiqueta}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="pie__nota">
          © {new Date().getFullYear()} FutureLife. Artículos de madera y decoración.
        </p>
      </div>
    </footer>
  );
}
