import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useRamen, formatPesos, type RamenConfig } from "@/hooks/useRamen";

/**
 * RamenShowcase — primera sección del home, justo debajo del hero.
 *
 * Mismo lenguaje que OmakaseShowcase / KikuLibreShowcase (parallax + reveal),
 * con una diferencia: acá el contenido es 100% editable desde el dashboard
 * (/menu → tab "Ramen"), incluidas las fotos.
 *
 * Las fotos van en un carrusel (embla) que acepta de 2 a 5 y se adapta a las
 * que haya: con 3 muestra 3, sin huecos ni relleno. La primera además va de
 * fondo a la sección, difuminada, para dar la atmósfera.
 *
 * Si la sección está apagada o el contenido está incompleto, el hook devuelve
 * null y este componente no renderiza nada: el home queda exactamente como
 * estaba antes.
 */
/**
 * Wrapper: decide si hay algo que mostrar. Los hooks de animación viven en
 * RamenShowcaseInner y no en este componente a propósito — si useScroll()
 * apuntara a un ref que nunca se monta (sección apagada), framer-motion
 * emite un warning en la consola de todos los visitantes del home.
 */
const RamenShowcase = () => {
  const { ramen } = useRamen();
  if (!ramen) return null;
  return <RamenShowcaseInner ramen={ramen} />;
};

const RamenShowcaseInner = ({ ramen }: { ramen: RamenConfig }) => {
  const ref = useRef<HTMLElement>(null);
  const inViewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(inViewRef, { once: true, margin: "-120px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  // ── Carrusel ───────────────────────────────────────────────────────────────
  // Los hooks van antes de cualquier return: no podemos condicionarlos.
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    // Con pocas fotos, que no queden slides sueltos al final.
    containScroll: "trimSnaps",
  });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const fotos = ramen.imagenes;
  const principal = fotos[0];
  // Con 2 fotos las flechas y los puntos aportan poco ruido y sí orientación;
  // los dejamos siempre, pero solo si de verdad hay más de una.
  const conControles = fotos.length > 1;

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
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ filter: "saturate(0.9) brightness(0.45) blur(2px)", objectPosition: "center 55%" }}
          /* Primera sección después del hero: se ve casi enseguida, no la difiramos. */
          loading="eager"
        />
      </motion.div>

      {/* Overlay horizontal en desktop (texto a la izquierda, carrusel a la derecha) */}
      <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-v2-bg/90 via-v2-bg/55 to-v2-bg/30" />
      {/* Overlay parejo en mobile */}
      <div className="absolute inset-0 md:hidden bg-v2-bg/55" />
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
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,46%)] gap-14 lg:gap-16 items-center">
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
              style={{ fontSize: "clamp(56px, 8vw, 128px)" }}
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

          {/* Carrusel de fotos */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {fotos.map((im, i) => (
                  <div
                    key={im.url}
                    /* basis-full: una foto por vista. El carrusel se adapta a
                       cuántas haya sin dejar huecos. */
                    className="relative min-w-0 flex-[0_0_100%]"
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{ border: "1px solid hsl(var(--v2-border-strong))" }}
                    >
                      <img
                        src={im.url}
                        alt={im.alt || `${ramen.titulo} ${ramen.tituloAccent}`.trim() || "Ramen"}
                        className="w-full h-[300px] md:h-[420px] lg:h-[480px] object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                      <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-v2-bg/45 via-transparent to-transparent"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {conControles && (
              <>
                {/* Flechas */}
                <button
                  type="button"
                  onClick={scrollPrev}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-v2-bg/70 hover:bg-v2-bg text-v2-champagne border border-v2-champagne/25 hover:border-v2-champagne transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  aria-label="Foto siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-v2-bg/70 hover:bg-v2-bg text-v2-champagne border border-v2-champagne/25 hover:border-v2-champagne transition-all duration-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Puntos — uno por foto real */}
                <div className="flex items-center justify-center gap-2.5 mt-6">
                  {snaps.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollTo(i)}
                      aria-label={`Ir a la foto ${i + 1}`}
                      aria-current={i === selected}
                      className="h-px transition-all duration-500"
                      style={{
                        width: i === selected ? 34 : 16,
                        background:
                          i === selected
                            ? "hsl(var(--v2-champagne))"
                            : "hsl(var(--v2-champagne) / 0.3)",
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RamenShowcase;
