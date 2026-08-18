
drop policy if exists colecciones_lectura_publica_o_interna on public.colecciones;
create policy colecciones_lectura_publica on public.colecciones for select to anon using (estado_publicacion = 'activo');
create policy colecciones_lectura_autenticada on public.colecciones for select to authenticated using (estado_publicacion = 'activo' or (select private.usuario_es_administrador()));

drop policy if exists categorias_lectura_publica_o_interna on public.categorias;
create policy categorias_lectura_publica on public.categorias for select to anon using (activo = true);
create policy categorias_lectura_autenticada on public.categorias for select to authenticated using (activo = true or (select private.usuario_es_administrador()));

drop policy if exists productos_lectura_publica_o_interna on public.productos;
create policy productos_lectura_publica on public.productos for select to anon using (estado_publicacion = 'activo');
create policy productos_lectura_autenticada on public.productos for select to authenticated using (estado_publicacion = 'activo' or (select private.usuario_es_administrador()));

drop policy if exists imagenes_lectura_publica_o_interna on public.imagenes_producto;
create policy imagenes_lectura_publica on public.imagenes_producto for select to anon using (
  exists (
    select 1 from public.productos
    where productos.id = imagenes_producto.producto_id
      and productos.estado_publicacion = 'activo'
  )
);
create policy imagenes_lectura_autenticada on public.imagenes_producto for select to authenticated using (
  exists (
    select 1 from public.productos
    where productos.id = imagenes_producto.producto_id
      and (
        productos.estado_publicacion = 'activo'
        or (select private.usuario_es_administrador())
      )
  )
);
;
