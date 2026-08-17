export default function LoadingPanel() {
  return (
    <div className="cargando-pagina cargando-pagina--panel" role="status" aria-live="polite">
      <span className="cargando-pagina__indicador" aria-hidden="true" />
      <span>Cargando panel…</span>
    </div>
  );
}
