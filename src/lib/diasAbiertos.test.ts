import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({ supabase: {} }));
import { parseReservasDias, rangoDiasCorto, rangoDiasLargo, mensajeCerradoPedidos, DIAS_NOCHE_FALLBACK } from "@/lib/diasAbiertos";
import { parseMediodia, parseMenusMediodia, precioDesde } from "@/hooks/useMediodia";

/**
 * Días abiertos (reservas_dias) → etiquetas y mensajes de la web.
 * Lo importante: si en el dashboard abren el lunes, TODA la web lo refleja
 * (footer, /pedir, pedidos online, form de reservas) sin tocar código.
 */
describe("parseReservasDias", () => {
  const filas = [
    { dow: 0, mediodia: false, noche: false },
    { dow: 1, mediodia: false, noche: true },   // lunes a la noche (nuevo)
    { dow: 2, mediodia: false, noche: true },
    { dow: 3, mediodia: true, noche: true },
    { dow: 4, mediodia: false, noche: true },
    { dow: 5, mediodia: false, noche: true },
    { dow: 6, mediodia: true, noche: true },
  ];
  it("separa noche y mediodía; sin columna pedidos, pedidos = noche", () => {
    const d = parseReservasDias(filas);
    expect(d.noche).toEqual([1, 2, 3, 4, 5, 6]);
    expect(d.mediodia).toEqual([3, 6]);
    expect(d.pedidos).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it("con columna pedidos: el lunes abre el salón pero no toma pedidos", () => {
    const d = parseReservasDias(filas.map((f) => ({ ...f, pedidos: f.noche && f.dow !== 1 })));
    expect(d.noche).toEqual([1, 2, 3, 4, 5, 6]);
    expect(d.pedidos).toEqual([2, 3, 4, 5, 6]);
  });
  it("con columna pedidos en todo false, es una decisión: ningún día", () => {
    const d = parseReservasDias(filas.map((f) => ({ ...f, pedidos: false })));
    expect(d.pedidos).toEqual([]);
  });
  it("sin filas → fallback martes a sábado", () => {
    expect(parseReservasDias(null).noche).toEqual(DIAS_NOCHE_FALLBACK);
    expect(parseReservasDias([]).noche).toEqual(DIAS_NOCHE_FALLBACK);
  });
  it("todos los días sin noche → fallback (la web nunca queda sin horario)", () => {
    expect(parseReservasDias(filas.map((f) => ({ ...f, noche: false }))).noche).toEqual(DIAS_NOCHE_FALLBACK);
  });
});

describe("rangoDiasCorto / rangoDiasLargo", () => {
  it("tramo consecutivo", () => {
    expect(rangoDiasCorto([2, 3, 4, 5, 6])).toBe("Mar–Sáb");
    expect(rangoDiasCorto([1, 2, 3, 4, 5, 6])).toBe("Lun–Sáb");
    expect(rangoDiasLargo([1, 2, 3, 4, 5, 6])).toBe("lunes a sábado");
    expect(rangoDiasLargo([2, 3, 4, 5, 6], true)).toBe("Martes a sábado");
  });
  it("tramos sueltos", () => {
    expect(rangoDiasCorto([2, 4, 5, 6])).toBe("Mar, Jue–Sáb");
    expect(rangoDiasLargo([2, 4, 5])).toBe("martes, jueves y viernes");
    expect(rangoDiasCorto([3])).toBe("Mié");
  });
  it("domingo va último", () => {
    expect(rangoDiasCorto([0, 5, 6])).toBe("Vie–Dom");
  });
  it("vacío", () => {
    expect(rangoDiasCorto([])).toBe("");
    expect(rangoDiasLargo([])).toBe("");
  });
});

describe("mensajeCerrado (pedidos online)", () => {
  it("día sin pedidos online (aunque el salón abra)", () => {
    expect(mensajeCerradoPedidos(1, [2, 3, 4, 5, 6])).toBe("Hoy (lunes) no tomamos pedidos online.");
  });
  it("día que abre pero todavía no es la hora: arma los horarios con los días reales", () => {
    expect(mensajeCerradoPedidos(2, [2, 3, 4, 5, 6])).toBe(
      "Por ahora estamos cerrados. Tomamos pedidos martes a jueves de 19:30 a 00:00, y viernes y sábado de 19:30 a 01:00.",
    );
    expect(mensajeCerradoPedidos(1, [1, 2, 3, 4, 5, 6])).toBe(
      "Por ahora estamos cerrados. Tomamos pedidos lunes a jueves de 19:30 a 00:00, y viernes y sábado de 19:30 a 01:00.",
    );
  });
});

/** Sección Mediodías: qué se publica y qué no. */
describe("parseMediodia", () => {
  const base = {
    mediodia_activo: true,
    mediodia_overline: "昼のキク",
    mediodia_titulo: "Kiku",
    mediodia_titulo_accent: "Mediodía",
    mediodia_subtitulo: "Nuevo menú · Salón y Pick up",
    mediodia_descripcion: "Entrada, principal y bebida.",
    mediodia_dias_texto: "Martes a viernes de 12 a 16 hs",
    mediodia_nota_salon: "Servicio incluido.",
    mediodia_nota_pickup: "Retiro en local.",
    mediodia_imagenes: [{ url: "https://x/1.webp", alt: "Martes" }, { url: "", alt: "rota" }],
  };
  it("activa con fotos → config limpia (descarta fotos sin url)", () => {
    const m = parseMediodia(base);
    expect(m).not.toBeNull();
    expect(m!.imagenes).toHaveLength(1);
    expect(m!.titulo).toBe("Kiku");
    expect(m!.diasTexto).toBe("Martes a viernes de 12 a 16 hs");
  });
  it("apagada → null", () => {
    expect(parseMediodia({ ...base, mediodia_activo: false })).toBeNull();
  });
  it("sin fotos o sin días → null aunque esté activa", () => {
    expect(parseMediodia({ ...base, mediodia_imagenes: [] })).toBeNull();
    expect(parseMediodia({ ...base, mediodia_dias_texto: "  " })).toBeNull();
  });
  it("sin fila → null", () => {
    expect(parseMediodia(null)).toBeNull();
  });
});

describe("menús de mediodía (reservas_config)", () => {
  const crudo = [
    { id: "cocina", nombre: "Menú cocina", precio: 32000, detalle: ["Entrada", "", "Principal"], activo: true },
    { id: "sushi", nombre: "Menú sushi omakase", precio: 40000, activo: true },
    { id: "viejo", nombre: "Menú viejo", precio: 10000, activo: false },
    { nombre: "", precio: 5 },
    "basura",
  ];
  it("solo activos con nombre; detalle sin líneas vacías", () => {
    const m = parseMenusMediodia(crudo);
    expect(m.map((x) => x.id)).toEqual(["cocina", "sushi"]);
    expect(m[0].detalle).toEqual(["Entrada", "Principal"]);
    expect(m[1].detalle).toEqual([]);
  });
  it("precio desde = el menor publicado", () => {
    expect(precioDesde(parseMenusMediodia(crudo))).toBe(32000);
    expect(precioDesde([])).toBeNull();
  });
});
