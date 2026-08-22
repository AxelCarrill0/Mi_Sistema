"use client";

export default function ErrorPanel({ reset }: { reset: () => void }) {
  return (
    <section>
      <h1>Error en el panel</h1>
      <p className="mensaje-estado">
        Ocurrió un error al cargar esta sección del panel. Intenta nuevamente en unos momentos.
      </p>
      <button className="boton boton--primario" type="button" onClick={() => reset()}>
        Reintentar
      </button>
    </section>
  );
}
