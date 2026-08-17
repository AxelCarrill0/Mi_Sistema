create schema if not exists private;

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text,
  rol text not null default 'operador' check (rol in ('administrador', 'operador')),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.colecciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  descripcion text,
  estado_publicacion text not null default 'activo' check (estado_publicacion in ('activo', 'desactivado')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  descripcion text,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  codigo_interno text not null unique,
  nombre text not null,
  slug text not null unique,
  descripcion text,
  coleccion_id uuid references public.colecciones(id) on delete restrict,
  categoria_id uuid references public.categorias(id) on delete restrict,
  tipo_producto text not null check (tipo_producto in ('disponible', 'bajo_pedido', 'personalizado')),
  precio_base numeric(12, 2) check (precio_base is null or precio_base >= 0),
  controla_stock boolean not null default false,
  stock_actual integer not null default 0 check (stock_actual >= 0),
  materiales text,
  medidas text,
  colores_acabados text,
  tiempo_elaboracion text,
  estado_publicacion text not null default 'borrador' check (estado_publicacion in ('borrador', 'activo', 'desactivado')),
  destacado boolean not null default false,
  mensaje_whatsapp text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint producto_stock_coherente check (controla_stock or stock_actual = 0)
);

create table if not exists public.imagenes_producto (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id) on delete restrict,
  ruta_storage text not null,
  texto_alternativo text,
  orden integer not null default 0 check (orden >= 0),
  es_principal boolean not null default false,
  creado_en timestamptz not null default now(),
  unique (producto_id, ruta_storage)
);

create index if not exists productos_coleccion_id_idx on public.productos (coleccion_id);
create index if not exists productos_categoria_id_idx on public.productos (categoria_id);
create index if not exists productos_publicados_idx on public.productos (estado_publicacion, destacado, creado_en desc);
create index if not exists imagenes_producto_producto_id_orden_idx on public.imagenes_producto (producto_id, orden);

create or replace function public.actualizar_actualizado_en()
returns trigger language plpgsql set search_path = public as $$
begin new.actualizado_en = now(); return new; end;
$$;

drop trigger if exists perfiles_actualizar_actualizado_en on public.perfiles;
create trigger perfiles_actualizar_actualizado_en before update on public.perfiles for each row execute function public.actualizar_actualizado_en();
drop trigger if exists colecciones_actualizar_actualizado_en on public.colecciones;
create trigger colecciones_actualizar_actualizado_en before update on public.colecciones for each row execute function public.actualizar_actualizado_en();
drop trigger if exists categorias_actualizar_actualizado_en on public.categorias;
create trigger categorias_actualizar_actualizado_en before update on public.categorias for each row execute function public.actualizar_actualizado_en();
drop trigger if exists productos_actualizar_actualizado_en on public.productos;
create trigger productos_actualizar_actualizado_en before update on public.productos for each row execute function public.actualizar_actualizado_en();

create or replace function private.usuario_es_administrador()
returns boolean language sql security definer set search_path = public, private as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and activo = true and rol in ('administrador', 'operador'));
$$;
revoke all on function private.usuario_es_administrador() from public;
grant execute on function private.usuario_es_administrador() to authenticated;

alter table public.perfiles enable row level security;
alter table public.colecciones enable row level security;
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.imagenes_producto enable row level security;

create policy perfiles_ver_propio_o_administrativo on public.perfiles for select to authenticated using (id = (select auth.uid()) or private.usuario_es_administrador());
create policy colecciones_publicadas_publicas on public.colecciones for select to anon, authenticated using (estado_publicacion = 'activo');
create policy colecciones_gestion_interna on public.colecciones for all to authenticated using (private.usuario_es_administrador()) with check (private.usuario_es_administrador());
create policy categorias_activas_publicas on public.categorias for select to anon, authenticated using (activo = true);
create policy categorias_gestion_interna on public.categorias for all to authenticated using (private.usuario_es_administrador()) with check (private.usuario_es_administrador());
create policy productos_activos_publicos on public.productos for select to anon, authenticated using (estado_publicacion = 'activo');
create policy productos_gestion_interna on public.productos for all to authenticated using (private.usuario_es_administrador()) with check (private.usuario_es_administrador());
create policy imagenes_productos_activos_publicas on public.imagenes_producto for select to anon, authenticated using (exists (select 1 from public.productos where productos.id = imagenes_producto.producto_id and productos.estado_publicacion = 'activo'));
create policy imagenes_gestion_interna on public.imagenes_producto for all to authenticated using (private.usuario_es_administrador()) with check (private.usuario_es_administrador());
