insert into public.colecciones (nombre, slug, descripcion, estado_publicacion) values
  ('Línea Raíces', 'linea-raices', 'Piezas que realzan la calidez de la madera natural para decorar el hogar.', 'activo'),
  ('Línea Hogar', 'linea-hogar', 'Muebles funcionales y duraderos para el día a día.', 'activo')
on conflict (slug) do nothing;
insert into public.categorias (nombre, slug, descripcion, activo) values
  ('Repisas', 'repisas', 'Repisas de madera para decorar y aprovechar los espacios.', true),
  ('Canastas', 'canastas', 'Canastas de fibra y madera para almacenamiento decorativo.', true),
  ('Cuadros', 'cuadros', 'Cuadros, marcos y piezas de arte en madera.', true),
  ('Puertas', 'puertas', 'Puertas interiores de madera elaboradas a medida.', true),
  ('Camas', 'camas', 'Camas de madera resistentes para descansar.', true),
  ('Mesas', 'mesas', 'Mesas de madera para comedor, sala y trabajo.', true),
  ('Armarios', 'armarios', 'Armarios y clósets de madera a medida.', true),
  ('Vinil', 'vinil', 'Vinil decorativo para interiores y letreros.', true),
  ('Otros', 'otros', 'Otros productos y trabajos artesanales en madera.', true)
