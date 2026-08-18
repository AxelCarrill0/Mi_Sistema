-- Migración 10: Inventario y producción (Etapa 9).
-- movimientos_inventario, producciones, historial_estados_produccion.
-- Todo privado y con RLS administrativa estricta.

create sequence if not exists public.producciones_numero_seq;

-- 1. Órdenes de producción
create table if not exists public.producciones (
  id uuid primary key default gen_random_uuid(),
  numero integer not null default nextval('public.producciones_numero_seq') unique,
  producto_id uuid not null references public.productos(id) on delete restrict,
  cantidad integer not null default 1 check (cantidad > 0),
  estado text not null default 'activa' check (estado in ('activa', 'completada', 'cancelada')),
  observaciones text,
  perfil_id uuid references public.perfiles(id) on delete set null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- 2. Historial de estados de producción
create table if not exists public.historial_estados_produccion (
  id uuid primary key default gen_random_uuid(),
  produccion_id uuid not null references public.producciones(id) on delete cascade,
  estado_anterior text check (estado_anterior is null or estado_anterior in ('activa', 'completada', 'cancelada')),
  estado_nuevo text not null check (estado_nuevo in ('activa', 'completada', 'cancelada')),
  perfil_id uuid references public.perfiles(id) on delete set null,
  motivo text,
  creado_en timestamptz not null default now()
);

-- 3. Movimientos de inventario
create table if not exists public.movimientos_inventario (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id) on delete restrict,
  tipo text not null check (tipo in ('entrada', 'salida', 'ajuste', 'produccion')),
  cantidad integer not null check (cantidad <> 0),
  stock_resultante integer not null check (stock_resultante >= 0),
  origen text not null check (origen in ('venta', 'pedido', 'produccion', 'manual')),
  venta_id uuid references public.ventas(id) on delete set null,
  pedido_id uuid references public.pedidos(id) on delete set null,
  produccion_id uuid references public.producciones(id) on delete set null,
  perfil_id uuid references public.perfiles(id) on delete set null,
  notas text,
  creado_en timestamptz not null default now()
);

-- Índices de consulta frecuente
create index if not exists movimientos_inventario_producto_id_idx
  on public.movimientos_inventario (producto_id, creado_en desc);
create index if not exists movimientos_inventario_creado_en_idx
  on public.movimientos_inventario (creado_en desc);
create index if not exists movimientos_inventario_venta_id_idx on public.movimientos_inventario (venta_id);
create index if not exists movimientos_inventario_pedido_id_idx on public.movimientos_inventario (pedido_id);
create index if not exists movimientos_inventario_produccion_id_idx on public.movimientos_inventario (produccion_id);

create index if not exists producciones_estado_idx on public.producciones (estado);
create index if not exists producciones_creado_en_idx on public.producciones (creado_en desc);
create index if not exists producciones_producto_id_idx on public.producciones (producto_id);
create index if not exists historial_estados_produccion_produccion_id_idx
  on public.historial_estados_produccion (produccion_id, creado_en asc);

-- Triggers para actualizado_en
drop trigger if exists producciones_actualizar_actualizado_en on public.producciones;
create trigger producciones_actualizar_actualizado_en
  before update on public.producciones for each row
  execute function public.actualizar_actualizado_en();

-- Habilitar RLS
alter table public.movimientos_inventario enable row level security;
alter table public.producciones enable row level security;
alter table public.historial_estados_produccion enable row level security;

-- Políticas RLS: solo lectura y escritura para administradores/operadores autenticados
create policy movimientos_inventario_gestion_interna on public.movimientos_inventario
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());

create policy producciones_gestion_interna on public.producciones
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());

create policy historial_estados_produccion_gestion_interna on public.historial_estados_produccion
  for all to authenticated using (private.usuario_es_administrador())
  with check (private.usuario_es_administrador());

