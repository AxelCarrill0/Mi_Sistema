# Etapa 10 — Calidad, pruebas y seguridad final

## Estado

Etapa completada el 18 de agosto de 2026. La revisión automática y la validación manual con usuarios autenticados no encontraron fallos bloqueantes ni accesos indebidos conocidos.

## Cambios aplicados

- Se normalizó la cantidad de movimientos manuales: entradas positivas, salidas negativas y ajustes con signo explícito.
- Se agregó una validación compartida y cuatro pruebas unitarias para los movimientos de inventario.
- Se protegieron los pagos para que cada registro pertenezca exclusivamente a un pedido o a una venta.
- Se corrigieron datos remotos que tenían simultáneamente `pedido_id` y `venta_id`.
- Se agregó una restricción y un trigger de base de datos para mantener la consistencia de pagos aunque el cliente envíe datos manipulados.
- Se fuerza el perfil autenticado en las tablas de auditoría mediante triggers; el `p_perfil_id` recibido por RPC no puede suplantar al usuario de la sesión.
- Se agregaron índices para claves foráneas usadas por relaciones y auditoría.
- Se eliminaron políticas de lectura autenticada duplicadas en la configuración pública.
- Se deshabilitó el registro abierto en `supabase/config.toml`; el ajuste remoto de Auth debe confirmarse en el panel del proyecto.

Migraciones aplicadas en Supabase remoto:

- `20260818034016_etapa_10_seguridad_inventario`
- `20260818034118_etapa_10_politicas_configuracion`
- `20260818034658_etapa_10_indices_claves_foraneas`

## Evidencia automatizada

| Verificación                   | Resultado                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `tsc --noEmit`                 | Correcto                                                                                                  |
| ESLint                         | Correcto                                                                                                  |
| Prettier                       | Correcto                                                                                                  |
| `next build`                   | Correcto; 27 rutas generadas                                                                              |
| Vitest                         | 3 archivos, 21 pruebas correctas                                                                          |
| `git diff --check`             | Correcto; solo avisos de conversión de fin de línea de Git                                                |
| Tablas públicas sin RLS        | 0 de 19                                                                                                   |
| Pagos con origen inválido      | 0                                                                                                         |
| Movimientos con signo inválido | 0                                                                                                         |
| Advisor de rendimiento         | Sin claves foráneas sin índice; quedan avisos informativos de índices aún no usados por el volumen actual |

## Revisión manual completada

- [x] Iniciar sesión con un administrador y verificar lectura/escritura completa del panel.
- [x] Iniciar sesión con un operador y confirmar el acceso autorizado al panel.
- [x] Confirmar desde una sesión anónima que las tablas privadas no devuelven registros.
- [x] Probar operaciones de inventario y confirmar que el stock mantiene sus invariantes.
- [x] Recorrer transiciones de pedidos y producción.
- [x] Subir, cambiar, eliminar y visualizar imágenes en formatos permitidos.
- [x] Verificar configuración de WhatsApp, URL generada y comportamiento sin número configurado.
- [x] Revisar las rutas principales en móvil, teclado, foco visible, etiquetas de formularios y mensajes de error.
- [x] Simular errores de red y confirmar que la interfaz informa el problema.
- [x] Revisar tiempos de carga y consola del navegador en las rutas principales.

## Riesgos conocidos antes de producción

- El advisor de seguridad mantiene cinco avisos intencionales sobre funciones `SECURITY DEFINER` expuestas a usuarios autenticados. Son las RPC atómicas de ventas, inventario y producción; validan el rol administrativo dentro de la función y no deben invocarse desde el cliente sin sesión.
- El proyecto remoto mantiene desactivada la protección de contraseñas filtradas. Activarla desde Supabase Auth antes de producción, sujeto al plan del proyecto.
- La protección contra contraseñas filtradas queda pendiente por la limitación del plan Free de Supabase; debe activarse al cambiar a un plan compatible.
