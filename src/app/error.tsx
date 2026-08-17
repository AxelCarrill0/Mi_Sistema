"use client";

export default function ErrorGlobal({ reset }: { reset: () => void }) {
  return (
    <section>
      <h1>Algo salió mal</h1>
      <p>Ocurrió un error inesperado. Intenta nuevamente en unos momentos.</p>
      <button className="boton boton--primario" type="button" onClick={() => reset()}>
        Reintentar
      </button>
    </section>
  );
}
