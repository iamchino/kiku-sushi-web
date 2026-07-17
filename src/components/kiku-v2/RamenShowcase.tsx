import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRamen, formatPesos } from "@/hooks/useRamen";

/**
 * RamenShowcase — primera sección del home, justo debajo del hero.
 *
 * Mismo lenguaje que OmakaseShowcase / KikuLibreShowcase (parallax + reveal),
 * con una diferencia: acá el contenido es 100% editable desde el dashboard
 * (/menu → tab "Ramen"), incluidas las fotos.
 *
 * La foto principal va de fondo a toda la sección. Las secundarias (1 o 2)
 * aparecen como recuadros apilados a la derecha en desktop, y como una tira
 * horizontal debajo del texto en mobile.
 *
 * Si la sección está apagada o el contenido está incompleto, el hook devuelve
 * null y este componente no renderiza nada: el home queda exactamente como
 * estaba antes.
 */
const RamenShowcase = () => {
  const ref = useRef<HTMLElement>(null);
  const inViewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(inViewRef, { once: true, margin: "-120px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  const { ramen } = useRamen();

  // Sección apagada o sin contenido cargado → no existe.
  if (!ramen) return null;

  const [principal, ...secundarias] = ramen.imagenes;

  return (
    <section
      ref={ref}
      id="ramen"
      className="relative min-h-[92svh] md:min-h-screen flex items-center overflow-hidden v2-bg-base"
    >
      {/* Foto principal de fondo, con parallax */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-[-5%]">
        <img
          src={principal.url}
          alt={principal.alt || `${ramen.titulo} ${ramen.tituloAccent}`.trim()}
          className="w-full h-full object-cover"
          style={{ filter: "saturate(1) brightness(0.62)", objectPosition: "center 55%" }}
          /* Primera sección después del hero: se ve casi enseguida, no la difiramos. */
          loading="eager"
        />
      </motion.div>

      {/* Overlay horizontal en desktop (texto a la izquierda, fotos a la derecha) */}
      <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-v2-bg/85 via-v2-bg/45 to-v2-bg/20" />
      {/* Overlay parejo en mobile */}
      <div className="absolute inset-0 md:hidden bg-v2-bg/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-v2-bg/70 via-transparent to-v2-bg/85" />

      {/* Líneas premium decorativas */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute left-6 md:left-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/20 to-transparent" />
        <div className="absolute top-[18%] left-6 md:left-14 right-[40%] h-px bg-gradient-to-r from-v2-champagne/25 to-transparent" />
        <div className="absolute bottom-[14%] left-[30%] right-6 md:right-14 h-px bg-gradient-to-l from-v2-champagne/25 to-transparent" />
      </div>

      {/* CONTENT */}
      <div
        ref={inViewRef}
        className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-14 py-28 md:py-44"
      >
        <div className="grid md:grid-cols-[minmax(0,1fr)_auto] gap-12 md:gap-16 items-center">
          {/* Columna de texto */}
          <div>
            {ramen.overline && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 1 }}
                className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-8 block"
              >
                — {ramen.overline} —
              </motion.span>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 60 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-light leading-[0.88] tracking-[-0.03em] mb-10"
              style={{ fontSize: "clamp(56px, 9vw, 140px)" }}
            >
              {ramen.titulo}
              {ramen.tituloAccent && (
                <>
                  {" "}
                  <span className="font-normal v2-gradient-text">{ramen.tituloAccent}</span>
                </>
              )}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.35 }}
              className="text-base leading-[1.85] v2-text-muted max-w-xl mb-12"
            >
              {ramen.descripcion}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center gap-8 flex-wrap"
            >
              <Link
                to="/carta"
                className="group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3"
              >
                Ver la carta
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              {ramen.precio > 0 && (
                <span className="font-display text-xl text-v2-champagne whitespace-nowrap">
                  {formatPesos(ramen.precio)}
                </span>
              )}
            </motion.div>
          </div>

          {/* Fotos secundarias — apiladas a la derecha en desktop, tira en mobile */}
          {secundarias.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-row md:flex-col gap-4 md:gap-6"
            >
              {secundarias.map((im, i) => (
                <div
                  key={im.url}
                  className="relative overflow-hidden shrink-0 w-1/2 md:w-[260px] lg:w-[300px]"
                  style={{ border: "1px solid hsl(var(--v2-border-strong))" }}
                >
                  <img
                    src={im.url}
                    alt={im.alt || ""}
                    className="w-full h-40 md:h-56 lg:h-64 object-cover hover:scale-[1.04] transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Velo sutil para que no compitan con la foto de fondo */}
                  <div
                    className="absolute inset-0 pointer-events-none bg-v2-bg/10"
                    aria-hidden="true"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RamenShowcase;
