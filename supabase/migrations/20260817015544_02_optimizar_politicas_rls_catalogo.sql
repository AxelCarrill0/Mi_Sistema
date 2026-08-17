drop policy if exists perfiles_ver_propio_o_administrativo on public.perfiles;
create policy perfiles_ver_propio_o_administrativo on public.perfiles for select to authenticated using (id = (select auth.uid()) or private.usuario_es_administrador());

drop policy if exists colecciones_publicadas_publicas on public.colecciones;
drop policy if exists colecciones_gestion_interna on public.colecciones;
create policy colecciones_lectura_publica_o_interna on public.colecciones for select to anon, authenticated using (estado_publicacion = 'activo' or (select private.usuario_es_administrador()));
create policy colecciones_insertar_interna on public.colecciones for insert to authenticated with check ((select private.usuario_es_administrador()));
create policy colecciones_actualizar_interna on public.colecciones for update to authenticated using ((select private.usuario_es_administrador())) with check ((select private.usuario_es_administrador()));
create policy colecciones_eliminar_interna on public.colecciones for delete to authenticated using ((select private.usuario_es_administrador()));

drop policy if exists categorias_activas_publicas on public.categorias;
drop policy if exists categorias_gestion_interna on public.categorias;
create policy categorias_lectura_publica_o_interna on public.categorias for select to anon, authenticated using (activo = true or (select private.usuario_es_administrador()));
create policy categorias_insertar_interna on public.categorias for insert to authenticated with check ((select private.usuario_es_administrador()));
create policy categorias_actualizar_interna on public.categorias for update to authenticated using ((select private.usuario_es_administrador())) with check ((select private.usuario_es_administrador()));
create policy categorias_eliminar_interna on public.categorias for delete to authenticated using ((select private.usuario_es_administrador()));

drop policy if exists productos_activos_publicos on public.productos;
drop policy if exists productos_gestion_interna on public.productos;
create policy productos_lectura_publica_o_interna on public.productos for select to anon, authenticated using (estado_publicacion = 'activo' or (select private.usuario_es_administrador()));
create policy productos_insertar_interna on public.productos for insert to authenticated with check ((select private.usuario_es_administrador()));
create policy productos_actualizar_interna on public.productos for update to authenticated using ((select private.usuario_es_administrador())) with check ((select private.usuario_es_administrador()));
create policy productos_eliminar_interna on public.productos for delete to authenticated using ((select private.usuario_es_administrador()));

drop policy if exists imagenes_productos_activos_publicas on public.imagenes_producto;
drop policy if exists imagenes_gestion_interna on public.imagenes_producto;
create policy imagenes_lectura_publica_o_interna on public.imagenes_producto for select to anon, authenticated using (exists (select 1 from public.productos where productos.id = imagenes_producto.producto_id and (productos.estado_publicacion = 'activo' or (select private.usuario_es_administrador()))));
create policy imagenes_insertar_interna on public.imagenes_producto for insert to authenticated with check ((select private.usuario_es_administrador()));
create policy imagenes_actualizar_interna on public.imagenes_producto for update to authenticated using ((select private.usuario_es_administrador())) with check ((select private.usuario_es_administrador()));
create policy imagenes_eliminar_interna on public.imagenes_producto for delete to authenticated using ((select private.usuario_es_administrador()));
