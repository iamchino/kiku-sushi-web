import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPesos } from "@/hooks/useOmakasePrecio";

// Kiku Libre + servicio de mesa + texto legal del agua. Se administran desde
// el dashboard (/menu → tab "Kiku Libre") en web_config (fila única id=1).
// Estos defaults son los valores vigentes al momento de crear el sistema:
// si la base no responde (o la migración no corrió), la web muestra esto.
export const LIBRE_DEFAULTS = {
  libre_precio: 53500,
  libre_sena: 20000,
  libre_multa_pieza: 1000,
  libre_pago_nota: "Efectivo o transferencia · Otro medio de pago consultar",
  cubierto_precio: 3500,
  agua_texto:
    "Este establecimiento garantiza a cada comensal un vaso de agua potable de 375 ml sin cargo.",
};

export type LibreConfig = typeof LIBRE_DEFAULTS;

export { formatPesos };

/**
 * Config del Kiku Libre y el servicio de mesa, leída de Supabase con
 * fallback a los defaults. Un solo fetch por montaje.
 */
export function useLibreConfig(): LibreConfig {
  const [config, setConfig] = useState<LibreConfig>(LIBRE_DEFAULTS);

  useEffect(() => {
    let alive = true;
    supabase
      .from("web_config")
      .select("libre_precio, libre_sena, libre_multa_pieza, libre_pago_nota, cubierto_precio, agua_texto")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive || error || !data) return;
        setConfig((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(LIBRE_DEFAULTS) as (keyof LibreConfig)[]) {
            const v = (data as Record<string, unknown>)[k];
            if (v != null) (next as Record<string, unknown>)[k] = v;
          }
          return next;
        });
      });
    return () => { alive = false; };
  }, []);

  return config;
}