on conflict (slug) do nothing;
insert into public.productos (
  codigo_interno, nombre, slug, descripcion,
  coleccion_id, categoria_id,
  tipo_producto, precio_base, controla_stock, stock_actual,
  materiales, medidas, colores_acabados, tiempo_elaboracion,
  estado_publicacion, destacado, mensaje_whatsapp, creado_en
) values
  (
    'FL-001', 'Repisa Colgante Natural', 'repisa-colgante-natural',
    'Repisa colgante en madera de pino laqueada, ideal para libros y plantas.',
    (select id from public.colecciones where slug = 'linea-raices'),
    (select id from public.categorias where slug = 'repisas'),
    'disponible', 25.00, true, 4,
    'Madera de pino laqueada', '60 x 20 x 15 cm', 'Natural, Nogal', '3 días',
    'activo', true, null, now() - interval '30 days'
  ),
  (
    'FL-002', 'Repisa Rústica Doble', 'repisa-rustica-doble',
    'Repisa rústica de dos niveles elaborada con madera reciclada.',
    (select id from public.colecciones where slug = 'linea-raices'),
    (select id from public.categorias where slug = 'repisas'),
    'disponible', 45.00, true, 0,
    'Madera reciclada', '90 x 25 x 15 cm', 'Natural, Café', '5 días',
    'activo', false, null, now() - interval '28 days'
  ),
  (
    'FL-003', 'Repisa Modular a Medida', 'repisa-modular-a-medida',
    'Sistema de repisas modulares fabricado a medida para cualquier espacio.',
    (select id from public.colecciones where slug = 'linea-raices'),
    (select id from public.categorias where slug = 'repisas'),
    'bajo_pedido', 80.00, false, 0,
    'Pino o cedro a elección', 'A medida', 'Varios', '7 días',
    'activo', false, null, now() - interval '25 days'
  ),
  (
    'FL-004', 'Canasta Decorativa', 'canasta-decorativa',
    'Canasta ligera de balsa y yute para almacenar y decorar.',
    (select id from public.colecciones where slug = 'linea-raices'),
    (select id from public.categorias where slug = 'canastas'),
    'disponible', 18.00, false, 0,
    'Madera de balsa y yute', '30 x 30 x 25 cm', 'Natural', '2 días',
    'activo', true, null, now() - interval '22 days'
  ),
  (
    'FL-005', 'Canasta de Mimbre con Tapa', 'canasta-mimbre-tapa',
    'Canasta tejida a mano en mimbre con tapa, perfecta para ropa o accesorios.',
    (select id from public.colecciones where slug = 'linea-raices'),
    (select id from public.categorias where slug = 'canastas'),
    'bajo_pedido', 35.00, false, 0,
    'Mimbre tejido a mano', '40 x 30 cm', 'Natural', '6 días',
    'activo', false, null, now() - interval '20 days'
  ),
  (
    'FL-006', 'Cuadro Paisaje Campo', 'cuadro-paisaje-campo',
    'Cuadro con marco de madera y lienzo impreso del paisaje Campo.',
    (select id from public.colecciones where slug = 'linea-raices'),
    (select id from public.categorias where slug = 'cuadros'),
    'personalizado', null, false, 0,
    'Marco de madera y lienzo', '50 x 40 cm', 'A elección', '8 días',
    'activo', false, 'Hola, me interesa el cuadro personalizado "Paisaje Campo". ¿Podrían cotizarlo?', now() - interval '18 days'
  ),
  (
    'FL-007', 'Marco de Espejo Ovalado', 'marco-espejo-ovalado',
    'Marco de espejo en madera torneada con acabado nogal.',
    (select id from public.colecciones where slug = 'linea-raices'),
    (select id from public.categorias where slug = 'cuadros'),
    'bajo_pedido', 40.00, false, 0,
    'Madera torneada', '60 x 40 cm', 'Nogal', '10 días',
    'activo', false, null, now() - interval '15 days'
  ),
  (
    'FL-008', 'Puerta Interior de Pino', 'puerta-interior-pino',
    'Puerta interior de pino macizo con acabado natural o laqueado.',
    (select id from public.colecciones where slug = 'linea-hogar'),
    (select id from public.categorias where slug = 'puertas'),
    'bajo_pedido', 120.00, false, 0,
    'Pino macizo', '2.00 x 0.70 m (a medida)', 'Natural, Laca', '10 a 12 días',
    'activo', false, null, now() - interval '13 days'
  ),
  (
    'FL-009', 'Puerta Lacada Doble', 'puerta-lacada-doble',
    'Puerta lacada de doble hoja fabricada a medida.',
    (select id from public.colecciones where slug = 'linea-hogar'),
    (select id from public.categorias where slug = 'puertas'),
    'personalizado', null, false, 0,
    'Tablero de madera y MDF', 'A medida', 'Blanco, Gris', '15 días',
    'activo', false, null, now() - interval '11 days'
  ),
  (
    'FL-010', 'Cama Queen Raíces', 'cama-queen-raices',
    'Cama queen elaborada en cedro con cabecera tallada.',
    (select id from public.colecciones where slug = 'linea-hogar'),
    (select id from public.categorias where slug = 'camas'),
    'personalizado', 350.00, false, 0,
    'Cedro', '1.60 x 2.00 m', 'Natural, Nogal', '20 días',
    'activo', true, null, now() - interval '9 days'
  ),
  (
    'FL-011', 'Mesa de Comedor Campestre', 'mesa-comedor-campestre',
    'Mesa de comedor en madera tornillo con tablero de pino.',
    (select id from public.colecciones where slug = 'linea-hogar'),
    (select id from public.categorias where slug = 'mesas'),
    'disponible', 280.00, false, 0,
    'Tornillo y pino', '1.80 x 1.00 m', 'Natural, Nogal', '12 días',
    'activo', true, null, now() - interval '7 days'
  ),
  (
    'FL-012', 'Mesa de Centro Doble Nivel', 'mesa-centro-doble',
    'Mesa de centro de dos niveles en pino reciclado.',
    (select id from public.colecciones where slug = 'linea-hogar'),
    (select id from public.categorias where slug = 'mesas'),
    'disponible', 90.00, false, 0,
    'Pino reciclado', '1.00 x 0.50 m', 'Café', '6 días',
    'activo', false, null, now() - interval '5 days'
  ),
  (
    'FL-013', 'Armario Empotrado a Medida', 'armario-empotrado-medida',
    'Armario empotrado fabricado a medida para aprovechar cada espacio.',
    (select id from public.colecciones where slug = 'linea-hogar'),
    (select id from public.categorias where slug = 'armarios'),
    'personalizado', null, false, 0,
    'Cedro y melamina', 'Espacio a medida', 'Blanco, Nogal', '25 días',
    'activo', false, null, now() - interval '3 days'
  ),
  (
    'FL-014', 'Vinil Decorativo para Interiores', 'vinil-decorativo-interiores',
    'Vinil autoadhesivo para decorar paredes y superficies con diversos diseños.',
    (select id from public.colecciones where slug = 'linea-raices'),
    (select id from public.categorias where slug = 'vinil'),
    'disponible', 12.00, false, 0,
    'Vinil autoadhesivo', 'Variable por rollo', 'Diversos diseños', '2 días',
    'activo', false, null, now() - interval '2 days'
  ),
  (
    'FL-015', 'Perchero de Pared', 'perchero-pared',
    'Perchero de pared en pino laqueado con tres ganchos.',
    null,
    (select id from public.categorias where slug = 'otros'),
    'disponible', 22.00, true, 6,
    'Pino laqueado', '40 x 12 cm', 'Natural, Nogal', '2 días',
    'activo', false, null, now()
  )
on conflict (codigo_interno) do nothing;
