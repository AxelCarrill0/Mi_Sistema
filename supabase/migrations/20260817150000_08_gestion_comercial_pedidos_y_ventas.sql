-- Migración 08: Gestión comercial (Etapa 8).
-- Pedidos, detalles_pedido, historial_estados_pedido, ventas, detalles_venta y pagos (abonos).
-- Todo privado y con RLS administrativa estricta.

create sequence if not exists public.pedidos_numero_seq;
create sequence if not exists public.ventas_numero_seq;
-- 1. Tabla de Pedidos
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero integer not null default nextval('public.pedidos_numero_seq') unique,
  cotizacion_id uuid references public.cotizaciones(id) on delete set null,
  cliente_id uuid references public.clientes(id) on delete set null,
  nombre_cliente text not null,
  telefono_cliente text,
  email_cliente text,
  direccion_cliente text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'entregado', 'cancelado')),
  observaciones text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
-- 2. Detalles de Pedido
create table if not exists public.detalles_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  descripcion text not null,
  cantidad integer not null default 1 check (cantidad > 0),
  precio_unitario numeric(12, 2) not null check (precio_unitario >= 0),
  creado_en timestamptz not null default now()
);
-- 3. Historial de Estados de Pedido
create table if not exists public.historial_estados_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  estado_anterior text check (estado_anterior is null or estado_anterior in ('pendiente', 'entregado', 'cancelado')),
  estado_nuevo text not null check (estado_nuevo in ('pendiente', 'entregado', 'cancelado')),
  perfil_id uuid references public.perfiles(id) on delete set null,
  motivo text,
  creado_en timestamptz not null default now()
);
-- 4. Tabla de Ventas
create table if not exists public.ventas (
  id uuid primary key default gen_random_uuid(),
  numero integer not null default nextval('public.ventas_numero_seq') unique,
  pedido_id uuid references public.pedidos(id) on delete set null unique,
  cliente_id uuid references public.clientes(id) on delete set null,
  nombre_cliente text not null,
  telefono_cliente text,
  email_cliente text,
  direccion_cliente text,
  observaciones text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
-- 5. Detalles de Venta
create table if not exists public.detalles_venta (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references public.ventas(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  descripcion text not null,
  cantidad integer not null default 1 check (cantidad > 0),
  precio_unitario numeric(12, 2) not null check (precio_unitario >= 0),
  creado_en timestamptz not null default now()
);
-- 6. Pagos / Abonos
create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references public.pedidos(id) on delete cascade,
  venta_id uuid references public.ventas(id) on delete cascade,
  monto numeric(12, 2) not null check (monto > 0),
  metodo_pago text not null default 'efectivo' check (metodo_pago in ('efectivo', 'transferencia', 'deposito', 'tarjeta', 'otro')),
  referencia text,
  notas text,
  perfil_id uuid references public.perfiles(id) on delete set null,
  creado_en timestamptz not null default now(),
  constraint chk_pago_origen check (pedido_id is not null or venta_id is not null)
);
-- Índices de consulta frecuente
create index if not exists pedidos_creado_en_idx on public.pedidos (creado_en desc);
create index if not exists pedidos_estado_idx on public.pedidos (estado);
create index if not exists pedidos_cliente_id_idx on public.pedidos (cliente_id);
create index if not exists detalles_pedido_pedido_id_idx on public.detalles_pedido (pedido_id);
create index if not exists historial_estados_pedido_pedido_id_idx on public.historial_estados_pedido (pedido_id, creado_en asc);
create index if not exists ventas_creado_en_idx on public.ventas (creado_en desc);
create index if not exists ventas_pedido_id_idx on public.ventas (pedido_id);
create index if not exists ventas_cliente_id_idx on public.ventas (cliente_id);
create index if not exists detalles_venta_venta_id_idx on public.detalles_venta (venta_id);
create index if not exists pagos_pedido_id_idx on public.pagos (pedido_id);
create index if not exists pagos_venta_id_idx on public.pagos (venta_id);
-- Triggers para actualizado_en
drop trigger if exists pedidos_actualizar_actualizado_en on public.pedidos;
create trigger pedidos_actualizar_actualizado_en
  before update on public.pedidos for each row
  execute function public.actualizar_actualizado_en();
drop trigger if exists ventas_actualizar_actualizado_en on public.ventas;
create trigger ventas_actualizar_actualizado_en
  before update on public.ventas for each row
  execute function public.actualizar_actualizado_en();
-- Habilitar RLS
alter table public.pedidos enable row level security;
alter table public.detalles_pedido enable row level security;
alter table public.historial_estados_pedido enable row level security;
alter table public.ventas enable row level security;
alter table public.detalles_venta enable row level security;
alter table public.pagos enable row level security;
-- Políticas RLS: solo lectura y escritura para administradores/operadores autenticados
create policy pedidos_gestion_interna on public.pedidos
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
create policy detalles_pedido_gestion_interna on public.detalles_pedido
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
create policy historial_estados_pedido_gestion_interna on public.historial_estados_pedido
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
create policy ventas_gestion_interna on public.ventas
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
create policy detalles_venta_gestion_interna on public.detalles_venta
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
create policy pagos_gestion_interna on public.pagos
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());
-- Función atómica: Convertir pedido en venta (con descuento de inventario y asociación de abonos)
create or replace function public.convertir_pedido_en_venta(
  p_pedido_id uuid,
  p_perfil_id uuid default null,
  p_motivo text default 'Conversión automática al entregar pedido'
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_pedido record;
  v_item record;
  v_prod record;
  v_nueva_venta_id uuid;
  v_venta_existente_id uuid;
begin
  if not private.usuario_es_administrador() then
    raise exception 'No autorizado para realizar esta acción.';
  end if;

  select * into v_pedido
  from public.pedidos
  where id = p_pedido_id
  for update;

  if not found then
    raise exception 'El pedido especificado no existe.';
  end if;

  -- Verificar si ya existe una venta asociada a este pedido
  select id into v_venta_existente_id
  from public.ventas
  where pedido_id = p_pedido_id;

  if v_venta_existente_id is not null then
    return v_venta_existente_id;
  end if;

  if v_pedido.estado = 'cancelado' then
    raise exception 'No se puede convertir a venta un pedido cancelado.';
  end if;

  -- 1. Validar y descontar stock para productos que controlan inventario
  for v_item in
    select producto_id, descripcion, cantidad
    from public.detalles_pedido
    where pedido_id = p_pedido_id and producto_id is not null
  loop
    select id, nombre, controla_stock, stock_actual
    into v_prod
    from public.productos
    where id = v_item.producto_id
    for update;

    if found and v_prod.controla_stock then
      if v_prod.stock_actual < v_item.cantidad then
        raise exception 'Stock insuficiente para el producto "%" (disponible: %, solicitado: %).',
          v_prod.nombre, v_prod.stock_actual, v_item.cantidad;
      end if;

      update public.productos
      set stock_actual = stock_actual - v_item.cantidad
      where id = v_item.producto_id;
    end if;
  end loop;

  -- 2. Crear la venta
  insert into public.ventas (
    pedido_id,
    cliente_id,
    nombre_cliente,
    telefono_cliente,
    email_cliente,
    direccion_cliente,
    observaciones
  ) values (
    v_pedido.id,
    v_pedido.cliente_id,
    v_pedido.nombre_cliente,
    v_pedido.telefono_cliente,
    v_pedido.email_cliente,
    v_pedido.direccion_cliente,
    v_pedido.observaciones
  ) returning id into v_nueva_venta_id;

  -- 3. Copiar las líneas del pedido a la venta
  insert into public.detalles_venta (
    venta_id,
    producto_id,
    descripcion,
    cantidad,
    precio_unitario
  )
  select
    v_nueva_venta_id,
    producto_id,
    descripcion,
    cantidad,
    precio_unitario
  from public.detalles_pedido
  where pedido_id = p_pedido_id;

  -- 4. Asociar los abonos existentes del pedido a la venta
  update public.pagos
  set venta_id = v_nueva_venta_id
  where pedido_id = p_pedido_id and venta_id is null;

  -- 5. Actualizar estado del pedido a 'entregado'
  if v_pedido.estado <> 'entregado' then
    update public.pedidos
    set estado = 'entregado'
    where id = p_pedido_id;

    insert into public.historial_estados_pedido (
      pedido_id,
      estado_anterior,
      estado_nuevo,
      perfil_id,
      motivo
    ) values (
      p_pedido_id,
      v_pedido.estado,
      'entregado',
      p_perfil_id,
      p_motivo
    );
  end if;

  return v_nueva_venta_id;
end;
$$;
-- Función atómica: Registrar venta directa manual (descuenta stock e inserta venta + detalle + abono opcional)
create or replace function public.registrar_venta_directa(
  p_cliente_id uuid,
  p_nombre_cliente text,
  p_telefono_cliente text,
  p_email_cliente text,
  p_direccion_cliente text,
  p_observaciones text,
  p_lineas jsonb,
  p_abono_monto numeric default null,
  p_abono_metodo text default 'efectivo',
  p_abono_referencia text default null,
  p_perfil_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_nueva_venta_id uuid;
  v_elem jsonb;
  v_prod_id uuid;
  v_cant int;
  v_desc text;
  v_precio numeric(12, 2);
  v_prod record;
begin
  if not private.usuario_es_administrador() then
    raise exception 'No autorizado para realizar esta acción.';
  end if;

  if p_nombre_cliente is null or trim(p_nombre_cliente) = '' then
    raise exception 'El nombre del cliente es obligatorio.';
  end if;

  if jsonb_array_length(p_lineas) = 0 then
    raise exception 'Debe incluir al menos una línea en la venta.';
  end if;

  -- 1. Validar y descontar stock
  for v_elem in select * from jsonb_array_elements(p_lineas)
  loop
    v_cant := (v_elem->>'cantidad')::int;
    v_prod_id := null;
    if (v_elem->>'producto_id') is not null and (v_elem->>'producto_id') <> '' then
      v_prod_id := (v_elem->>'producto_id')::uuid;
    end if;

    if v_cant <= 0 then
      raise exception 'La cantidad debe ser mayor a 0.';
    end if;

    if v_prod_id is not null then
      select id, nombre, controla_stock, stock_actual
      into v_prod
      from public.productos
      where id = v_prod_id
      for update;

      if found and v_prod.controla_stock then
        if v_prod.stock_actual < v_cant then
          raise exception 'Stock insuficiente para el producto "%" (disponible: %, solicitado: %).',
            v_prod.nombre, v_prod.stock_actual, v_cant;
        end if;

        update public.productos
        set stock_actual = stock_actual - v_cant
        where id = v_prod_id;
      end if;
    end if;
  end loop;

  -- 2. Crear la venta
  insert into public.ventas (
    pedido_id,
    cliente_id,
    nombre_cliente,
    telefono_cliente,
    email_cliente,
    direccion_cliente,
    observaciones
  ) values (
    null,
    p_cliente_id,
    trim(p_nombre_cliente),
    nullif(trim(p_telefono_cliente), ''),
    nullif(trim(p_email_cliente), ''),
    nullif(trim(p_direccion_cliente), ''),
    nullif(trim(p_observaciones), '')
  ) returning id into v_nueva_venta_id;

  -- 3. Insertar las líneas de detalle
  for v_elem in select * from jsonb_array_elements(p_lineas)
  loop
    v_cant := (v_elem->>'cantidad')::int;
    v_desc := trim(v_elem->>'descripcion');
    v_precio := (v_elem->>'precio_unitario')::numeric(12, 2);
    v_prod_id := null;
    if (v_elem->>'producto_id') is not null and (v_elem->>'producto_id') <> '' then
      v_prod_id := (v_elem->>'producto_id')::uuid;
    end if;

    insert into public.detalles_venta (
      venta_id,
      producto_id,
      descripcion,
      cantidad,
      precio_unitario
    ) values (
      v_nueva_venta_id,
      v_prod_id,
      v_desc,
      v_cant,
      v_precio
    );
  end loop;

  -- 4. Registrar abono inicial si se proveyó
  if p_abono_monto is not null and p_abono_monto > 0 then
    insert into public.pagos (
      pedido_id,
      venta_id,
      monto,
      metodo_pago,
      referencia,
      notas,
      perfil_id
    ) values (
      null,
      v_nueva_venta_id,
      p_abono_monto,
      coalesce(p_abono_metodo, 'efectivo'),
      nullif(trim(p_abono_referencia), ''),
      'Abono registrado al crear la venta',
      p_perfil_id
    );
  end if;

  return v_nueva_venta_id;
end;
$$;
revoke all on function public.convertir_pedido_en_venta(uuid, uuid, text) from public;
grant execute on function public.convertir_pedido_en_venta(uuid, uuid, text) to authenticated;
revoke all on function public.registrar_venta_directa(uuid, text, text, text, text, text, jsonb, numeric, text, text, uuid) from public;
grant execute on function public.registrar_venta_directa(uuid, text, text, text, text, text, jsonb, numeric, text, text, uuid) to authenticated;
