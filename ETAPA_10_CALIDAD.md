# Etapa 10 — Calidad, pruebas y seguridad final

## Estado

Avance de la etapa realizado el 18 de agosto de 2026. La revisión automática no encontró errores de TypeScript ni fallos en la suite unitaria. La validación completa con usuarios autenticados y dispositivos reales queda como paso previo al cierre definitivo de la etapa.

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

| Verificación | Resultado |
| --- | --- |
| `tsc --noEmit` | Correcto |
| Vitest | 3 archivos, 21 pruebas correctas |
| `git diff --check` | Correcto; solo avisos de conversión de fin de línea de Git |
| Tablas públicas sin RLS | 0 de 19 |
| Pagos con origen inválido | 0 |
| Movimientos con signo inválido | 0 |
| Advisor de rendimiento | Sin claves foráneas sin índice; quedan avisos informativos de índices aún no usados por el volumen actual |

## Revisión manual pendiente

- [ ] Iniciar sesión con un administrador y verificar lectura/escritura completa del panel.
- [ ] Iniciar sesión con un operador y confirmar que no puede administrar usuarios ni acceder a tablas fuera de su alcance.
- [ ] Confirmar desde una sesión anónima que las tablas privadas no devuelven registros.
- [ ] Probar dos operaciones simultáneas sobre el mismo producto y confirmar que el stock no queda negativo ni se pierde un movimiento.
- [ ] Recorrer transiciones de pedidos y producción, incluyendo estados inválidos, cancelación y finalización.
- [ ] Subir, cambiar, eliminar y visualizar imágenes en formatos permitidos; comprobar rechazo de tamaño y tipo no permitido.
- [ ] Verificar configuración de WhatsApp, URL generada y comportamiento cuando no existe número configurado.
- [ ] Revisar las rutas principales en móvil, teclado, foco visible, etiquetas de formularios y mensajes de error.
- [ ] Simular desconexión o error 5xx y confirmar que la interfaz informa el problema sin perder datos del formulario.
- [ ] Revisar tiempos de carga y consola del navegador en catálogo, panel, inventario y documentos imprimibles.

## Riesgos conocidos antes de producción

- El advisor de seguridad mantiene cinco avisos intencionales sobre funciones `SECURITY DEFINER` expuestas a usuarios autenticados. Son las RPC atómicas de ventas, inventario y producción; validan el rol administrativo dentro de la función y no deben invocarse desde el cliente sin sesión.
- El proyecto remoto mantiene desactivada la protección de contraseñas filtradas. Activarla desde Supabase Auth antes de producción, sujeto al plan del proyecto.
- La suite automatizada cubre lógica pura y formato; las pruebas con roles, concurrencia y navegador requieren cuentas de prueba y un entorno autenticado.
