# FutureLife — Contexto y Plan Maestro para la Nueva Aplicación

> **Nota:** “FutureLife” es un nombre provisional de trabajo. El nombre comercial definitivo se definirá más adelante y podrá sustituirse en la aplicación, documentación y configuración pública sin cambiar el modelo técnico.

> Documento de inicio para una nueva conversación y un nuevo proyecto.  
> Estado: planificación aprobada; **no iniciar código de producción sin completar la Etapa 1**.

## 1. Contexto del negocio

FutureLife es un negocio familiar orientado principalmente a artículos de madera y decoración. Sus productos incluyen repisas, canastas y objetos decorativos; en menor medida, productos grandes como puertas, camas y muebles. Próximamente se contempla ofrecer cuadros personalizados en vinil y otros materiales.

La aplicación **no será una tienda con pago directo en línea** en su primera versión. Su objetivo comercial es:

1. Mostrar un catálogo atractivo y profesional.
2. Permitir al cliente explorar productos, colecciones y detalles.
3. Llevar al cliente a WhatsApp mediante un botón de cotización con un mensaje preparado según el producto.
4. Permitir que el administrador gestione catálogo, clientes, cotizaciones, pedidos, inventario y ventas.

Flujo comercial objetivo:

```text
Catálogo público → WhatsApp → Cotización → Pedido → Producción/preparación → Entrega → Venta/pago
```

## 2. Decisiones ya tomadas

### Arquitectura

```text
Frontend: Next.js + TypeScript + App Router
Backend: Supabase
Base de datos: PostgreSQL de Supabase
Autenticación: Supabase Auth
Imágenes: Supabase Storage
Operaciones sensibles: funciones SQL / Edge Functions de Supabase
Despliegue inicial: Vercel
Canal de contacto y cotización: WhatsApp
```

No se usará Python, Django, FastAPI, Render, Railway ni una máquina virtual en esta nueva aplicación.

Supabase se utilizará como Backend-as-a-Service: base de datos, autenticación, almacenamiento, API y seguridad. No se implementará un servidor backend propio en la primera versión.

### Alcance de acceso

- El catálogo será público y no requerirá cuenta.
- No habrá registro público de usuarios.
- El acceso administrativo será privado y no se mostrará como acción principal para los visitantes.
- Inicialmente existirá un único administrador. La estructura debe permitir agregar un rol de operador más adelante.
- El login puede existir como ruta privada, por ejemplo `/panel/login`, pero no debe destacarse en la navegación pública.

### Consideraciones de despliegue

- Vercel es la plataforma elegida inicialmente por su integración con Next.js.
- Antes del lanzamiento comercial oficial se deben revisar las condiciones vigentes del plan gratuito de Vercel, ya que el plan Hobby puede estar restringido a uso personal/no comercial.
- Supabase Free puede pausar proyectos con actividad baja; debe asumirse como una limitación de la etapa gratuita y verificarse antes de publicar.

## 3. Qué se aprendió del proyecto Django anterior

El proyecto anterior funcionaba como una aplicación Django con catálogo público y panel administrativo en el mismo proyecto. Esa idea base era válida, pero se decidió reiniciar para definir mejor el negocio y la arquitectura desde el inicio.

Hallazgos que no se deben repetir:

- Rutas administrativas protegidas solo por login y no por roles/permisos.
- Operaciones que modifican datos mediante GET.
- Validación de cantidades solo en la interfaz, sin control robusto del servidor/base de datos.
- Conversión parcial de pedidos a ventas, dejando inventario o ventas inconsistentes.
- Falta de transacciones en operaciones de stock.
- Credenciales o secretos en código.
- `ALLOWED_HOSTS` y configuración de producción demasiado permisivos.
- Dependencias sin versiones fijadas.
- Pruebas automatizadas ausentes.
- Categorías del modelo no alineadas con las colecciones mostradas al cliente.
- Imágenes externas poco confiables para el catálogo.
- Problemas de codificación UTF-8.

## 4. Principios obligatorios de calidad

Toda IA o persona que trabaje en el proyecto debe seguir estas reglas:

