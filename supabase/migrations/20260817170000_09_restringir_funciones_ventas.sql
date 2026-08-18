-- Las funciones de gestión comercial son internas y nunca deben estar
-- disponibles para visitantes anónimos mediante la Data API.
revoke execute on function public.convertir_pedido_en_venta(uuid, uuid, text) from public, anon;
revoke execute on function public.registrar_venta_directa(uuid, text, text, text, text, text, jsonb, numeric, text, text, uuid) from public, anon;

grant execute on function public.convertir_pedido_en_venta(uuid, uuid, text) to authenticated;
grant execute on function public.registrar_venta_directa(uuid, text, text, text, text, text, jsonb, numeric, text, text, uuid) to authenticated;
