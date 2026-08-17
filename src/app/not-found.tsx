import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section>
      <h1>Página no encontrada</h1>
      <p>La página que buscas no existe o no está disponible.</p>
      <Link className="boton boton--primario" href="/">
        Volver al inicio
      </Link>
    </section>
  );
}