1. No crear código antes de conocer el requisito y criterio de aceptación.
2. No crear archivos sin propósito concreto, importación o uso previsto.
3. No instalar dependencias sin justificar su necesidad.
4. Usar TypeScript en modo estricto; no usar `any` salvo justificación excepcional documentada.
5. Mantener componentes pequeños, reutilizables y con una sola responsabilidad.
6. Organizar por funcionalidad de negocio, no como una acumulación de archivos genéricos.
7. Validar toda entrada del usuario en el cliente y en el límite seguro del backend.
8. No confiar en la interfaz para controlar permisos, precios, stock o estados.
9. Nunca exponer claves privadas de Supabase ni `service_role` en el navegador.
10. Activar RLS en toda tabla expuesta por Supabase y definir políticas explícitas.
11. Crear el esquema mediante migraciones versionadas; no depender de cambios manuales invisibles en el panel web.
12. Implementar primero operaciones completas y verificables, no pantallas decorativas sin lógica.
13. Escribir pruebas para reglas de negocio críticas y flujos sensibles.
14. No eliminar información comercial relevante; preferir archivado/desactivación e historial.
15. Documentar decisiones de arquitectura, variables de entorno y procesos de despliegue.

## 5. Modelo de negocio objetivo

### Diferenciar correctamente los conceptos

**Colecciones**: agrupaciones comerciales y visuales para explorar el catálogo. Colecciones iniciales:

- Decoración en madera
- Organización y almacenamiento
- Cuadros y arte personalizado
- Muebles para el hogar
- Proyectos especiales

**Categorías**: clasificación administrativa y operativa de productos. Categorías iniciales:

- Repisas
- Canastas
- Cuadros
- Puertas
- Camas
- Mesas
- Armarios
- Vinil
- Otros

**Tipo de producto**:

- Disponible: tiene stock y puede venderse/prepararse de inmediato.
- Bajo pedido: se fabrica o consigue después de confirmar.
- Personalizado: requiere medidas, diseño, material, referencia u otras decisiones del cliente.

### Estado de publicación

El estado de publicación es independiente del tipo de producto:

- Activo/disponible: el producto aparece en la página pública.
- Desactivado: el producto deja de aparecer públicamente, pero permanece en el sistema para conservar su historial.

El administrador podrá cambiar este estado al crear o editar un producto en cualquier momento.

### Datos esperados de producto

- Nombre
- Código interno único
- Descripción comercial
- Colección y categoría
- Tipo de producto
- Precio base editable o indicador de “cotizar”
- Stock, si aplica
- Materiales
- Medidas
- Colores/acabados
- Tiempo estimado de elaboración
- Estado de publicación: borrador, activo, archivado
- Imágenes ordenadas
- Destacado
- Mensaje de WhatsApp personalizado opcional

Los precios nunca serán valores fijos. El administrador podrá modificarlos al editar el producto y también podrá establecer un precio diferente al preparar una cotización o registrar una venta.

La configuración del negocio permitirá decidir si los precios se muestran en el catálogo público. La configuración inicial prevista es ocultarlos y priorizar el botón de cotización hacia WhatsApp.

## 6. Módulos previstos

```text
Catálogo
├── Colecciones
├── Categorías
├── Productos
├── Materiales / variantes
└── Imágenes

Gestión comercial
├── Clientes
├── Cotizaciones
├── Pedidos
├── Pagos
├── Ventas
└── Facturación

Operación
├── Inventario
├── Movimientos de stock
├── Producción
└── Historial de estados

Sistema
├── Usuarios y roles
├── Configuración de negocio
├── Configuración de WhatsApp
└── Auditoría básica
```

## 7. Reglas de negocio esenciales

- Colección y categoría no son lo mismo.
- Un producto personalizado no se maneja igual que un producto con stock.
- El inventario se altera solo mediante movimientos registrados.
- Una venta o conversión de pedido debe ser atómica: se completa por entero o no se realiza.
- Nunca se debe crear una venta parcial involuntaria ni descontar inventario incompleto.
- Una cotización generada desde el panel puede convertirse en pedido.
- El contacto inicial desde WhatsApp no creará automáticamente una cotización dentro del sistema.
- Para casos extensos, el administrador podrá seleccionar productos, ajustar precios y generar una cotización profesional como archivo/documento.
- Un pedido puede pasar a producción, listo, entregado o cancelado.
- Registrar un pedido no descuenta stock.
- El stock se descuenta únicamente al registrar la venta, normalmente cuando el pedido se marca como cumplido/finalizado y se convierte en venta.
- Los pedidos podrán registrar opcionalmente un abono recibido; el sistema no solicitará pagos ni anticipos desde el catálogo público.
- Cada cambio importante debe conservar fecha, responsable y estado anterior/nuevo cuando sea relevante.
- Clientes, productos y datos comerciales deben archivarse antes que borrarse, si ya tienen historial relacionado.

Estados iniciales:

```text
Cotización:
Nueva → En conversación → Enviada → Aceptada / Rechazada / Vencida

Pedido:
Pendiente → Confirmado → En producción → Listo → Entregado / Cancelado
```

## 8. Seguridad de Supabase

