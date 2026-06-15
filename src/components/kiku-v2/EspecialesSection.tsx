import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

import { fetchEspeciales, fallbackEspeciales, type Especial } from "@/data/especiales";

/**
 * EspecialesSection — carrusel horizontal de especiales.
 *
 * Cada especial es un slide a ancho completo (imagen 4:5 + texto, pasos y CTA),
 * con scroll-snap, flechas e indicadores. Pensado para mostrar varios especiales
 * "uno al lado del otro" sin estirar la página verticalmente.
 *
 * Los especiales se gestionan desde el dashboard interno
 * (/menu → tab "Especiales Web"), tabla `especiales` en Supabase.
 * Si Supabase no responde se usa el fallback de src/data/especiales.ts.
 */

/** Botón CTA del especial: link interno (router) o externo (URL libre). */
const EspecialCta = ({ e }: { e: Especial }) => {
  const cls =
    "group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-3";
  const inner = (
    <>
      {e.ctaLabel}
      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
    </>
  );
  return e.ctaExternal ? (
    <a href={e.ctaHref} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link to={e.ctaHref} className={cls}>
      {inner}
    </Link>
  );
};

/** Slide individual del carrusel. */
const EspecialSlide = ({ especial }: { especial: Especial }) => {
  const e = especial;
  return (
    <div className="snap-center shrink-0 w-full px-2 md:px-6">
      <div className="relative max-w-[1180px] mx-auto rounded-[28px] overflow-hidden border border-v2-champagne/12 v2-bg-base">
        {/* Número de fondo gigante (watermark) */}
        <span
          aria-hidden="true"
          className="absolute -top-6 right-2 md:right-8 font-display font-light pointer-events-none select-none leading-none"
          style={{ fontSize: "clamp(140px, 20vw, 300px)", color: "hsla(41, 64%, 77%, 0.05)" }}
        >
          {e.number}
        </span>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center p-6 md:p-12">
          {/* IMAGEN 4:5 */}
          <div className="relative">
            <div
              className="relative overflow-hidden aspect-[4/5] border border-v2-champagne/15"
              style={{
                borderRadius: "24px",
                boxShadow: "0 0 80px hsla(270, 50%, 50%, 0.28), 0 0 28px hsla(41, 64%, 77%, 0.10)",
              }}
            >
              <img
                src={e.image}
                alt={e.imageAlt}
                style={{ filter: "saturate(0.95) brightness(0.95)" }}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-v2-bg/35 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* TEXTO */}
          <div className="max-w-xl">
            <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-5 block">
              {e.overline}
            </span>

            <h3
              className="font-display font-light leading-[0.92] tracking-[-0.025em] mb-6"
              style={{ fontSize: "clamp(40px, 5vw, 80px)" }}
            >
              {e.title}
              {e.titleAccent && (
                <>
                  <br />
                  <span className="font-normal v2-gradient-text">{e.titleAccent}</span>
                </>
              )}
            </h3>

            <p className="font-display text-base md:text-lg v2-text-muted leading-[1.7] font-light mb-7">
              {e.description}
            </p>

            {e.pasos && (
              <div className="mb-7 space-y-3.5">
                {e.pasos.map((p) => (
                  <div
                    key={p.label}
                    className="grid grid-cols-[88px_1fr] gap-4 pt-3.5 border-t border-v2-champagne/12"
                  >
                    <span className="text-[10px] tracking-[0.3em] uppercase text-v2-champagne/70 pt-1">
                      {p.label}
                    </span>
                    <div>
                      <p className="text-sm leading-[1.8] v2-text-muted">{p.text}</p>
                      {p.items && (
                        <ul className="mt-2.5 space-y-2 list-disc pl-4 marker:text-v2-champagne/50">
                          {p.items.map((it) => (
                            <li key={it.roll} className="text-sm leading-[1.75] v2-text-muted">
                              <span className="text-v2-champagne/90 font-medium">{it.roll}:</span>{" "}
                              {it.detalle}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {e.firma && (
              <p className="font-jp text-[10px] tracking-[0.35em] uppercase text-v2-champagne/60 mb-7">
                {e.firma}
              </p>
            )}

            <div className="flex items-center gap-7 flex-wrap">
              <EspecialCta e={e} />
              {e.precio && (
                <span className="font-display text-xl text-v2-champagne whitespace-nowrap">{e.precio}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EspecialesSection = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // null = cargando. La web pinta el header de inmediato y los slides
  // apenas llega la data (Supabase, o fallback si falla).
  const [especiales, setEspeciales] = useState<Especial[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchEspeciales()
      .then((data) => { if (alive) setEspeciales(data); })
      .catch(() => { if (alive) setEspeciales(fallbackEspeciales); });
    return () => { alive = false; };
  }, []);

  // Índice activo según la posición del scroll horizontal.
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(i);
  }, []);

  const scrollToIndex = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.children.length - 1;
    const target = Math.max(0, Math.min(i, max));
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  }, []);

  // Todos los especiales desactivados desde el dashboard → ocultar la sección.
  if (especiales !== null && especiales.length === 0) return null;

  const lista = especiales ?? [];
  const multiple = lista.length > 1;

  return (
    <section id="especiales" className="relative v2-bg-base">
      {/* Glow ambiental */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 85% 10%, hsla(270, 50%, 50%, 0.08), transparent 50%), radial-gradient(ellipse at 10% 80%, hsla(317, 100%, 65%, 0.05), transparent 50%)",
        }}
      />

      {/* Header */}
      <div
        ref={headerRef}
        className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-14 pt-28 md:pt-40 pb-8 md:pb-12"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-5 block"
        >
          — 季節限定 · ROTAN POR TEMPORADA —
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-light leading-[0.95] tracking-[-0.02em]"
          style={{ fontSize: "clamp(40px, 6vw, 96px)" }}
        >
          Especiales <span className="font-normal text-v2-champagne">de Kiku</span>
        </motion.h2>
      </div>

      {/* Carrusel */}
      <div className="relative z-10">
        {/* Track horizontal con scroll-snap */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="especiales-track flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6"
        >
          {lista.map((e) => (
            <EspecialSlide key={e.id} especial={e} />
          ))}
        </div>

        {/* Flechas (solo si hay más de uno) */}
        {multiple && (
          <>
            <button
              type="button"
              aria-label="Especial anterior"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="hidden md:flex absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full border border-v2-champagne/30 bg-v2-bg/70 backdrop-blur-sm text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-all disabled:opacity-25 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Especial siguiente"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex >= lista.length - 1}
              className="hidden md:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full border border-v2-champagne/30 bg-v2-bg/70 backdrop-blur-sm text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-all disabled:opacity-25 disabled:pointer-events-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicadores (dots) */}
        {multiple && (
          <div className="flex items-center justify-center gap-2.5 mt-2">
            {lista.map((e, i) => (
              <button
                key={e.id}
                type="button"
                aria-label={`Ir al especial ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === activeIndex ? "26px" : "8px",
                  background:
                    i === activeIndex ? "hsl(41, 64%, 77%)" : "hsla(41, 64%, 77%, 0.30)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Aclaraciones */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-14 pt-12 pb-20">
        <p className="text-[11px] leading-[2] v2-text-dim max-w-2xl border-t border-v2-champagne/10 pt-6">
          Servicio de mesa: $3.500 · solo a la carta de salón.
          El consumo de sal en exceso es perjudicial para la salud.
          Este establecimiento garantiza a cada comensal un vaso de agua potable de 375 ml sin cargo.
        </p>
      </div>

      {/* Ocultar la barra de scroll del track */}
      <style>{`
        .especiales-track::-webkit-scrollbar { display: none; }
        .especiales-track { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default EspecialesSection;
