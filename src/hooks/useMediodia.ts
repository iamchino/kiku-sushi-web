import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Sección "Mediodías": el menú de mediodía del mes. Se administra desde el
// dashboard (/menu → tab "Mediodías") en web_config (fila única id=1):
// textos, fotos del menú y visibilidad.
//
// Los menús (nombre, precio, qué incluye) y los días con turno de mediodía
// NO viven acá: salen de reservas_config.menus_mediodia y reservas_dias
// (Configuración → Reservas), igual que en el form de reservas. Una sola
// fuente para la página, el home y el form.
//
// Como en "Nuevo", no hay fallback hardcodeado: si la sección está apagada o
// no tiene fotos, la web no la muestra (ni el link del header).

export interface MediodiaImagen {
  url: string;
  alt: string;
}

export interface MediodiaConfig {
  overline: string;
  titulo: string;
  tituloAccent: string;
  subtitulo: string;
  descripcion: string;
  diasTexto: string;
  notaSalon: string;
  notaPickup: string;
  /** 1 a 12 fotos, en orden. La primera es la portada. */
  imagenes: MediodiaImagen[];
}

export interface MenuMediodia {
  id: string;
  nombre: string;
  /** null = sin precio publicado. */
  precio: number | null;
  detalle: string[];
}

export interface UseMediodiaResult {
  /** null mientras carga, si la sección está apagada o si está incompleta. */
  mediodia: MediodiaConfig | null;
  /** Menús activos de Configuración → Reservas. Vacío si no hay. */
  menus: MenuMediodia[];
  loading: boolean;
}

export const MEDIODIA_COLUMNAS =
  "mediodia_activo, mediodia_overline, mediodia_titulo, mediodia_titulo_accent, mediodia_subtitulo, " +
  "mediodia_descripcion, mediodia_dias_texto, mediodia_nota_salon, mediodia_nota_pickup, mediodia_imagenes";

export const formatPesos = (n: number): string => `$${Number(n || 0).toLocaleString("es-AR")}`;

/** Normaliza el jsonb de imágenes, descartando entradas sin url. */
export const parseImagenesMediodia = (raw: unknown): MediodiaImagen[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((im): im is Record<string, unknown> => Boolean(im) && typeof im === "object")
    .map((im) => ({
      url: typeof im.url === "string" ? im.url : "",
      alt: typeof im.alt === "string" ? im.alt : "",
    }))
    .filter((im) => im.url.length > 0);
};

/** Normaliza reservas_config.menus_mediodia: solo activos con nombre. */
export const parseMenusMediodia = (raw: unknown): MenuMediodia[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m): m is Record<string, unknown> => Boolean(m) && typeof m === "object")
    .filter((m) => m.activo !== false && typeof m.nombre === "string" && m.nombre.trim().length > 0)
    .map((m, i) => ({
      id: typeof m.id === "string" && m.id ? m.id : `menu-${i}`,
      nombre: String(m.nombre).trim(),
      precio: typeof m.precio === "number" && m.precio > 0 ? m.precio : null,
      detalle: Array.isArray(m.detalle) ? m.detalle.map(String).filter((s) => s.trim().length > 0) : [],
    }));
};

type FilaWebConfig = Record<string, unknown> & { mediodia_activo?: boolean | null };

/** Fila de web_config → config de la sección, o null si no se debe mostrar. */
export const parseMediodia = (data: FilaWebConfig | null | undefined): MediodiaConfig | null => {
  if (!data || !data.mediodia_activo) return null;
  const imagenes = parseImagenesMediodia(data.mediodia_imagenes);
  const diasTexto = String(data.mediodia_dias_texto ?? "").trim();
  // Misma guarda que el CHECK de la base: sin fotos o sin días, no se muestra.
  if (imagenes.length === 0 || !diasTexto) return null;
  const s = (k: string, def = "") => String(data[k] ?? def).trim();
  return {
    overline: s("mediodia_overline"),
    titulo: s("mediodia_titulo", "Kiku") || "Kiku",
    tituloAccent: s("mediodia_titulo_accent", "Mediodía") || "Mediodía",
    subtitulo: s("mediodia_subtitulo"),
    descripcion: s("mediodia_descripcion"),
    diasTexto,
    notaSalon: s("mediodia_nota_salon"),
    notaPickup: s("mediodia_nota_pickup"),
    imagenes,
  };
};

/** Precio "desde" entre los menús publicados, o null si ninguno tiene precio. */
export const precioDesde = (menus: MenuMediodia[]): number | null => {
  const precios = menus.map((m) => m.precio).filter((p): p is number => typeof p === "number" && p > 0);
  return precios.length ? Math.min(...precios) : null;
};

export function useMediodia(): UseMediodiaResult {
  const [mediodia, setMediodia] = useState<MediodiaConfig | null>(null);
  const [menus, setMenus] = useState<MenuMediodia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      supabase.from("web_config").select(MEDIODIA_COLUMNAS).eq("id", 1).maybeSingle(),
      supabase.from("reservas_config").select("menus_mediodia").eq("id", 1).maybeSingle(),
    ]).then(([cfgRes, resRes]) => {
      if (!alive) return;
      setLoading(false);
      if (!cfgRes.error && cfgRes.data) setMediodia(parseMediodia(cfgRes.data as unknown as FilaWebConfig));
      if (!resRes.error && resRes.data) {
        setMenus(parseMenusMediodia((resRes.data as { menus_mediodia?: unknown }).menus_mediodia));
      }
    });
    return () => { alive = false; };
  }, []);

  return { mediodia, menus, loading };
}

/**
 * Solo la visibilidad (para el header y el footer, que no necesitan el resto).
 * Devuelve false mientras carga.
 */
export function useMediodiaActivo(): boolean {
  const [activo, setActivo] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase
      .from("web_config")
      .select("mediodia_activo, mediodia_imagenes, mediodia_dias_texto")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive || error) return;
        setActivo(parseMediodia(data as unknown as FilaWebConfig) !== null);
      });
    return () => { alive = false; };
  }, []);
  return activo;
}
