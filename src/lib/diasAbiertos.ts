import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Días en que abre el local, leídos de `reservas_dias` (dow 0=Dom..6=Sáb,
 * con las franjas `mediodia` y `noche`). Se editan desde el dashboard en
 * Configuración → Reservas y son LA fuente para toda la web: el form de
 * reservas, los pedidos online, el horario del footer y de /pedir.
 *
 * Si la base no responde, se usa el horario histórico (martes a sábado de
 * noche) para que la web nunca quede sin horarios.
 */

export const DIAS_NOCHE_FALLBACK = [2, 3, 4, 5, 6];
export const DIAS_MEDIODIA_FALLBACK: number[] = [];

export interface DiasAbiertos {
  /** Días con turno noche en el salón (reservas, horario del footer). */
  noche: number[];
  /** Días con turno mediodía. */
  mediodia: number[];
  /**
   * Días en que se toman pedidos online (delivery y take away). Es
   * independiente de `noche`: el lunes abre el salón pero no hay delivery.
   */
  pedidos: number[];
}

export interface ReservasDiaRow {
  dow: number;
  mediodia: boolean | null;
  noche: boolean | null;
  /** Puede faltar si la base todavía no tiene la columna: se asume = noche. */
  pedidos?: boolean | null;
}

/** Filas de reservas_dias → listas de días por franja. Sin filas → fallback. */
export const parseReservasDias = (rows: ReservasDiaRow[] | null | undefined): DiasAbiertos => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { noche: [...DIAS_NOCHE_FALLBACK], mediodia: [...DIAS_MEDIODIA_FALLBACK], pedidos: [...DIAS_NOCHE_FALLBACK] };
  }
  const noche = rows.filter((r) => r.noche).map((r) => Number(r.dow)).sort();
  const mediodia = rows.filter((r) => r.mediodia).map((r) => Number(r.dow)).sort();
  const nocheFinal = noche.length ? noche : [...DIAS_NOCHE_FALLBACK];
  // Sin la columna (base vieja) → pedidos = noche. Con la columna, lo que diga,
  // aunque sea ningún día (eso es una decisión, no un error).
  const tieneColumna = rows.some((r) => r.pedidos !== undefined && r.pedidos !== null);
  const pedidos = tieneColumna
    ? rows.filter((r) => r.pedidos).map((r) => Number(r.dow)).sort()
    : [...nocheFinal];
  return { noche: nocheFinal, mediodia, pedidos };
};

// Orden humano de la semana: lunes primero, domingo último.
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];
const CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const LARGOS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** Agrupa los días en tramos consecutivos (en orden lunes→domingo). */
const tramos = (dias: number[]): number[][] => {
  const set = new Set(dias);
  const out: number[][] = [];
  let actual: number[] = [];
  for (const d of ORDEN_SEMANA) {
    if (set.has(d)) {
      actual.push(d);
    } else if (actual.length) {
      out.push(actual);
      actual = [];
    }
  }
  if (actual.length) out.push(actual);
  return out;
};

/**
 * Etiqueta corta de días: [2,3,4,5,6] → "Mar–Sáb" · [1,2,3,4,5,6] → "Lun–Sáb"
 * · [2,4,5,6] → "Mar, Jue–Sáb" · [3] → "Mié". Vacío → "".
 */
export const rangoDiasCorto = (dias: number[]): string =>
  tramos(dias)
    .map((t) => (t.length >= 3 ? `${CORTOS[t[0]]}–${CORTOS[t[t.length - 1]]}` : t.map((d) => CORTOS[d]).join(", ")))
    .join(", ");

/**
 * Etiqueta larga para una oración: [2,3,4,5,6] → "martes a sábado" ·
 * [1,2,3,4,5,6] → "lunes a sábado" · [2,4,5] → "martes, jueves y viernes".
 * Con `capitalizar` la primera letra va en mayúscula.
 */
export const rangoDiasLargo = (dias: number[], capitalizar = false): string => {
  // Tramos de 3+ días → "martes a jueves"; los sueltos van uno por uno.
  const partes = tramos(dias).flatMap((t) =>
    t.length >= 3 ? [`${LARGOS[t[0]]} a ${LARGOS[t[t.length - 1]]}`] : t.map((d) => LARGOS[d]),
  );
  let s = "";
  if (partes.length <= 1) s = partes[0] ?? "";
  else s = `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
  return capitalizar && s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
};

/**
 * Mensaje de "cerrado" para los pedidos online, armado con los días reales.
 * Los días con pedidos se toman de 19:30 a 00:00; viernes y sábado hasta la
 * 01:00.
 */
export const mensajeCerradoPedidos = (dow: number, diasPedidos: number[]): string => {
  if (!diasPedidos.includes(dow)) return `Hoy (${LARGOS[dow]}) no tomamos pedidos online.`;
  const cortos = diasPedidos.filter((d) => d !== 5 && d !== 6);
  const largos = diasPedidos.filter((d) => d === 5 || d === 6);
  const partes: string[] = [];
  if (cortos.length) partes.push(`${rangoDiasLargo(cortos)} de 19:30 a 00:00`);
  if (largos.length) partes.push(`${rangoDiasLargo(largos)} de 19:30 a 01:00`);
  return `Por ahora estamos cerrados. Tomamos pedidos ${partes.join(", y ")}.`;
};

/** Hook: días abiertos desde Supabase, con fallback mientras carga o si falla. */
export function useDiasAbiertos(): DiasAbiertos & { cargado: boolean } {
  const [dias, setDias] = useState<DiasAbiertos>(() => parseReservasDias(null));
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase
      .from("reservas_dias")
      .select("dow,mediodia,noche,pedidos")
      .then(({ data, error }) => {
        if (!alive) return;
        if (!error && Array.isArray(data)) {
          setDias(parseReservasDias(data as ReservasDiaRow[]));
          setCargado(true);
          return;
        }
        // Base sin la columna `pedidos` todavía: pedimos sin ella.
        supabase
          .from("reservas_dias")
          .select("dow,mediodia,noche")
          .then(({ data: d2, error: e2 }) => {
            if (!alive) return;
            if (!e2 && Array.isArray(d2)) setDias(parseReservasDias(d2 as ReservasDiaRow[]));
            setCargado(true);
          });
      });
    return () => { alive = false; };
  }, []);

  return { ...dias, cargado };
}
