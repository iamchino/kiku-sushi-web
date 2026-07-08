import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, type MotionValue } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

import { fetchEspeciales, fallbackEspeciales, type Especial } from "@/data/especiales";

/**
 * EspecialesSection — showcases verticales full-height (uno por sección),
 * con la opción de AGRUPAR varios en un carrusel.
 *
 * - Especiales sin `grupo`  → cada uno en su sección apilada (como siempre).
 * - Especiales con el mismo `grupo` → se muestran juntos como carrusel
 *   deslizable, en una sola sección (ej: las dos mesas del Mundial).
 *
 * Se gestionan desde el dashboard interno (/menu → tab "Especiales Web"),
 * tabla `especiales` en Supabase. Si Supabase no responde se usa el fallback.
 */

/** Botón CTA: link interno (router) o externo (URL libre). */
const EspecialCta = ({ e }: { e: Especial }) => {
  const cls =
    "group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3";
  const inner = (
    <>
      {e.ctaLabel}
      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
    </>
  );
  return e.ctaExternal ? (
    <a href={e.ctaHref} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  ) : (
    <Link to={e.ctaHref} className={cls}>{inner}</Link>
  );
};

/** Columna de texto del especial (overline, título, descripción, pasos, firma, CTA). */
const EspecialTexto = ({ e }: { e: Especial }) => (
  <>
    <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-6 block">{e.overline}</span>

    <h3
      className="font-display font-light leading-[0.92] tracking-[-0.025em] mb-7"
      style={{ fontSize: "clamp(48px, 6.5vw, 104px)" }}
    >
      {e.title}
      {e.titleAccent && (
        <>
          <br />
          <span className="font-normal v2-gradient-text">{e.titleAccent}</span>
        </>
      )}
    </h3>

    <p className="font-display text-xl md:text-2xl lg:text-[28px] v2-text-muted leading-[1.6] font-light mb-8 whitespace-pre-line">
      {e.description}
    </p>

    {e.highlight && (
      <div className="mb-8 rounded-xl border border-v2-champagne/35 bg-v2-champagne/10 px-5 py-4">
        <p className="text-base md:text-lg font-medium text-v2-champagne leading-snug whitespace-pre-line">
          {e.highlight}
        </p>
      </div>
    )}

    {e.pasos && (
      <div className="mb-8 space-y-4">
        {e.pasos.map((p) => (
          <div key={p.label} className="grid grid-cols-[96px_1fr] gap-5 pt-4 border-t border-v2-champagne/12">
            <span className="text-[10px] tracking-[0.3em] uppercase text-v2-champagne/70 pt-1">{p.label}</span>
            <div>
              <p className="text-sm leading-[1.8] v2-text-muted">{p.text}</p>
              {p.items && (
                <ul className="mt-2.5 space-y-2 list-disc pl-4 marker:text-v2-champagne/50">
                  {p.items.map((it) => (
                    <li key={it.roll} className="text-sm leading-[1.75] v2-text-muted">
                      <span className="text-v2-champagne/90 font-medium">{it.roll}:</span> {it.detalle}
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
      <p className="font-jp text-[10px] tracking-[0.35em] uppercase text-v2-champagne/60 mb-8">{e.firma}</p>
    )}

    <div className="flex items-center gap-7 flex-wrap">
      <EspecialCta e={e} />
      {e.precio && (
        <span className="font-display text-xl text-v2-champagne whitespace-nowrap">{e.precio}</span>
      )}
    </div>
  </>
);

/** Imagen 4:5 con marco y glow (opcionalmente con parallax). */
const EspecialImagen = ({ e, y }: { e: Especial; y?: MotionValue<string> }) => (
  <div className="relative">
    <div
      className="relative overflow-hidden aspect-[4/5] border border-v2-champagne/15"
      style={{ borderRadius: "28px", boxShadow: "0 0 90px hsla(270, 50%, 50%, 0.30), 0 0 30px hsla(41, 64%, 77%, 0.10)" }}
    >
      <motion.img
        src={e.image}
        alt={e.imageAlt}
        style={{ y, scale: 1.05, filter: "saturate(0.95) brightness(0.95)" }}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-v2-bg/35 to-transparent pointer-events-none" />
    </div>
    <div
      aria-hidden="true"
      className="absolute -inset-3 md:-inset-4 border border-v2-champagne/10 pointer-events-none"
      style={{ borderRadius: "36px" }}
    />
  </div>
);

/** Panel individual de un especial — el showcase de siempre (lados alternados, parallax). */
const EspecialPanel = ({ especial, index }: { especial: Especial; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const isEven = index % 2 === 0;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-2.5%", "2.5%"]);

  const e = especial;

  return (
    <div ref={ref} id={e.id} className="relative min-h-screen flex items-center py-24 md:py-28 overflow-hidden">
      {/* Número de fondo gigante */}
      <span
        aria-hidden="true"
        className={`absolute top-10 font-display font-light pointer-events-none select-none leading-none ${
          isEven ? "right-2 md:right-10" : "left-2 md:left-10"
        }`}
        style={{ fontSize: "clamp(160px, 26vw, 380px)", color: "hsla(41, 64%, 77%, 0.05)" }}
      >
        {e.number}
      </span>

      {/* Líneas premium */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className={`absolute top-[12%] h-px w-[34%] bg-gradient-to-r from-v2-champagne/20 to-transparent ${
            isEven ? "left-6 md:left-14" : "right-6 md:right-14 rotate-180"
          }`}
        />
        <div
          className={`absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/12 to-transparent ${
            isEven ? "left-6 md:left-14" : "right-6 md:right-14"
          }`}
        />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-14">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 lg:gap-28 items-center ${
            isEven ? "" : "md:[direction:rtl]"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className={isEven ? "" : "md:[direction:ltr]"}
          >
            <EspecialImagen e={e} y={imageY} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className={`max-w-xl ${isEven ? "" : "md:[direction:ltr]"}`}
          >
            <EspecialTexto e={e} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

/** Carrusel: varios especiales agrupados, deslizables dentro de una sola sección. */
const EspecialCarrusel = ({ items }: { items: Especial[] }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(i, el.children.length - 1));
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-24 md:py-28 overflow-hidden">
      {/* Track deslizable */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="especiales-track flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
      >
        {items.map((e) => (
          <div key={e.id} id={e.id} className="snap-center shrink-0 w-full px-6 md:px-14">
            <div className="relative max-w-[1440px] mx-auto">
              {/* Número de fondo */}
              <span
                aria-hidden="true"
                className="absolute -top-8 right-2 md:right-10 font-display font-light pointer-events-none select-none leading-none"
                style={{ fontSize: "clamp(140px, 22vw, 320px)", color: "hsla(41, 64%, 77%, 0.05)" }}
              >
                {e.number}
              </span>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                <EspecialImagen e={e} />
                <div className="max-w-xl">
                  <EspecialTexto e={e} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            className="hidden md:flex absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full border border-v2-champagne/30 bg-v2-bg/70 backdrop-blur-sm text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-all disabled:opacity-25 disabled:pointer-events-none z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => goTo(active + 1)}
            disabled={active >= items.length - 1}
            className="hidden md:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full border border-v2-champagne/30 bg-v2-bg/70 backdrop-blur-sm text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-all disabled:opacity-25 disabled:pointer-events-none z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-2.5 mt-8">
            {items.map((e, i) => (
              <button
                key={e.id}
                type="button"
                aria-label={`Ir al ${i + 1}`}
                onClick={() => goTo(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === active ? "26px" : "8px",
                  background: i === active ? "hsl(41, 64%, 77%)" : "hsla(41, 64%, 77%, 0.30)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/** Agrupa la lista en bloques: cada grupo (mismo `grupo`) es un carrusel; el resto, panel suelto. */
type Bloque = { key: string; items: Especial[] };
function agrupar(lista: Especial[]): Bloque[] {
  const bloques: Bloque[] = [];
  const indicePorGrupo = new Map<string, number>();
  for (const e of lista) {
    if (e.grupo) {
      const idx = indicePorGrupo.get(e.grupo);
      if (idx !== undefined) {
        bloques[idx].items.push(e);
      } else {
        indicePorGrupo.set(e.grupo, bloques.length);
        bloques.push({ key: `g:${e.grupo}`, items: [e] });
      }
    } else {
      bloques.push({ key: `e:${e.id}`, items: [e] });
    }
  }
  return bloques;
}

const EspecialesSection = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

  const [especiales, setEspeciales] = useState<Especial[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchEspeciales()
      .then((data) => { if (alive) setEspeciales(data); })
      .catch(() => { if (alive) setEspeciales(fallbackEspeciales); });
    return () => { alive = false; };
  }, []);

  if (especiales !== null && especiales.length === 0) return null;

  const bloques = agrupar(especiales ?? []);

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
      <div ref={headerRef} className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-14 pt-28 md:pt-40 pb-4 md:pb-8">
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

      {/* Bloques: panel suelto o carrusel por grupo */}
      {bloques.map((b, i) =>
        b.items.length === 1 ? (
          <EspecialPanel key={b.key} especial={b.items[0]} index={i} />
        ) : (
          <EspecialCarrusel key={b.key} items={b.items} />
        )
      )}

      {/* Aclaraciones */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-14 pb-20">
        <p className="text-[13px] md:text-[14px] leading-[2] v2-text-dim max-w-2xl border-t border-v2-champagne/10 pt-6">
          Servicio de mesa: $3.500 · solo a la carta de salón.
          El consumo de sal en exceso es perjudicial para la salud.
          Este establecimiento garantiza a cada comensal un vaso de agua potable de 375 ml sin cargo.
        </p>
      </div>

      {/* Ocultar la barra de scroll de los carruseles */}
      <style>{`
        .especiales-track::-webkit-scrollbar { display: none; }
        .especiales-track { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default EspecialesSection;
