/**
 * Fecha y hora en Argentina, sin depender de la zona horaria del dispositivo.
 * Argentina no tiene horario de verano: siempre UTC−3.
 */
const AR_TZ = "America/Argentina/Buenos_Aires";

const FECHA = new Intl.DateTimeFormat("en-CA", { timeZone: AR_TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** Hoy en Argentina → 'YYYY-MM-DD'. */
export const hoyArgentinaISO = (ahora: Date = new Date()): string => FECHA.format(ahora);

/** 'YYYY-MM-DD' + 'HH:MM' (hora argentina) → instante real. */
export const instanteArgentina = (fecha: string, hhmm: string): Date => new Date(`${fecha}T${hhmm}:00-03:00`);

/** 'YYYY-MM-DD' + n días → 'YYYY-MM-DD'. */
export const sumarDiasISO = (iso: string, dias: number): string => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

/**
 * ¿Este turno todavía se puede reservar? Falso si ya pasó o si está a menos
 * de `minMinutos` del momento actual (la misma regla que aplica la base).
 */
export const turnoReservable = (fecha: string, hhmm: string, minMinutos: number, ahora: Date = new Date()): boolean =>
  instanteArgentina(fecha, hhmm).getTime() >= ahora.getTime() + Math.max(0, minMinutos) * 60_000;
