# Sistema visual del proyecto

## Dirección aprobada

Este proyecto necesita una interfaz limpia, luminosa, contemporánea e intuitiva para un catálogo de muebles, artesanías y decoración para el hogar. La referencia principal es la claridad visual de un catálogo editorial moderno: el producto y sus fotografías son protagonistas, mientras que la decoración de la interfaz debe ser discreta.

Esta configuración es específica para este proyecto y tiene prioridad sobre cualquier dirección visual genérica del agente de diseño.

## Alcance

- Los cambios visuales no deben alterar lógica de negocio, consultas, Supabase, autenticación, permisos, rutas ni acciones del servidor.
- FutureLife es un nombre provisional. No construir un logotipo rígido ni una identidad que dependa demasiado de ese nombre.
- La navegación pública solo debe mostrar las secciones útiles para el visitante: Inicio, Catálogo y Colecciones.
- No mostrar «Nosotros», «Dashboard», «Acceso» ni botones administrativos en la experiencia pública.

## Sensación que debe transmitir

Calma, buen gusto, confianza, orden, cercanía y calidad artesanal contemporánea. Debe sentirse como una tienda de interiorismo bien editada, no como una plantilla de administración ni como una página rústica.

## Color

Usar una base blanca o casi blanca y acentos suaves, con contraste suficiente para accesibilidad:

- Fondo principal: blanco y blanco frío muy sutil.
- Superficies secundarias: gris verdoso muy claro.
- Acento principal: verde salvia sobrio.
- Acento secundario: azul grisáceo suave para bloques de producto y estados informativos.
- Texto principal: carbón casi negro.
- Texto secundario: gris pizarra.
- Bordes: gris verdoso tenue.
- Verde de WhatsApp: reservarlo para acciones de contacto, no usarlo como color general.

Evitar como dirección dominante: marrón oscuro, terracota, naranja quemado, crema amarillento, fondos con aspecto de papel y combinaciones de alto contraste que hagan que la interfaz se sienta pesada.

## Tipografía

- Preferir una sans-serif moderna y legible tanto para títulos como para texto.
- Manrope puede mantenerse si conserva una buena lectura, pero los titulares deben ser sans, firmes y contemporáneos.
- No usar Fraunces ni otra serif como tipografía dominante del sitio público.
- La personalidad debe venir de la composición, las fotografías, los espacios y los acentos de color; no de una tipografía ornamental.

## Composición pública

- Encabezado blanco, ligero y claro, con navegación centrada o alineada con una retícula consistente.
- Hero de dos columnas: mensaje breve y específico a la izquierda; fotografía real del producto o ambiente a la derecha.
- Mantener una retícula de máximo aproximadamente 72rem, con espacios amplios pero sin dejar zonas vacías sin propósito.
- Usar secciones editoriales alternadas: destacados, categorías/colecciones, una llamada a cotizar y una selección de piezas.
- Los botones deben ser claros, compactos y con jerarquía: un primario y uno secundario, sin exceso de pastillas.
- El diseño debe responder bien en móvil y conservar la prioridad del catálogo.

## Productos y colecciones

- Las imágenes deben aparecer antes que el texto y tener proporciones consistentes.
- Usar tarjetas ligeras, con borde fino o superficie suave; evitar sombras pesadas, marcos decorativos y demasiadas esquinas redondeadas.
- El nombre, tipo y precio (si la configuración pública lo permite) deben leerse rápidamente.
- Las colecciones deben ser visuales y fotográficas, no grandes rectángulos vacíos.
- Resolver estados de imagen faltante con un placeholder limpio y deliberado, nunca con un bloque gris accidental o texto alternativo flotando.
- Mantener estados claros para carga, vacío, error, hover, foco y producto desactivado.

## Firma visual

La firma será una combinación de fotografía de producto, campos de color salvia/azul grisáceo, líneas finas y una retícula editorial. No repetir anillos de árbol, círculos decorativos ni ornamentos como recurso principal. Un detalle gráfico pequeño puede aparecer de forma puntual, pero nunca dominar el hero, la navegación y los títulos a la vez.

## Panel administrativo

El panel debe ser un espacio de trabajo independiente del catálogo público:

- Base clara y funcional.
- No usar barra lateral. Usar un encabezado horizontal de dos niveles: identidad y cuenta arriba; navegación agrupada por Catálogo, Comercial y Sistema debajo.
- El encabezado público y el pie público no deben renderizarse dentro de `/panel`.
- El estado activo de cada sección debe ser evidente mediante color y una línea inferior, sin depender de iconos decorativos.
- Tablas, formularios, alertas y acciones priorizadas por claridad.
- Menos decoración que el sitio público y más densidad útil.
- No usar el hero editorial ni adornos de marca para resolver tareas administrativas.

## Patrones ya implementados

- Catálogo: encabezado editorial con contexto, nota de orientación, explorador de filtros en una superficie separada y resultados debajo.
- Colecciones: tarjetas de dos niveles con una pieza visual abstracta arriba, etiqueta de curaduría, descripción y llamada a explorar.
- Panel: navegación horizontal agrupada, tarjetas métricas con una línea de acento y listas/tablas con estrategia de profundidad basada en bordes y superficies.
- Público y panel comparten tokens, pero no comparten el marco de navegación: cada experiencia mantiene su propia jerarquía.

## Reglas de implementación

- Antes de añadir un componente visual, comprobar si ya existe uno reutilizable.
- Preferir tokens de color, espaciado, radio y sombra en lugar de valores aislados.
- Mantener estados de foco visibles y contraste suficiente.
- No introducir gradientes llamativos, glassmorphism, neón, exceso de animación ni componentes que parezcan de una plantilla genérica.
- No cambiar nombres de campos, contratos de datos, permisos, rutas o comportamiento de botones durante un rediseño visual.
- Verificar después de cada tanda: lint, formato, pruebas y build.
