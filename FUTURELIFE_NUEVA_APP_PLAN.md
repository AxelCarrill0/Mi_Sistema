# FutureLife — Contexto y Plan Maestro para la Nueva Aplicación

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

**Colecciones**: agrupaciones comerciales y visuales para explorar el catálogo. Ejemplos iniciales sugeridos:

- Decoración en madera
- Organización y almacenamiento
- Cuadros y arte personalizado
- Muebles para el hogar
- Proyectos especiales

**Categorías**: clasificación administrativa y operativa de productos. Ejemplos:

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

### Datos esperados de producto

- Nombre
- Código interno único
- Descripción comercial
- Colección y categoría
- Tipo de producto
- Precio base o indicador de “cotizar”
- Stock, si aplica
- Materiales
- Medidas
- Colores/acabados
- Tiempo estimado de elaboración
- Estado de publicación: borrador, activo, archivado
- Imágenes ordenadas
- Destacado
- Mensaje de WhatsApp personalizado opcional

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
└── Ventas

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
- Una cotización aceptada puede convertirse en pedido.
- Un pedido puede pasar a producción, listo, entregado o cancelado.
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

**Salida:** documento de requisitos aprobado; no construir base de datos antes de esto.

### Etapa 2 — Modelo de datos y flujos

Diseñar diagrama de entidades, relaciones, restricciones, estados, permisos y los flujos de cotización, pedido, producción, entrega, venta, pago e inventario.

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

**Salida:** pantallas y navegación aprobadas.

### Etapa 4 — Base técnica

Configurar Next.js con TypeScript y la estructura por módulos. Configurar Supabase local/remoto, variables de entorno, clientes de Supabase, manejo de errores, validación y sistema visual inicial.

**Salida:** base técnica limpia sin lógica de negocio improvisada.

### Etapa 5 — Supabase seguro

Crear migraciones, tablas, índices, restricciones, RLS, buckets, políticas de Storage y administrador inicial. Verificar con pruebas de acceso público, acceso autenticado y acceso no autorizado.

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

### Etapa 7 — MVP de panel administrativo

Implementar login privado, resumen básico, gestión de productos, colecciones, categorías, imágenes, clientes y configuración de WhatsApp.

**Salida:** el catálogo se administra sin tocar código ni editar tablas manualmente.

### Etapa 8 — Gestión comercial

Implementar cotizaciones, productos personalizados, pedidos, historial de estados, anticipos/pagos y conversión segura a venta.

**Salida:** se puede registrar el ciclo comercial completo.

### Etapa 9 — Inventario y reportes

Implementar movimientos de stock, alertas de stock bajo, producción, reportes básicos y métricas comerciales.

**Salida:** el panel refleja la operación real del negocio.

### Etapa 10 — Calidad, pruebas y seguridad final

Probar roles, RLS, formularios, operaciones simultáneas de inventario, estados, imágenes, WhatsApp, diseño móvil, errores de red, accesibilidad y rendimiento.

**Salida:** no hay fallos bloqueantes ni accesos indebidos conocidos.

### Etapa 11 — Despliegue y operación

Crear entorno de producción, configurar variables, dominio, administrador real, respaldo, monitoreo, carga de productos reales y guía de operación.

**Salida:** sistema listo para usar y recuperar ante errores.

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

Comenzar por la **Etapa 1 — Requisitos y alcance**.

La siguiente conversación debe comenzar solicitando o construyendo un documento de requisitos que responda, como mínimo:

- Qué información debe tener cada tipo de producto.
- Qué colecciones y categorías reales usará FutureLife.
- Qué acciones debe realizar un administrador.
- Cómo se cotiza un producto disponible, bajo pedido o personalizado.
- Cómo se manejarán anticipos y pagos.
- Cuándo se descuenta stock.
- Qué reportes son útiles.
- Qué queda explícitamente fuera del MVP.

No crear base de datos, interfaces ni código hasta que estas respuestas estén acordadas.
