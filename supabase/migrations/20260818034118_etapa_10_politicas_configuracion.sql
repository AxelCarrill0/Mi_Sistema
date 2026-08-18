-- Etapa 10: evita políticas SELECT permisivas duplicadas para authenticated.
-- La política administrativa ya cubre lectura autenticada; la pública solo
-- necesita atender solicitudes anónimas del catálogo.

drop policy if exists configuracion_negocio_lectura_publica
  on public.configuracion_negocio;

create policy configuracion_negocio_lectura_publica
on public.configuracion_negocio
for select
to anon
using (true);

drop policy if exists configuracion_whatsapp_lectura_publica
  on public.configuracion_whatsapp;

create policy configuracion_whatsapp_lectura_publica
on public.configuracion_whatsapp
for select
to anon
using (true);
