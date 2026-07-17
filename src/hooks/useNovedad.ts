import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Sección "Nuevo" del home: el plato del momento. Se administra desde el
// dashboard (/menu → tab "Nuevo") en la tabla web_config (fila única id=1).
//
// Es un contenedor genérico a propósito: hoy es el ramen, mañana puede ser
// otra cosa. Todo el contenido (título, copy, fotos, precio) es editable.
//
// A diferencia del Omakase o los Especiales, acá no hay fallback hardcodeado:
// si no hay datos o la sección está apagada, la web simplemente no la muestra.
// Es contenido que todavía no existe, así que "nada" es el estado correcto.

export interface NovedadImagen {
  url: string;
  /** Texto alternativo. Puede venir vacío. */
  alt: string;
}

export interface NovedadConfig {
  activo: boolean;
  overline: string;
  titulo: string;
  tituloAccent: string;
  descripcion: string;
  /** Precio en pesos. 0 = no mostrar precio. */
  precio: number;
  /** Entre 2 y 5 imágenes. Se muestran en carrusel; la primera además va de fondo. */
  imagenes: NovedadImagen[];
}

export interface UseNovedadResult {
  novedad: NovedadConfig | null;
  loading: boolean;
}

// 18000 → "$18.000" (formato argentino)
export const formatPesos = (n: number): string =>
  `$${Number(n || 0).toLocaleString("es-AR")}`;

/** Normaliza el jsonb de imágenes, descartando cualquier entrada sin url. */
const parseImagenes = (raw: unknown): NovedadImagen[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((im): im is Record<string, unknown> => Boolean(im) && typeof im === "object")
    .map((im) => ({
      url: typeof im.url === "string" ? im.url : "",
      alt: typeof im.alt === "string" ? im.alt : "",
    }))
    .filter((im) => im.url.length > 0);
};

/**
 * Lee la config de la sección "Nuevo" desde Supabase.
 * Devuelve `null` mientras carga, si falla la consulta, si la sección está
 * apagada, o si el contenido está incompleto (sin descripción o con menos de
 * 2 fotos). En todos esos casos la sección no debe renderizarse.
 */
export function useNovedad(): UseNovedadResult {
  const [novedad, setNovedad] = useState<NovedadConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase
      .from("web_config")
      .select(
        "novedad_activo, novedad_overline, novedad_titulo, novedad_titulo_accent, novedad_descripcion, novedad_precio, novedad_imagenes"
      )
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        setLoading(false);

        if (error || !data || !data.novedad_activo) return;

        const imagenes = parseImagenes(data.novedad_imagenes);
        const descripcion = (data.novedad_descripcion ?? "").trim();

        // Guarda de seguridad: aunque la base tiene un CHECK equivalente, si por
        // lo que sea llega contenido a medias preferimos no renderizar nada
        // antes que mostrar una sección rota en producción.
        if (!descripcion || imagenes.length < 2) return;

        setNovedad({
          activo: true,
          overline: (data.novedad_overline ?? "").trim(),
          titulo: (data.novedad_titulo ?? "").trim(),
          tituloAccent: (data.novedad_titulo_accent ?? "").trim(),
          descripcion,
          precio: Number(data.novedad_precio ?? 0),
          imagenes,
        });
      });
    return () => {
      alive = false;
    };
  }, []);

  return { novedad, loading };
}
