"use client";

interface Props {
  nombreArchivo?: string;
}

export default function BotonImprimir({ nombreArchivo }: Props) {
  function abrirImpresion(conNombreArchivo: boolean) {
    const tituloOriginal = document.title;
    const restaurarTitulo = () => {
      document.title = tituloOriginal;
      window.removeEventListener("afterprint", restaurarTitulo);
    };

    if (conNombreArchivo && nombreArchivo) {
      document.title = nombreArchivo;
      window.addEventListener("afterprint", restaurarTitulo, { once: true });
    }

    window.print();
  }

  return (
    <>
      <button type="button" className="boton boton--primario" onClick={() => abrirImpresion(false)}>
        Imprimir
      </button>
      <button
        type="button"
        className="boton boton--secundario"
        onClick={() => abrirImpresion(true)}
      >
        Guardar PDF
      </button>
    </>
  );
}