- Usar Supabase Auth únicamente para administradores/operadores; no habilitar registro público.
- Mantener una tabla de perfiles/roles separada y segura.
- Habilitar RLS en cada tabla del esquema `public` que sea expuesta.
- Las políticas deben permitir al público leer exclusivamente productos, colecciones e imágenes publicadas.
- El administrador autenticado podrá gestionar datos según su rol.
- Los datos de clientes, cotizaciones, ventas, pagos e inventario nunca deben ser públicos.
- La lógica de inventario, conversión de estados y pagos debe ejecutarse mediante operaciones transaccionales seguras, no mediante múltiples cambios independientes desde el navegador.
- Para Storage: imágenes de catálogo pueden ser públicas; referencias o archivos privados de clientes deben ir en buckets privados con políticas adecuadas.

## 9. Plan por etapas

### Etapa 0 — Preparación

Crear el nuevo repositorio, configurar Git, documentación inicial, convenciones, TypeScript estricto, formateo, linting, pruebas y variables de entorno. No crear funcionalidad de negocio aún.

**Salida:** proyecto base limpio, documentado y verificable.

### Etapa 1 — Requisitos y alcance

Entrevistar/definir el funcionamiento real del negocio. Redactar historias de usuario, reglas, estados, prioridades y criterios de aceptación. Distinguir MVP de funcionalidades futuras.

Requisitos confirmados durante esta etapa:

- Productos iniciales: repisas, canastas, cuadros, puertas, camas, mesas, armarios, vinil y otros.
- El administrador podrá activar o desactivar productos desde su creación y edición. Los productos desactivados no aparecerán en el catálogo público.
- El contacto inicial por WhatsApp no se guardará automáticamente como cotización.
- El panel podrá generar cotizaciones profesionales para casos extensos, seleccionando productos y permitiendo ajustar precios.
- La visibilidad de precios en el catálogo será configurable; inicialmente se prevé ocultarlos.
- Los pedidos podrán registrar un abono opcional como referencia administrativa, sin solicitarlo desde la página pública.
- Registrar un pedido no modifica el stock. El stock se descuenta al registrar la venta.
- Los precios de los productos serán editables y no quedarán fijos de forma irreversible.
- Las ventas deberán permitir generar la documentación de facturación correspondiente, considerando los requisitos vigentes de Ecuador, que se verificarán antes de implementar.

La decisión de colecciones y categorías se definirá en esta etapa tomando como base la separación comercial/administrativa del documento y evitando clasificaciones innecesarias.

**Salida:** documento de requisitos aprobado; no construir base de datos antes de esto.

### Etapa 2 — Modelo de datos y flujos

Diseñar diagrama de entidades, relaciones, restricciones, estados, permisos y los flujos de cotización, pedido, producción, entrega, venta, pago e inventario.

#### Convención de idioma y nombres

- La estructura del proyecto, tablas, columnas, estados y documentación de negocio se trabajará principalmente en español.
- Las tablas y columnas usarán nombres descriptivos en español y formato `snake_case`.
- Los nombres técnicos propios de Next.js, TypeScript, Supabase y sus APIs conservarán su denominación oficial cuando corresponda.
- Los valores históricos de precios, estados, pagos y movimientos no se sobrescribirán.

#### Modelo de datos aprobado

Catálogo:

- `colecciones`
- `categorias`
- `productos`
- `imagenes_producto`
- `materiales_producto`

Usuarios y seguridad:

- `perfiles`
- `roles`
- `registro_auditoria`

Gestión comercial:

- `clientes`
- `cotizaciones`
- `detalles_cotizacion`
- `pedidos`
- `detalles_pedido`
- `historial_estados_pedido`
- `pagos`
- `ventas`
- `detalles_venta`
- `facturas`

Operación:

- `movimientos_inventario`
- `producciones`
- `historial_estados_produccion`

Configuración:

- `configuracion_negocio`
- `configuracion_whatsapp`

Relaciones principales:

```text
colecciones 1 ──── N productos
categorias   1 ──── N productos
productos    1 ──── N imagenes_producto
productos    1 ──── N materiales_producto
cotizaciones 1 ──── N detalles_cotizacion
pedidos      1 ──── N detalles_pedido
pedidos      1 ──── N historial_estados_pedido
ventas       1 ──── N detalles_venta
pedidos      0..1 ── 1 ventas
productos    1 ──── N movimientos_inventario
```

Reglas de flujo aprobadas:

- WhatsApp no crea automáticamente una cotización.
- Una cotización extensa puede crearse desde el panel y convertirse en pedido.
- Registrar un pedido no modifica el inventario.
- Registrar una venta descuenta el inventario mediante movimientos registrados.
- La conversión de pedido a venta y el descuento de inventario deben ejecutarse en una transacción atómica.
- Los precios usados en cotizaciones, pedidos y ventas se guardan como valores históricos independientes del precio actual del producto.
- Los abonos son opcionales y se registran manualmente.
- Los productos desactivados no aparecen en el catálogo público.

