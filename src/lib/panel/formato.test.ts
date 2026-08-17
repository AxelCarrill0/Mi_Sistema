import { describe, expect, it } from "vitest";

import {
  formatearFechaCotizacion,
  formatearNumeroCotizacion,
  obtenerFechaVigencia,
} from "./formato";

describe("formato de cotización", () => {
  it("formatea el número correlativo", () => {
    expect(formatearNumeroCotizacion(1)).toBe("COT-0001");
    expect(formatearNumeroCotizacion(42)).toBe("COT-0042");
    expect(formatearNumeroCotizacion(9999)).toBe("COT-9999");
  });

  it("calcula la fecha de vigencia sumando días", () => {
    expect(obtenerFechaVigencia("2026-08-17T12:00:00Z", 15)).toBe("1/9/2026");
  });

  it("formatea la fecha de creación", () => {
    expect(formatearFechaCotizacion("2026-08-17T12:00:00Z")).toBe("17/8/2026");
  });
});
