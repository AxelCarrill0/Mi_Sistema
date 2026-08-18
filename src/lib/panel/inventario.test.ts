import { describe, expect, it } from "vitest";

import { normalizarCantidadMovimiento } from "./inventario-validacion";

describe("normalización de movimientos de inventario", () => {
  it("mantiene positiva una entrada", () => {
    expect(normalizarCantidadMovimiento("entrada", 8)).toBe(8);
  });

  it("convierte una salida visible positiva en una salida negativa", () => {
    expect(normalizarCantidadMovimiento("salida", 3)).toBe(-3);
    expect(normalizarCantidadMovimiento("salida", -3)).toBe(-3);
  });

  it("conserva el signo de un ajuste", () => {
    expect(normalizarCantidadMovimiento("ajuste", 4)).toBe(4);
    expect(normalizarCantidadMovimiento("ajuste", -4)).toBe(-4);
  });

  it("rechaza cero y cantidades no enteras", () => {
    expect(normalizarCantidadMovimiento("entrada", 0)).toBeNull();
    expect(normalizarCantidadMovimiento("salida", 1.5)).toBeNull();
  });
});
