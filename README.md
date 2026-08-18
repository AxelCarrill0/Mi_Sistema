# FutureLife

Nueva aplicación para el catálogo público y la gestión comercial de FutureLife.

## Estado

Las etapas 0 a 10 están implementadas y la Etapa 11 — despliegue y operación — está en preparación. La evidencia de calidad está documentada en `ETAPA_10_CALIDAD.md` y la guía de publicación en `ETAPA_11_DESPLIEGUE.md`.

## Base técnica prevista

- Next.js con App Router
- TypeScript en modo estricto
- Supabase para backend, PostgreSQL, autenticación y almacenamiento
- Vercel para el despliegue inicial

## Comandos

Instalar dependencias con `pnpm install` y usar:

- `pnpm dev` para desarrollo
- `pnpm lint` para revisar el código
- `pnpm format:check` para verificar el formato
- `pnpm test` para ejecutar pruebas
- `pnpm build` para validar la compilación

## Variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto de Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — clave pública (publishable) de Supabase.
- `WHATSAPP_NUMERO` — número de WhatsApp para el botón de cotización (solo dígitos, formato internacional). Mientras la tabla `configuracion_whatsapp` no exista, el botón usa esta variable; si no está definida, el botón no se muestra.

Copia `.env.example` a `.env.local` y completa los valores. Los archivos `.env*` locales no se suben al repositorio.

## Reglas de trabajo

- No agregar funcionalidades de negocio sin requisito y criterio de aceptación aprobados.
- No guardar secretos en el repositorio.
- No crear o modificar el esquema de datos fuera de migraciones versionadas.
- Mantener cambios pequeños, verificables y relacionados con la etapa actual.

El contexto y el plan completo están en `FUTURELIFE_NUEVA_APP_PLAN.md`.
