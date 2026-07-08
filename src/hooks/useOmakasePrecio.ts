import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Precio por persona del Omakase. Se administra desde el dashboard
// (/menu → tab "Omakase") en la tabla web_config (fila única id=1).
// Si por algún motivo no se puede leer, cae a este valor por defecto.
const OMAKASE_PRECIO_DEFAULT = 70000;

// 70000 → "$70.000" (formato argentino)
export const formatPesos = (n: number): string =>
  `$${Number(n || 0).toLocaleString("es-AR")}`;

/**
 * Devuelve el precio del Omakase (entero, en pesos) leído de Supabase.
 * Arranca con el default y se actualiza al llegar el dato de la base.
 */
export function useOmakasePrecio(): number {
  const [precio, setPrecio] = useState(OMAKASE_PRECIO_DEFAULT);

  useEffect(() => {
    let alive = true;
    supabase
      .from("web_config")
      .select("omakase_precio")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (alive && data?.omakase_precio != null) {
          setPrecio(Number(data.omakase_precio));
        }
      });
    return () => { alive = false; };
  }, []);

  return precio;
}
