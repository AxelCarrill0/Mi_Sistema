-- Etapa 10: índices para las claves foráneas usadas en relaciones y auditoría.
create index if not exists cotizaciones_cliente_id_idx on public.cotizaciones (cliente_id);
create index if not exists cotizaciones_detalle_producto_id_idx on public.cotizaciones_detalle (producto_id);
create index if not exists detalles_pedido_producto_id_idx on public.detalles_pedido (producto_id);
create index if not exists detalles_venta_producto_id_idx on public.detalles_venta (producto_id);
create index if not exists historial_estados_pedido_perfil_id_idx on public.historial_estados_pedido (perfil_id);
create index if not exists historial_estados_produccion_perfil_id_idx on public.historial_estados_produccion (perfil_id);
create index if not exists movimientos_inventario_perfil_id_idx on public.movimientos_inventario (perfil_id);
create index if not exists pagos_perfil_id_idx on public.pagos (perfil_id);
create index if not exists pedidos_cotizacion_id_idx on public.pedidos (cotizacion_id);
create index if not exists producciones_perfil_id_idx on public.producciones (perfil_id);
