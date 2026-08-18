-- Configuración de negocio y WhatsApp (Etapa 7.6).
-- Tablas de fila única (id = 1) editables desde el panel; el catálogo público las lee.

create table if not exists public.configuracion_negocio (
  id integer primary key check (id = 1),
  nombre_negocio text not null default 'FutureLife',
  mostrar_precios_publicos boolean not null default false,
  actualizado_en timestamptz not null default now()
);
create table if not exists public.configuracion_whatsapp (
  id integer primary key check (id = 1),
  numero_whatsapp text,
  mensaje_predeterminado text,
  actualizado_en timestamptz not null default now()
);
insert into public.configuracion_negocio (id) values (1) on conflict (id) do nothing;
insert into public.configuracion_whatsapp (id) values (1) on conflict (id) do nothing;
alter table public.configuracion_negocio enable row level security;
alter table public.configuracion_whatsapp enable row level security;
create policy configuracion_negocio_lectura_publica on public.configuracion_negocio
  for select to anon, authenticated using (true);
create policy configuracion_negocio_gestion_interna on public.configuracion_negocio
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
create policy configuracion_whatsapp_lectura_publica on public.configuracion_whatsapp
  for select to anon, authenticated using (true);
create policy configuracion_whatsapp_gestion_interna on public.configuracion_whatsapp
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
drop trigger if exists configuracion_negocio_actualizar_actualizado_en on public.configuracion_negocio;
create trigger configuracion_negocio_actualizar_actualizado_en
  before update on public.configuracion_negocio for each row
  execute function public.actualizar_actualizado_en();
drop trigger if exists configuracion_whatsapp_actualizar_actualizado_en on public.configuracion_whatsapp;
create trigger configuracion_whatsapp_actualizar_actualizado_en
  before update on public.configuracion_whatsapp for each row
  execute function public.actualizar_actualizado_en();