#### Lista inicial de migraciones planificadas

1. Extensiones y tipos controlados del sistema.
2. Perfiles, roles y permisos administrativos.
3. Colecciones, categorías y productos.
4. Imágenes y materiales de productos.
5. Clientes, cotizaciones y detalles de cotización.
6. Pedidos, detalles e historial de estados.
7. Pagos, ventas y detalles de venta.
8. Inventario, movimientos y producción.
9. Facturas y datos de facturación.
10. Configuración del negocio y WhatsApp.
11. Auditoría, índices, restricciones y políticas RLS.

La creación de estas estructuras se realizará posteriormente mediante migraciones versionadas y no mediante cambios manuales en el panel de Supabase.

**Salida:** modelo de datos aprobado y lista de migraciones planificada.

### Etapa 3 — UX e información

Definir mapa de navegación, wireframes, estados vacíos, errores, carga, versión móvil y acciones de cada pantalla.

Sitio público:

```text
Inicio → Catálogo → Colecciones → Detalle de producto → WhatsApp
```

Panel:

```text
Login → Resumen → Productos / Clientes / Cotizaciones / Pedidos / Inventario
```

#### UX aprobada

Sitio público:

- Inicio.
- Catálogo con búsqueda, filtros y ordenamiento.
- Colecciones y productos de cada colección.
- Categorías y productos de cada categoría.
- Detalle del producto con galería, descripción, materiales, medidas, precio configurable y botón de WhatsApp.
- Estados para carga, errores, producto no encontrado, producto desactivado y ausencia de resultados.

Panel administrativo:

- Login privado.
- Resumen con pedidos pendientes, productos activos, stock bajo y ventas recientes.
- Productos, colecciones, categorías e imágenes.
- Clientes, cotizaciones, pedidos, producción, inventario, ventas y facturación.
- Configuración del negocio, WhatsApp y visibilidad de precios.
- Auditoría.

Estados de interfaz obligatorios:

- Cargando.
- Sin resultados.
- Error de conexión.
- Formulario incompleto.
- Operación exitosa.
- Operación no permitida.
- Confirmación antes de desactivar, cancelar, registrar una venta o modificar inventario.

La experiencia será responsive. El catálogo priorizará imágenes y WhatsApp; el panel funcionará en computadora y teléfono, usando tablas adaptables, tarjetas o desplazamiento horizontal cuando sea necesario.

**Salida:** pantallas y navegación aprobadas.

### Etapa 4 — Base técnica

Configurar Next.js con TypeScript y la estructura por módulos. Configurar Supabase remoto, variables de entorno, clientes de Supabase, manejo de errores, validación y sistema visual inicial.

Avance realizado:

- Proyecto remoto de Supabase conectado mediante la CLI.
- Proyecto interno actual: `Mi_Sistema`; el nombre comercial de la aplicación sigue siendo provisional.
- Supabase configurado como dependencia del proyecto.
- Clientes de Supabase para navegador y servidor creados con `@supabase/ssr`.
- Variables locales configuradas sin exponer claves privadas al navegador.
- El esquema público remoto se encuentra vacío y sin alertas de seguridad.
- Docker queda como requisito opcional para levantar una instancia local de Supabase; no es necesario para trabajar contra el proyecto remoto.

**Salida:** base técnica limpia sin lógica de negocio improvisada.

### Etapa 5 — Supabase seguro

Crear migraciones, tablas, índices, restricciones, RLS, buckets, políticas de Storage y administrador inicial. Verificar con pruebas de acceso público, acceso autenticado y acceso no autorizado.

Avance realizado:

- Migración `01_seguridad_base_y_catalogo` aplicada al proyecto remoto y registrada en su historial.
- Migración `02_optimizar_politicas_rls_catalogo` aplicada al proyecto remoto y registrada en su historial.
- Tablas creadas: `perfiles`, `colecciones`, `categorias`, `productos` e `imagenes_producto`.
- Todas las tablas tienen RLS habilitado.
- El catálogo público solo puede leer registros publicados/activos.
- La gestión interna requiere un perfil autenticado con rol de administrador u operador activo.
- Se agregaron restricciones para precios no negativos, stock no negativo, tipos de producto y estados de publicación.
- Los índices iniciales fueron creados para relaciones, orden de imágenes y consultas del catálogo.
- Bucket público `catalogo` creado para imágenes del catálogo, limitado a imágenes JPEG, PNG, WebP y AVIF de hasta 5 MB.
- Storage permite lectura pública, pero solo usuarios administrativos autenticados pueden subir, modificar o eliminar imágenes.
- Administrador inicial creado y asociado al perfil `administrador` activo.
- Las verificaciones de RLS y Storage no reportan alertas.
- La prueba con el rol público confirmó que puede consultar el catálogo sin acceder a funciones administrativas.
- Los avisos actuales son únicamente informativos sobre índices todavía no utilizados porque las tablas están vacías.

