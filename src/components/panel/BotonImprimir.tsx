"use client";

export default function BotonImprimir() {
  return (
    <button type="button" className="boton boton--primario" onClick={() => window.print()}>
      Imprimir
    </button>
  );
}
