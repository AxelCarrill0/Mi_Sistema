-- Clientes y cotizaciones (Etapa 7.7 y 7.8).
-- Datos privados del negocio: solo lectura/escritura administrativa (sin lectura pública).

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  identificacion text,
  telefono text,
  email text,
  direccion text,
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create sequence if not exists public.cotizaciones_numero_seq;
create table if not exists public.cotizaciones (
  id uuid primary key default gen_random_uuid(),
  numero integer not null default nextval('public.cotizaciones_numero_seq') unique,
  cliente_id uuid references public.clientes(id) on delete set null,
  nombre_cliente text not null,
  telefono_cliente text,
  email_cliente text,
  direccion_cliente text,
  estado text not null default 'borrador' check (estado in ('borrador', 'enviada', 'aceptada', 'rechazada')),
  vigencia_dias integer not null default 15 check (vigencia_dias >= 1),
  observaciones text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create table if not exists public.cotizaciones_detalle (
  id uuid primary key default gen_random_uuid(),
  cotizacion_id uuid not null references public.cotizaciones(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  descripcion text not null,
  cantidad integer not null default 1 check (cantidad > 0),
  precio_unitario numeric(12, 2) not null check (precio_unitario >= 0),
  creado_en timestamptz not null default now()
);
create index if not exists clientes_nombres_idx on public.clientes (nombres);
create index if not exists cotizaciones_creado_en_idx on public.cotizaciones (creado_en desc);
create index if not exists cotizaciones_detalle_cotizacion_id_idx on public.cotizaciones_detalle (cotizacion_id);
alter table public.clientes enable row level security;
alter table public.cotizaciones enable row level security;
alter table public.cotizaciones_detalle enable row level security;
create policy clientes_gestion_interna on public.clientes
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
create policy cotizaciones_gestion_interna on public.cotizaciones
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
create policy cotizaciones_detalle_gestion_interna on public.cotizaciones_detalle
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
drop trigger if exists clientes_actualizar_actualizado_en on public.clientes;
create trigger clientes_actualizar_actualizado_en
  before update on public.clientes for each row
  execute function public.actualizar_actualizado_en();
drop trigger if exists cotizaciones_actualizar_actualizado_en on public.cotizaciones;
create trigger cotizaciones_actualizar_actualizado_en
  before update on public.cotizaciones for each row
  execute function public.actualizar_actualizado_en();