Migraciones remotas sincronizadas localmente en `supabase/migrations`.

La protección contra contraseñas filtradas de Supabase Auth no está disponible en el plan Free actual; se documenta como limitación del entorno. Se aplicarán contraseñas fuertes y MFA cuando corresponda, y se reevaluará esta función al cambiar de plan.

Pendiente dentro de esta etapa: completar la prueba de escritura no autorizada.

**Salida:** backend seguro y versionado.

### Etapa 6 — MVP de catálogo público

Implementar inicio, catálogo, filtros, colecciones, búsqueda, detalle de producto, galería y botón de WhatsApp con mensaje predefinido.

Ejemplo de mensaje:

```text
Hola, quisiera cotizar el producto: [nombre].
Código: [código].
¿Podrían indicarme precio, disponibilidad y tiempo de elaboración?
```

**Salida:** cliente puede encontrar un producto y solicitar una cotización.

Avance realizado:

- Catálogo público implementado con Next.js App Router, TypeScript estricto y Supabase.
- Inicio con productos destacados; vista de colecciones; listados por colección y por categoría con filtros y ordenamiento.
- Búsqueda server-side con `ilike` escapando caracteres especiales y con límite de longitud; reconstrucción válida de parámetros al cambiar filtros, orden o búsqueda.
- Detalle de producto con galería de imágenes (selector con miniaturas y contador), disponibilidad (stock, bajo pedido y personalizado), precio configurable, especificaciones (materiales, medidas, acabados y tiempo de elaboración) y mensaje personalizado por producto.
- Botón de cotización por WhatsApp con mensaje predefinido; número provisto por la variable de entorno `WHATSAPP_NUMERO` y preparado para reemplazarla por la tabla `configuracion_whatsapp` cuando exista. Si no hay número configurado, el botón se oculta.
- Capa de consultas tipadas con los tipos generados de Supabase; lecturas anónimas restringidas a registros publicados/activos.
- Migración `05_semilla_catalogo_inicial` aplicada al proyecto remoto: 2 colecciones, 9 categorías y 15 productos iniciales (sin imágenes) para probar el catálogo en vivo; se refinarán desde la Etapa 7.
- Pruebas unitarias (vitest) para mensaje y URL de WhatsApp, disponibilidad, ordenamiento y formato de precios.
- Verificaciones completadas: `pnpm lint`, `pnpm format:check`, `pnpm test` (10 pruebas) y `pnpm build` en verde; pruebas de humo de las rutas públicas con respuestas 200/404 según corresponda.

### Etapa 7 — MVP de panel administrativo

Implementar login privado, resumen básico, gestión de productos, colecciones, categorías, imágenes, clientes, configuración de WhatsApp, visibilidad de precios y generación de cotizaciones profesionales para casos extensos.

**Salida:** el catálogo se administra sin tocar código ni editar tablas manualmente.

Avance realizado (subetapas 7.1 y 7.2):

