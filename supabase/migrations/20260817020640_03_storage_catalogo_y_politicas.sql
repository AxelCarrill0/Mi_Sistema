
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalogo',
  'catalogo',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists imagenes_catalogo_lectura_publica on storage.objects;
create policy imagenes_catalogo_lectura_publica
on storage.objects for select
to anon, authenticated
using (bucket_id = 'catalogo');

drop policy if exists imagenes_catalogo_insertar_interna on storage.objects;
create policy imagenes_catalogo_insertar_interna
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'catalogo'
  and (select private.usuario_es_administrador())
);

drop policy if exists imagenes_catalogo_actualizar_interna on storage.objects;
create policy imagenes_catalogo_actualizar_interna
on storage.objects for update
to authenticated
using (
  bucket_id = 'catalogo'
  and (select private.usuario_es_administrador())
)
with check (
  bucket_id = 'catalogo'
  and (select private.usuario_es_administrador())
);

drop policy if exists imagenes_catalogo_eliminar_interna on storage.objects;
create policy imagenes_catalogo_eliminar_interna
on storage.objects for delete
to authenticated
using (
  bucket_id = 'catalogo'
  and (select private.usuario_es_administrador())
);
;
