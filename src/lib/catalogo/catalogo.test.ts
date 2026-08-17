import { describe, expect, it } from "vitest";

import { formatearPrecio } from "./precio";
import { obtenerEstadoDisponibilidad } from "./disponibilidad";
import { esOrdenValido } from "./opciones";
import {
  construirMensajeProducto,
  construirUrlWhatsApp,
  normalizarNumeroTelefono,
} from "./whatsapp";
import type { ProductoPublico } from "./tipos";

function crearProducto(parcial: Partial<ProductoPublico>): ProductoPublico {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    codigo_interno: "PR-001",
    nombre: "Repisa de madera",
    slug: "repisa-de-madera",
    descripcion: null,
    coleccion_id: null,
    categoria_id: null,
    tipo_producto: "disponible",
    precio_base: null,
    controla_stock: false,
    stock_actual: 0,
    materiales: null,
    medidas: null,
    colores_acabados: null,
    tiempo_elaboracion: null,
    estado_publicacion: "activo",
    destacado: false,
    mensaje_whatsapp: null,
    creado_en: "2026-01-01T00:00:00Z",
    actualizado_en: "2026-01-01T00:00:00Z",
    ...parcial,
  };
}

describe("whatsapp", () => {
  it("construye el mensaje por defecto con nombre y código", () => {
    const mensaje = construirMensajeProducto(crearProducto({}));

    expect(mensaje).toContain("Repisa de madera");
    expect(mensaje).toContain("PR-001");
  });

  it("usa el mensaje personalizado cuando existe", () => {
    const mensaje = construirMensajeProducto(
      crearProducto({ mensaje_whatsapp: "Cotiza esta pieza especial." }),
    );

    expect(mensaje).toBe("Cotiza esta pieza especial.");
  });

  it("codifica el mensaje en la URL de WhatsApp", () => {
    const url = construirUrlWhatsApp("593999999999", "Hola, producto A.");

    expect(url).toBe(`https://wa.me/593999999999?text=${encodeURIComponent("Hola, producto A.")}`);
    expect(url).toContain("593999999999");
  });

  it("devuelve null si el número está vacío o inválido", () => {
    expect(normalizarNumeroTelefono("")).toBeNull();
    expect(normalizarNumeroTelefono(null)).toBeNull();
    expect(normalizarNumeroTelefono(undefined)).toBeNull();
  });

  it("limpia el número conservando solo dígitos", () => {
    expect(normalizarNumeroTelefono("+593 999 999 999")).toBe("593999999999");
  });
});

describe("disponibilidad", () => {
  it("marca agotado cuando controla stock en cero", () => {
    const estado = obtenerEstadoDisponibilidad(
      crearProducto({ controla_stock: true, stock_actual: 0 }),
    );

    expect(estado.etiqueta).toBe("Agotado");
    expect(estado.disponible).toBe(false);
  });

  it("indica unidades restantes cuando controla stock", () => {
    const estado = obtenerEstadoDisponibilidad(
      crearProducto({ controla_stock: true, stock_actual: 3 }),
    );

    expect(estado.etiqueta).toBe("Disponible");
    expect(estado.detalle).toBe("Quedan 3 unidades");
  });

  it("distingue bajo pedido y personalizado", () => {
    expect(
      obtenerEstadoDisponibilidad(crearProducto({ tipo_producto: "bajo_pedido" })).etiqueta,
    ).toBe("Bajo pedido");
    expect(
      obtenerEstadoDisponibilidad(crearProducto({ tipo_producto: "personalizado" })).etiqueta,
    ).toBe("Personalizado");
  });
});

describe("opciones", () => {
  it("valida solo los ordenamientos disponibles", () => {
    expect(esOrdenValido("recientes")).toBe(true);
    expect(esOrdenValido("precio_desc")).toBe(true);
    expect(esOrdenValido("desconocido")).toBe(false);
    expect(esOrdenValido(undefined)).toBe(false);
  });
});

describe("configuracion", () => {
  it("formatea el precio en dólares", () => {
    expect(formatearPrecio(12.5)).toContain("12.50");
  });
});