- Middleware de sesión (`src/middleware.ts`): refresca la sesión con `@supabase/ssr`; redirige a `/panel/ingreso` las rutas `/panel/*` sin sesión y evita que un usuario autenticado vea el formulario de ingreso.
- `src/lib/panel/autorizacion.ts`: verifica en el servidor que el usuario tenga un perfil activo con rol `administrador` u `operador` (lectura de su propio perfil permitida por RLS).
- `src/app/panel/ingreso`: formulario de ingreso con Supabase Auth (email y contraseña), manejo de errores, estado de carga y respeto del parámetro `siguiente` restringido a rutas `/panel`.
- `src/app/panel/(panel)`: ruta de grupo protegida; `EncabezadoPanel` con identidad del usuario y cierre de sesión.
- `src/app/panel` (7.2): resumen con conteos de productos activos, borradores, desactivados, colecciones y categorías, además de la lista de productos activos con stock bajo (umbral 5). Se consulta con `count=exact` y la consulta de stock bajo está limitada y ordenada por existencias.
- (7.3) Gestión de colecciones y categorías: listados en el panel con estado, creación, edición y activación/desactivación mediante acciones de servidor tipadas; slug generado automáticamente y único; validación de obligatorios y longitud; `revalidatePath` de todo el sitio tras guardar.
- (7.4) Gestión de productos: listado con código, nombre, tipo, colección/categoría, stock o precio, destacado y estado; formulario de creación/edición con colección y categoría seleccionables, tipo de producto, estado de publicación, precio, stock con regla de coherencia (`controla_stock` fuerza `stock_actual=0` si no controla), materiales, medidas, acabados, tiempo de elaboración, destacado y mensaje de WhatsApp; validación de obligatorios, rangos numéricos, código interno único y slugs únicos.
- (7.5) Imágenes de producto: se suben desde la página "Editar producto" del panel usando la sesión autenticada (bucket `catalogo` ya creado en la migración 03, con RLS y límite de 5 MB en JPG/PNG/WEBP/AVIF); la primera imagen se marca principal, se puede cambiar la principal y eliminar imágenes (borrando también el objeto del bucket y reasignando la principal si se eliminó); el catálogo público muestra las imágenes al instante (`revalidatePath`).
- (7.6) Configuración: migración 06 con las tablas `configuracion_negocio` y `configuracion_whatsapp` (fila única `id=1`, RLS lectura pública + escritura administrativa); página `/panel/configuracion` para editar nombre del negocio, visibilidad de precios públicos, número de WhatsApp y mensaje predeterminado; el catálogo y el botón de WhatsApp leen ahora de la BD (el número conserva `WHATSAPP_NUMERO` como respaldo si la BD está vacío). La función pura de normalización de teléfono se prueba con Vitest.
- (7.7) Clientes: migración 07 con la tabla `clientes` (nombres, identificación, teléfono, correo, dirección y notas), sin lectura pública (solo administrativa); páginas de listado, creación y edición con validación de correo e identificación.
- (7.8) Cotizaciones: migración 07 con las tablas `cotizaciones` (número correlativo por secuencia, cliente opcional con datos de respaldo, estado, vigencia y observaciones) y `cotizaciones_detalle` (líneas con producto opcional o descripción libre, cantidad y precio); formulario con líneas dinámicas que autocompletan producto y precio; documento profesional imprimible (nombre del negocio, datos del cliente, líneas, totales y vigencia) con impresión vía `@media print` y cambio de estado. Helpers de formato (número, fechas) probados con Vitest.

**Etapa 7 completada (7.1–7.8).**

### Etapa 8 — Gestión comercial

Implementar productos personalizados, pedidos, historial de estados, registro opcional de abonos, conversión segura a venta y generación de la documentación de facturación aplicable en Ecuador.

**Salida:** se puede registrar el ciclo comercial completo.

#### Subdivisión aprobada

- **8.1** — Diseño funcional y modelo de datos.
- **8.2** — Migración 08: `pedidos`, `detalles_pedido`, `historial_estados_pedido`, `pagos`, `ventas`, `detalles_venta` + RLS administrativa + secuencias + funciones atómicas.
- **8.3** — Pedidos en el panel: crear (desde cotización aceptada o en blanco), listar y ver detalle.
- **8.4** — Historial de estados: transiciones con registro de responsable y fecha.
- **8.5** — Abonos opcionales: registro manual de abono y cálculo de saldo en pedido y venta.
- **8.6** — Ventas: módulo CRUD propio + conversión automática de pedido entregado a venta (transacción atómica).
- **8.7** — Documentación de facturación: verificación de requisitos de Ecuador y documento imprimible de venta.

#### Decisiones de diseño (8.1)

Estados de pedido simplificados (aprobado):

```text
pendiente → entregado / cancelado
```

- Al pasar un pedido a `entregado`, se genera automáticamente la venta (transacción atómica en BD, función `public.convertir_pedido_en_venta`), que también descuenta el stock de los productos que controlan inventario y traslada los abonos registrados del pedido a la venta.
- Al pasar a `cancelado`, no se genera venta.
- Cada transición de estado queda registrada en `historial_estados_pedido` (estado anterior, estado nuevo, responsable y fecha).

Ventas (aprobado), dos formas:

1. Automática: un pedido `entregado` genera la venta.
2. Manual: módulo propio de Ventas en el panel (crear, listar, ver y editar) con líneas dinámicas; el registro de una venta manual descuenta stock de forma atómica vía `public.registrar_venta`.

Reglas:

- Los precios se guardan como valores históricos en las líneas (independientes del precio actual del producto).
- Los abonos son opcionales, se registran manualmente y no se solicitan desde el sitio público; quedan en `pagos` (referencia a pedido o venta). Saldo = total − abonos.
- Las líneas de una venta no se editan después de creada para no dejar inventario inconsistente; la edición de venta cubre datos del cliente, observaciones y abonos.
- Productos personalizados: el tipo `personalizado` ya existe en `productos` (Etapa 7.4) y se maneja con línea de descripción libre en pedidos y ventas.
- Los movimientos de inventario formalizados (`movimientos_inventario`) y la UI de inventario se implementan en la Etapa 9; en la Etapa 8 el descuento atómico actúa directo sobre `productos.stock_actual`.

