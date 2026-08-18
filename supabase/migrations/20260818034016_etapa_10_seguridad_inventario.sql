-- Etapa 10: invariantes de seguridad y trazabilidad.
-- Corrige datos históricos de abonos convertidos y evita que el cliente
-- pueda falsear el responsable de una operación o invertir el signo de stock.

update public.pagos
set pedido_id = null
where pedido_id is not null
  and venta_id is not null;

alter table public.pagos
  drop constraint if exists chk_pago_origen_exclusivo;

alter table public.pagos
  add constraint chk_pago_origen_exclusivo
  check (
    (case when pedido_id is not null then 1 else 0 end) +
    (case when venta_id is not null then 1 else 0 end) = 1
  );

create or replace function private.normalizar_pago_origen()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if new.venta_id is not null then
    new.pedido_id := null;
  end if;
  return new;
end;
$$;

revoke all on function private.normalizar_pago_origen() from public, anon, authenticated;

drop trigger if exists pagos_normalizar_origen on public.pagos;
create trigger pagos_normalizar_origen
before insert or update on public.pagos
for each row execute function private.normalizar_pago_origen();

alter table public.movimientos_inventario
  drop constraint if exists movimiento_inventario_tipo_cantidad_coherente;

alter table public.movimientos_inventario
  add constraint movimiento_inventario_tipo_cantidad_coherente
  check (
    (tipo in ('entrada', 'produccion') and cantidad > 0) or
    (tipo = 'salida' and cantidad < 0) or
    (tipo = 'ajuste' and cantidad <> 0)
  );

create or replace function private.fijar_perfil_actual()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if auth.uid() is not null then
    new.perfil_id := auth.uid();
  end if;
  return new;
end;
$$;

revoke all on function private.fijar_perfil_actual() from public, anon, authenticated;

drop trigger if exists pagos_fijar_perfil_actual on public.pagos;
create trigger pagos_fijar_perfil_actual
before insert or update on public.pagos
for each row execute function private.fijar_perfil_actual();

drop trigger if exists producciones_fijar_perfil_actual on public.producciones;
create trigger producciones_fijar_perfil_actual
before insert or update on public.producciones
for each row execute function private.fijar_perfil_actual();

drop trigger if exists historial_pedido_fijar_perfil_actual on public.historial_estados_pedido;
create trigger historial_pedido_fijar_perfil_actual
before insert or update on public.historial_estados_pedido
for each row execute function private.fijar_perfil_actual();

drop trigger if exists historial_produccion_fijar_perfil_actual on public.historial_estados_produccion;
create trigger historial_produccion_fijar_perfil_actual
before insert or update on public.historial_estados_produccion
for each row execute function private.fijar_perfil_actual();

drop trigger if exists movimientos_fijar_perfil_actual on public.movimientos_inventario;
create trigger movimientos_fijar_perfil_actual
before insert or update on public.movimientos_inventario
for each row execute function private.fijar_perfil_actual();
