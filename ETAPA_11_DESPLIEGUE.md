# Etapa 11 — Despliegue y operación

## Estado

Preparación iniciada. El proyecto está listo para una primera publicación, pero el despliegue final requiere que el propietario configure Vercel, el dominio y las variables de entorno en sus propias cuentas.

## Preparado en el código

- `.env.example` documenta las variables necesarias.
- Las claves usadas por el navegador son únicamente la URL y la publishable key de Supabase.
- No se agregan claves `service_role`, contraseñas ni secretos al repositorio.
- `next.config.ts` permite imágenes públicas del Storage de Supabase usando el hostname configurado.
- `/api/health` responde con estado `ok` y `Cache-Control: no-store` para comprobaciones de disponibilidad.
- El middleware protege las rutas `/panel` y redirige usuarios no autenticados al login.
- Las migraciones de Supabase están versionadas y el historial remoto está sincronizado.

## Publicación inicial en Vercel

1. Importar el repositorio en Vercel.
2. Seleccionar el preset Next.js y conservar el comando de build `next build`.
3. Agregar en Project Settings → Environment Variables, para `Production` y `Preview` según corresponda:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `WHATSAPP_NUMERO` si se usará como respaldo de configuración.

4. Ejecutar el primer deploy.
5. Probar `/api/health`, `/catalogo`, `/panel/ingreso` y una ruta de detalle público.
6. En Supabase Auth → URL Configuration, agregar el dominio de Vercel a los redirect URLs permitidos.
7. Configurar el dominio propio cuando esté disponible y repetir las pruebas con el dominio final.

## Checklist previo a producción

- [ ] Confirmar que las variables de producción no estén vacías.
- [ ] Confirmar que la URL pública de Supabase corresponde al proyecto correcto.
- [ ] Confirmar que el registro público permanezca desactivado.
- [ ] Mantener un usuario administrador real y un segundo administrador de recuperación.
- [ ] Cargar productos, imágenes, configuración del negocio y WhatsApp reales.
- [ ] Ejecutar una cotización de prueba y verificar su impresión.
- [ ] Ejecutar una venta de prueba con datos controlados y revisar el inventario.
- [ ] Revisar el dominio y los redirect URLs de Auth.
- [ ] Guardar una copia de las migraciones y definir la frecuencia de respaldos.
- [ ] Documentar quién puede operar el panel y cómo reportar incidentes.

## Verificación posterior al despliegue

```text
GET https://TU-DOMINIO/api/health       → 200 y status ok
GET https://TU-DOMINIO/catalogo         → catálogo visible
GET https://TU-DOMINIO/panel            → redirección al login sin sesión
GET https://TU-DOMINIO/panel/ingreso    → formulario de acceso
```

Si una publicación falla, conservar el deployment anterior en Vercel y hacer rollback desde el historial de deployments. No modificar tablas manualmente para corregir un problema de aplicación; usar una migración versionada.

## Evolución después de producción

La publicación no congela el proyecto. Se pueden añadir funcionalidades posteriormente mediante módulos pequeños, pruebas nuevas y migraciones de base de datos cuando el cambio lo requiera. Las futuras mejoras deben pasar por Preview Deployments antes de llegar a Production.