Modelo de datos (8.1):

```text
cotizaciones      1 ──── N detalles_cotizacion      (existente)
pedidos           1 ──── N detalles_pedido
pedidos           1 ──── N historial_estados_pedido
pedidos           0..1 ── 1 ventas                  (pedido_id único en ventas)
ventas            1 ──── N detalles_venta
pedidos/ventas    1 ──── N pagos                    (abonos opcionales)
```

**Etapa 8 completada (8.1–8.7).**

- **8.1** Diseño funcional y modelo de datos aprobado.
- **8.2** Migración `20260817150000_08_gestion_comercial_pedidos_y_ventas.sql` aplicada en Supabase remoto y sincronizada localmente; tipos TypeScript generados.
- **8.3** Módulo de Pedidos en panel (`/panel/pedidos`): listado con filtros por estado, creación (en blanco o precargando cotización `?cotizacion_id=...`), y vista detallada.
- **8.4** Historial de estados de pedidos (`historial_estados_pedido`): transiciones con registro de usuario responsable, fecha y motivo; modal interactivo con validación de stock y advertencia de conversión.
- **8.5** Abonos opcionales (`pagos`): componente reusable `SeccionAbonos`, registro de abono con método de pago y referencia, y cálculo en tiempo real de saldo pendiente en pedidos y ventas.
- **8.6** Módulo de Ventas en panel (`/panel/ventas`): conversión atómica de pedidos entregados a ventas vía `public.convertir_pedido_en_venta` con descuento de stock, registro de venta directa en mostrador vía `public.registrar_venta_directa`, y métricas comerciales integradas en el resumen del panel.
- **8.7** Facturación para Ecuador: componente `DocumentoVenta` con formato fiscal/comercial, datos de cliente (RUC/Cédula, dirección, teléfono), desglose de ítems, subtotal, IVA, total en USD,`@media print`.

### Etapa 9 — Inventario y reportes

Implementar movimientos de stock, descuento de inventario al registrar la venta, alertas de stock bajo, producción y únicamente los reportes básicos necesarios para la operación.

**Salida:** el panel refleja la operación real del negocio.

#### Subdivisión aprobada

- **9.1** — Diseño funcional y modelo de datos.
- **9.2** — Migración 10: `movimientos_inventario`, `producciones`, `historial_estados_produccion` + RLS administrativa + secuencias + funciones atómicas.
- **9.3** — Movimientos de inventario: registrar entrada/salida/ajuste (función atómica) y registrar movimientos en los descuentos de venta existentes (`convertir_pedido_en_venta`, `registrar_venta_directa`).
- **9.4** — Producción: órdenes de producción en el panel (crear, listar, detalle e historial); al completar entra stock.
- **9.5** — Alertas de stock bajo: umbral configurable y listado.
- **9.6** — Reportes básicos: ventas por período y top de productos vendidos.

#### Decisiones de diseño (9.1)

Estados de producción simplificados (aprobado):

```text
activa → completada / cancelada
```

- Una orden de producción activa fabrica `cantidad` unidades de un producto.
- Al completar la orden, el stock del producto se incrementa de forma atómica y se registra un movimiento de tipo `produccion`.
- Cancelar la orden no modifica el stock.
- Cada transición queda en `historial_estados_produccion` (estado anterior, nuevo, responsable y fecha).

Movimientos de inventario:

- Tipos: `entrada`, `salida`, `ajuste` y `produccion`.
- El movimiento registra producto, cantidad con signo (negativa reduce stock), stock resultante, origen (`venta`, `pedido`, `produccion`, `manual`), referencias opcionales (venta/pedido/producción), responsable y fecha.
- Toda modificación de stock pasa por la función atómica `public.registrar_movimiento_inventario`, que valida que el producto controle stock y que el stock resultante no sea negativo.
- Las funciones de venta existentes se amplían para insertar un movimiento de `salida` por línea que descuenta stock.
- Un producto con `controla_stock = false` no admite movimientos de inventario.

Alertas de stock bajo:

- Umbral configurable (`umbral_stock_bajo` en `configuracion_negocio`, valor por defecto 5), editable en Configuración.
- Se muestran en el resumen y en la página de inventario los productos activos con stock ≤ umbral.

Reportes (9.6, aprobado):

- Filtro por rango de fechas.
- Ventas por período: total de ventas, total abonado, saldo pendiente y número de ventas.
- Top de productos más vendidos por cantidad y total en el rango.

