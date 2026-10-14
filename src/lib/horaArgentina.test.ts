import { describe, it, expect } from "vitest";
import { hoyArgentinaISO, instanteArgentina, sumarDiasISO, turnoReservable } from "@/lib/horaArgentina";

/** Reservar "para hoy": la regla es en hora de Argentina, no del dispositivo. */
describe("hoyArgentinaISO", () => {
  it("a las 23:30 UTC todavía es el mismo día en Argentina (20:30)", () => {
    expect(hoyArgentinaISO(new Date("2026-10-14T23:30:00Z"))).toBe("2026-10-14");
  });
  it("a las 02:00 UTC ya es el día anterior en Argentina (23:00)", () => {
    expect(hoyArgentinaISO(new Date("2026-10-15T02:00:00Z"))).toBe("2026-10-14");
  });
});

describe("turnoReservable", () => {
  const ahora = instanteArgentina("2026-10-14", "18:00"); // 18:00 AR
  it("sin mínimo: cualquier turno futuro vale, uno pasado no", () => {
    expect(turnoReservable("2026-10-14", "20:00", 0, ahora)).toBe(true);
    expect(turnoReservable("2026-10-14", "18:30", 0, ahora)).toBe(true);
    expect(turnoReservable("2026-10-14", "17:30", 0, ahora)).toBe(false);
  });
  it("con 2 h de mínimo: 20:00 justo entra, 19:30 no", () => {
    expect(turnoReservable("2026-10-14", "20:00", 120, ahora)).toBe(true);
    expect(turnoReservable("2026-10-14", "19:30", 120, ahora)).toBe(false);
  });
  it("otro día siempre entra", () => {
    expect(turnoReservable("2026-10-15", "12:30", 120, ahora)).toBe(true);
  });
});

describe("sumarDiasISO", () => {
  it("cruza de mes", () => {
    expect(sumarDiasISO("2026-10-14", 30)).toBe("2026-11-13");
  });
});