-- Función atómica: Registrar movimiento de inventario.
-- Ajusta stock_actual del producto y deja trazabilidad del movimiento.
create or replace function public.registrar_movimiento_inventario(
  p_producto_id uuid,
  p_tipo text,
  p_cantidad integer,
  p_origen text,
  p_notas text default null,
  p_venta_id uuid default null,
  p_pedido_id uuid default null,
  p_produccion_id uuid default null,
  p_perfil_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_producto record;
  v_nuevo_stock integer;
  v_movimiento_id uuid;
begin
  if not private.usuario_es_administrador() then
    raise exception 'No autorizado para realizar esta acción.';
  end if;

  if p_tipo not in ('entrada', 'salida', 'ajuste', 'produccion') then
    raise exception 'Tipo de movimiento no válido.';
  end if;

  if p_origen not in ('venta', 'pedido', 'produccion', 'manual') then
    raise exception 'Origen de movimiento no válido.';
  end if;

  if p_cantidad is null or p_cantidad = 0 then
    raise exception 'La cantidad del movimiento debe ser distinta de 0.';
  end if;

  select id, nombre, controla_stock, stock_actual
  into v_producto
  from public.productos
  where id = p_producto_id
  for update;

  if not found then
    raise exception 'El producto especificado no existe.';
  end if;

  if not v_producto.controla_stock then
    raise exception 'El producto "%" no controla stock; no admite movimientos de inventario.',
      v_producto.nombre;
  end if;

  v_nuevo_stock := v_producto.stock_actual + p_cantidad;

  if v_nuevo_stock < 0 then
    raise exception 'Stock insuficiente para el producto "%" (disponible: %, movimiento: %).',
      v_producto.nombre, v_producto.stock_actual, p_cantidad;
  end if;

  update public.productos
  set stock_actual = v_nuevo_stock
  where id = p_producto_id;

  insert into public.movimientos_inventario (
    producto_id,
    tipo,
    cantidad,
    stock_resultante,
    origen,
    venta_id,
    pedido_id,
    produccion_id,
    perfil_id,
    notas
  ) values (
    p_producto_id,
    p_tipo,
    p_cantidad,
    v_nuevo_stock,
    p_origen,
    p_venta_id,
    p_pedido_id,
    p_produccion_id,
    p_perfil_id,
    nullif(trim(coalesce(p_notas, '')), '')
  ) returning id into v_movimiento_id;

  return v_movimiento_id;
end;
$$;

-- Función atómica: Completar una orden de producción.
-- Ingresa el stock del producto y registra el historial y el movimiento.
create or replace function public.completar_produccion(
  p_produccion_id uuid,
  p_perfil_id uuid default null,
  p_motivo text default 'Producción completada'
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_produccion record;
begin
  if not private.usuario_es_administrador() then
    raise exception 'No autorizado para realizar esta acción.';
  end if;

  select id, numero, producto_id, cantidad, estado
  into v_produccion
  from public.producciones
  where id = p_produccion_id
  for update;

  if not found then
    raise exception 'La orden de producción no existe.';
  end if;

  if v_produccion.estado <> 'activa' then
    raise exception 'Solo se pueden completar órdenes activas.';
  end if;

  update public.producciones
  set estado = 'completada'
  where id = p_produccion_id;

  insert into public.historial_estados_produccion (
    produccion_id,
    estado_anterior,
    estado_nuevo,
    perfil_id,
    motivo
  ) values (
    p_produccion_id,
    v_produccion.estado,
    'completada',
    p_perfil_id,
    p_motivo
  );

  perform public.registrar_movimiento_inventario(
    v_produccion.producto_id,
    'produccion',
    v_produccion.cantidad,
    'produccion',
    'Producción Nº ' || v_produccion.numero || ' completada',
    null,
    null,
    p_produccion_id,
    p_perfil_id
  );

  return p_produccion_id;
end;
$$;

-- Función atómica: Cancelar una orden de producción.
-- No modifica stock; solo registra el historial.
create or replace function public.cancelar_produccion(
  p_produccion_id uuid,
  p_perfil_id uuid default null,
  p_motivo text default 'Orden cancelada'
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_produccion record;
begin
  if not private.usuario_es_administrador() then
    raise exception 'No autorizado para realizar esta acción.';
  end if;

  select id, estado
  into v_produccion
  from public.producciones
  where id = p_produccion_id
  for update;

  if not found then
    raise exception 'La orden de producción no existe.';
  end if;

  if v_produccion.estado <> 'activa' then
    raise exception 'Solo se pueden cancelar órdenes activas.';
  end if;

  update public.producciones
  set estado = 'cancelada'
  where id = p_produccion_id;

  insert into public.historial_estados_produccion (
    produccion_id,
    estado_anterior,
    estado_nuevo,
    perfil_id,
    motivo
  ) values (
    p_produccion_id,
    v_produccion.estado,
    'cancelada',
    p_perfil_id,
    p_motivo
  );

  return p_produccion_id;
end;
$$;

-- Ampliar convertir_pedido_en_venta para registrar movimientos de salida por línea.
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
  v_stock_resultante integer;
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

  select id into v_venta_existente_id
  from public.ventas
  where pedido_id = p_pedido_id;

  if v_venta_existente_id is not null then
    return v_venta_existente_id;
  end if;

  if v_pedido.estado = 'cancelado' then
    raise exception 'No se puede convertir a venta un pedido cancelado.';
  end if;

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

  -- 1. Validar y descontar stock con trazabilidad de movimientos
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

      v_stock_resultante := v_prod.stock_actual - v_item.cantidad;

      update public.productos
      set stock_actual = v_stock_resultante
      where id = v_item.producto_id;

      insert into public.movimientos_inventario (
        producto_id,
        tipo,
        cantidad,
        stock_resultante,
        origen,
        venta_id,
        pedido_id,
        produccion_id,
        perfil_id,
        notas
      ) values (
        v_item.producto_id,
        'salida',
        -1 * v_item.cantidad,
        v_stock_resultante,
        'venta',
        v_nueva_venta_id,
        p_pedido_id,
        null,
        p_perfil_id,
        'Venta generada desde pedido'
      );
    end if;
  end loop;

  -- 2. Copiar las líneas del pedido a la venta
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

  -- 3. Asociar los abonos existentes del pedido a la venta
  update public.pagos
  set venta_id = v_nueva_venta_id
  where pedido_id = p_pedido_id and venta_id is null;

  -- 4. Actualizar estado del pedido a 'entregado'
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

-- Ampliar registrar_venta_directa para registrar movimientos de salida por línea.
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
  v_stock_resultante integer;
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

  -- 1. Validar y descontar stock con trazabilidad de movimientos
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

        v_stock_resultante := v_prod.stock_actual - v_cant;

        update public.productos
        set stock_actual = v_stock_resultante
        where id = v_prod_id;

        insert into public.movimientos_inventario (
          producto_id,
          tipo,
          cantidad,
          stock_resultante,
          origen,
          venta_id,
          pedido_id,
          produccion_id,
          perfil_id,
          notas
        ) values (
          v_prod_id,
          'salida',
          -1 * v_cant,
          v_stock_resultante,
          'venta',
          v_nueva_venta_id,
          null,
          null,
          p_perfil_id,
          'Venta directa'
        );
      end if;
    end if;
  end loop;

  -- 2. Insertar las líneas de detalle
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

  -- 3. Registrar abono inicial si se proveyó
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

-- Umbral de stock bajo configurable (valor por defecto 5).
alter table public.configuracion_negocio
  add column if not exists umbral_stock_bajo integer not null default 5
  check (umbral_stock_bajo >= 0);

revoke all on function public.registrar_movimiento_inventario(uuid, text, integer, text, text, uuid, uuid, uuid, uuid) from public, anon;
grant execute on function public.registrar_movimiento_inventario(uuid, text, integer, text, text, uuid, uuid, uuid, uuid) to authenticated;

revoke all on function public.completar_produccion(uuid, uuid, text) from public, anon;
grant execute on function public.completar_produccion(uuid, uuid, text) to authenticated;

revoke all on function public.cancelar_produccion(uuid, uuid, text) from public, anon;
grant execute on function public.cancelar_produccion(uuid, uuid, text) to authenticated;

revoke all on function public.convertir_pedido_en_venta(uuid, uuid, text) from public, anon;
grant execute on function public.convertir_pedido_en_venta(uuid, uuid, text) to authenticated;

revoke all on function public.registrar_venta_directa(uuid, text, text, text, text, text, jsonb, numeric, text, text, uuid) from public, anon;
grant execute on function public.registrar_venta_directa(uuid, text, text, text, text, text, jsonb, numeric, text, text, uuid) to authenticated;