Modelo de datos (9.1):

```text
productos    1 ──── N movimientos_inventario
productos    1 ──── N producciones
producciones 1 ──── N historial_estados_produccion
```

Tablas nuevas: `movimientos_inventario`, `producciones`, `historial_estados_produccion`. Todas privadas (RLS solo administrativa) y versionadas por migración.

**Etapa 9 completada (9.1–9.6).** Migración 10 aplicada; página unificada `/panel/inventario` con secciones Movimientos, Stock bajo y Producción (detalle y creación bajo `/panel/inventario/produccion`); `/panel/reportes`; umbral de stock bajo configurable en Configuración; movimientos de entrada/salida/ajuste por función atómica; las ventas descuentan stock con trazabilidad; completar una producción ingresa stock atómicamente. Verificada con `pnpm lint`, `pnpm format:check`, `pnpm test` y `pnpm build`.

### Etapa 10 — Calidad, pruebas y seguridad final

Probar roles, RLS, formularios, operaciones simultáneas de inventario, estados, imágenes, WhatsApp, diseño móvil, errores de red, accesibilidad y rendimiento.

**Salida:** no hay fallos bloqueantes ni accesos indebidos conocidos.

**Etapa 10 completada (10.1–10.9).** Se aplicaron las migraciones `etapa_10_seguridad_inventario`, `etapa_10_politicas_configuracion` y `etapa_10_indices_claves_foraneas`; se corrigieron inconsistencias de pagos, validaciones de inventario y auditoría; las 19 tablas públicas remotas tienen RLS; y pasan ESLint, Prettier, TypeScript, Vitest (21 pruebas) y `next build` (27 rutas). La validación manual de roles, inventario, estados, imágenes, WhatsApp, móvil, accesibilidad, red y rendimiento quedó registrada en `ETAPA_10_CALIDAD.md`.

### Etapa 11 — Despliegue y operación

Crear entorno de producción, configurar variables, dominio, administrador real, respaldo, monitoreo, carga de productos reales y guía de operación.

**Salida:** sistema listo para usar y recuperar ante errores.

**Avance de la etapa:** se preparó el endpoint `/api/health`, se documentaron las variables, el flujo de publicación, la verificación posterior, rollback y operación en `ETAPA_11_DESPLIEGUE.md`. Falta ejecutar la publicación en la cuenta Vercel del propietario, configurar el dominio y cargar los datos reales.

## 10. MVP y alcance futuro

### MVP obligatorio

- Catálogo público
- Colecciones, categorías y productos
- Imágenes de productos
- WhatsApp con mensaje predefinido
- Login administrativo privado
- Gestión de productos
- Gestión de clientes
- Cotizaciones
- Pedidos
- Control básico de inventario
- Generación de cotizaciones profesionales desde el panel para casos extensos
- Registro opcional de abonos en pedidos
- Generación de documentación de facturación de las ventas, sujeta a validación de los requisitos vigentes en Ecuador
- Seguridad RLS

### Posterior al MVP

- Pagos detallados y comprobantes
- Reportes avanzados
- Notificaciones automáticas
- Integración formal con WhatsApp Business API
- Aplicación móvil
- Comercio electrónico/pagos en línea, solo si el negocio lo requiere
- Múltiples operadores y permisos más granulares

## 11. Forma de trabajo con IA

Para cada etapa, la IA debe:

1. Confirmar el objetivo de la etapa.
2. Revisar el contexto y los archivos existentes antes de sugerir o cambiar código.
3. Proponer el diseño y esperar aprobación cuando la decisión afecte negocio, datos o experiencia.
4. Implementar por módulos pequeños y completos.
5. No mezclar refactorizaciones no relacionadas.
6. Ejecutar verificaciones y pruebas proporcionadas por el proyecto.
7. Explicar qué se cambió, qué se verificó y qué queda pendiente.
8. Mantener el repositorio limpio; no dejar archivos temporales, código muerto, secretos o dependencias inútiles.
9. Versionar cada cambio de base de datos mediante migraciones.
10. Revisar políticas RLS y almacenamiento cada vez que se agreguen datos sensibles.

## 12. Próximo paso exacto

Las etapas 0 a 10 han sido completadas con éxito. El siguiente trabajo funcional es comenzar la **Etapa 11 — Despliegue y operación**:

- Probar roles y permisos (administrador y operador), RLS y acceso a tablas privadas.
- Probar formularios, operaciones simultáneas de inventario, estados de pedidos y producción.
- Validar diseño móvil, accesibilidad, errores de red y rendimiento.
- Revisión final de seguridad (políticas RLS, almacenamiento, secretos).
