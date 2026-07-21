import { describe, it, expect, vi } from "vitest";

// El form importa @/lib/supabase, que tira si faltan las env vars. Como acá solo
// probamos funciones puras, lo mockeamos para que el módulo cargue.
vi.mock("@/lib/supabase", () => ({ supabase: {} }));
vi.mock("@/hooks/useOmakasePrecio", () => ({
  useOmakasePrecio: () => 70000,
  formatPesos: (n: number) => `$${Number(n || 0).toLocaleString("es-AR")}`,
}));
import {
  diasToLabel,
  mapEspecial,
  diasAbiertosDe,
  horariosDeFecha,
  type EspecialRow,
} from "@/components/kiku-v2/ReservationFormV2";

/**
 * Lógica pura del form de reservas dinámico. Cubre lo que no se puede ver a ojo:
 *  - que un especial mapee bien a una card de experiencia,
 *  - qué días abren según la config,
 *  - qué horarios ofrece cada fecha (mediodía solo los días con mediodía).
 *
 * Fechas de referencia (todas a mediodía, sin líos de timezone):
 *   2026-07-15 = miércoles (mediodía + noche en el seed)
 *   2026-07-14 = martes    (solo noche)
 *   2026-07-18 = sábado    (mediodía + noche)
 *   2026-07-13 = lunes     (cerrado)
 */

const cfg = {
  mediodia: ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00"],
  noche: ["20:00", "20:30", "21:00", "21:30", "22:00"],
  orden: ["22:30", "23:00"],
};

// Seed real de reservas_dias: noche mar–sáb, mediodía miércoles + sábado.
const diasCfg = {
  0: { mediodia: false, noche: false }, // Dom
  1: { mediodia: false, noche: false }, // Lun
  2: { mediodia: false, noche: true },  // Mar
  3: { mediodia: true, noche: true },   // Mié
  4: { mediodia: false, noche: true },  // Jue
  5: { mediodia: false, noche: true },  // Vie
  6: { mediodia: true, noche: true },   // Sáb
};

const FALLBACK_HORAS = ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"];
const FALLBACK_DIAS = [2, 3, 4, 5, 6];

describe("diasAbiertosDe", () => {
  it("devuelve los días con alguna franja habilitada", () => {
    expect(diasAbiertosDe(diasCfg, FALLBACK_DIAS)).toEqual([2, 3, 4, 5, 6]);
  });
  it("cae al fallback si no hay config", () => {
    expect(diasAbiertosDe(null, FALLBACK_DIAS)).toEqual(FALLBACK_DIAS);
  });
  it("incluye el domingo si se habilita", () => {
    const conDomingo = { ...diasCfg, 0: { mediodia: true, noche: false } };
    expect(diasAbiertosDe(conDomingo, FALLBACK_DIAS)).toContain(0);
  });
});

describe("horariosDeFecha", () => {
  it("miércoles (mediodía + noche): junta ambas franjas, ordenadas", () => {
    const h = horariosDeFecha(cfg, diasCfg, "2026-07-15", FALLBACK_HORAS);
    expect(h[0]).toBe("12:30"); // arranca al mediodía
    expect(h).toContain("13:00");
    expect(h).toContain("20:00");
    expect(h).toContain("23:00");
    // ordenado cronológicamente
    expect(h).toEqual([...h].sort());
  });

  it("martes (solo noche): no muestra turnos de mediodía", () => {
    const h = horariosDeFecha(cfg, diasCfg, "2026-07-14", FALLBACK_HORAS);
    expect(h).not.toContain("12:30");
    expect(h).not.toContain("13:00");
    expect(h).toContain("20:00");
    expect(h).toContain("22:30");
  });

  it("sábado: también tiene mediodía", () => {
    const h = horariosDeFecha(cfg, diasCfg, "2026-07-18", FALLBACK_HORAS);
    expect(h).toContain("12:30");
    expect(h).toContain("20:00");
  });

  it("lunes (cerrado): sin horarios", () => {
    expect(horariosDeFecha(cfg, diasCfg, "2026-07-13", FALLBACK_HORAS)).toEqual([]);
  });

  it("cae al fallback si falta config", () => {
    expect(horariosDeFecha(null, null, "2026-07-15", FALLBACK_HORAS)).toEqual(FALLBACK_HORAS);
  });
});

describe("mapEspecial", () => {
  const row: EspecialRow = {
    experiencia: "ramen_del_mes",
    titulo: "Ramen",
    titulo_acento: "de Kiku",
    overline: "ラーメン",
    descripcion: "Caldo de 12 horas.",
    precio: 18000,
    precio_nota: "por persona",
    dias: [3, 6],
    cta_tipo: "reservar",
  };

  it("arma label, badge en pesos y días", () => {
    const e = mapEspecial(row);
    expect(e.id).toBe("ramen_del_mes");
    expect(e.label).toBe("Ramen de Kiku");
    expect(e.badge).toBe("$18.000 por persona");
    expect(e.dias).toEqual([3, 6]);
  });

  it("sin precio no pone badge", () => {
    expect(mapEspecial({ ...row, precio: null }).badge).toBeUndefined();
    expect(mapEspecial({ ...row, precio: 0 }).badge).toBeUndefined();
  });

  it("sin días queda 'Según disponibilidad'", () => {
    expect(mapEspecial({ ...row, dias: [] }).diasLabel).toBe("Según disponibilidad");
  });
});

describe("diasToLabel", () => {
  it("un día → nombre completo", () => {
    expect(diasToLabel([2])).toBe("Martes");
  });
  it("varios días → abreviados en orden Lun→Dom", () => {
    expect(diasToLabel([6, 3])).toBe("mié, sáb");
  });
  it("vacío → según disponibilidad", () => {
    expect(diasToLabel([])).toBe("Según disponibilidad");
  });
});
