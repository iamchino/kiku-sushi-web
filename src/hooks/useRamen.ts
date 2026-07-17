import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Sección Ramen del home. Se administra desde el dashboard
// (/menu → tab "Ramen") en la tabla web_config (fila única id=1).
//
// A diferencia del Omakase o los Especiales, acá no hay fallback hardcodeado:
// si no hay datos o la sección está apagada, la web simplemente no la muestra.
// Es contenido que todavía no existe, así que "nada" es el estado correcto.

export interface RamenImagen {
  url: string;
  /** Texto alternativo. Puede venir vacío. */
  alt: string;
}

export interface RamenConfig {
  activo: boolean;
  overline: string;
  titulo: string;
  tituloAccent: string;
  descripcion: string;
  /** Precio en pesos. 0 = no mostrar precio. */
  precio: number;
  /** Entre 2 y 3 imágenes. La primera es la principal (fondo). */
  imagenes: RamenImagen[];
}

export interface UseRamenResult {
  ramen: RamenConfig | null;
  loading: boolean;
}

// 18000 → "$18.000" (formato argentino)
export const formatPesos = (n: number): string =>
  `$${Number(n || 0).toLocaleString("es-AR")}`;

/** Normaliza el jsonb de imágenes, descartando cualquier entrada sin url. */
const parseImagenes = (raw: unknown): RamenImagen[] => {
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
 * Lee la config de la sección Ramen desde Supabase.
 * Devuelve `null` mientras carga, si falla la consulta, si la sección está
 * apagada, o si el contenido está incompleto (sin descripción o con menos de
 * 2 fotos). En todos esos casos la sección no debe renderizarse.
 */
export function useRamen(): UseRamenResult {
  const [ramen, setRamen] = useState<RamenConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase
      .from("web_config")
      .select(
        "ramen_activo, ramen_overline, ramen_titulo, ramen_titulo_accent, ramen_descripcion, ramen_precio, ramen_imagenes"
      )
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        setLoading(false);

        if (error || !data || !data.ramen_activo) return;

        const imagenes = parseImagenes(data.ramen_imagenes);
        const descripcion = (data.ramen_descripcion ?? "").trim();

        // Guarda de seguridad: aunque la base tiene un CHECK equivalente, si por
        // lo que sea llega contenido a medias preferimos no renderizar nada
        // antes que mostrar una sección rota en producción.
        if (!descripcion || imagenes.length < 2) return;

        setRamen({
          activo: true,
          overline: (data.ramen_overline ?? "").trim(),
          titulo: (data.ramen_titulo ?? "Ramen").trim(),
          tituloAccent: (data.ramen_titulo_accent ?? "").trim(),
          descripcion,
          precio: Number(data.ramen_precio ?? 0),
          imagenes,
        });
      });
    return () => {
      alive = false;
    };
  }, []);

  return { ramen, loading };
}
