export default function Loading() {
  return (
    <div className="cargando-pagina" role="status" aria-live="polite">
      <span className="cargando-pagina__indicador" aria-hidden="true" />
      <span>Cargando contenido…</span>
    </div>
  );
}
