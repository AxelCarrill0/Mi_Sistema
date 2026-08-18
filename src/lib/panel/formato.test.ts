import { describe, expect, it } from "vitest";

import {
  formatearFechaCotizacion,
  formatearMonedaUSD,
  formatearNumeroCotizacion,
  formatearNumeroPedido,
  formatearNumeroProduccion,
  formatearNumeroVenta,
  obtenerFechaVigencia,
} from "./formato";

describe("formato comercial", () => {
  it("formatea el número de cotización", () => {
    expect(formatearNumeroCotizacion(1)).toBe("COT-0001");
    expect(formatearNumeroCotizacion(42)).toBe("COT-0042");
    expect(formatearNumeroCotizacion(9999)).toBe("COT-9999");
  });

  it("formatea el número de pedido", () => {
    expect(formatearNumeroPedido(1)).toBe("PED-0001");
    expect(formatearNumeroPedido(7)).toBe("PED-0007");
  });

  it("formatea el número de venta", () => {
    expect(formatearNumeroVenta(1)).toBe("VTA-0001");
    expect(formatearNumeroVenta(150)).toBe("VTA-0150");
  });

  it("formatea el número de producción", () => {
    expect(formatearNumeroProduccion(1)).toBe("PRD-0001");
    expect(formatearNumeroProduccion(9)).toBe("PRD-0009");
  });

  it("calcula la fecha de vigencia sumando días", () => {
    expect(obtenerFechaVigencia("2026-08-17T12:00:00Z", 15)).toBe("1/9/2026");
  });

  it("formatea la fecha de creación", () => {
    expect(formatearFechaCotizacion("2026-08-17T12:00:00Z")).toBe("17/8/2026");
  });

  it("formatea montos en USD", () => {
    const formatted = formatearMonedaUSD(45.5);
    expect(formatted).toContain("45,50");
  });
});
