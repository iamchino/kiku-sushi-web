import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import ambiance from "@/assets/ambiance.webp";
import signatureRoll from "@/assets/signature-roll.webp";
import nigiriPlatter from "@/assets/nigiri-platter.webp";

/**
 * "Sushi Bar Live" — Testimonios cinematográficos full-bleed.
 *
 * Efectos:
 *  - Foto del plato como background con Ken Burns (scale + slow pan)
 *  - Overlay gradient (legibilidad)
 *  - Vignette radial (foco al centro)
 *  - Grain filter SVG (sensación filmica)
 *  - Crossfade entre testimonios
 *
 * Interacción:
 *  - Auto-rotate cada 7s
 *  - Pause on hover
 *  - Click en dots para saltar
 *  - Botones prev/next sutiles a los costados
 *  - Keyboard: ← → para navegar, espacio para pause/play
 *  - Toggle play/pause manual
 */

interface Testimonio {
  id: number;
  quote: string;
  name: string;
  role: string;
  image: string;
  /** Plato/momento que destaca el testimonio — aparece como overline editorial */
  highlight: string;
}

const TESTIMONIOS: Testimonio[] = [
  {
    id: 1,
    quote:
      "Llegamos sin reserva, la atención fue espectacular. Cocina en vivo por parte del chef. Nos supieron recomendar de una manera excelente y nos hicieron vivir una hermosa experiencia.",
    name: "Charly EF",
    role: "Verificado · Google",
    image: ambiance,
    highlight: "Cocina en vivo",
  },
  {
    id: 2,
    quote:
      "Reservamos para el menú especial del día de los enamorados. Fue una experiencia maravillosa. Los chicos sumamente atentos y respetuosos. La comida riquísima y cada plato con una presentación única.",
    name: "Manuel Díaz",
    role: "Verificado · Google",
    image: signatureRoll,
    highlight: "Menú especial",
  },
  {
    id: 3,
    quote:
      "Excelente lugar. La comida es muy buena, pero lo que más destaco es la atención: mozos atentos, amables y buena onda.",
    name: "Karina Gómez",
    role: "Verificado · Google",
    image: nigiriPlatter,
    highlight: "Atención impecable",
  },
];

const AUTOROTATE_MS = 7000;

const TestimonialsCinema = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const current = TESTIMONIOS[index];
  const total = TESTIMONIOS.length;

  // Cycle helper (con dirección para animar correctamente)
  const goTo = (next: number, dir: 1 | -1 = 1) => {
    setDirection(dir);
    setIndex(((next % total) + total) % total);
  };
  const next = () => goTo(index + 1, 1);
  const prev = () => goTo(index - 1, -1);

  // Auto-rotation
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => next(), AUTOROTATE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <section
      id="testimonios"
      className="relative w-full overflow-hidden bg-v2-bg border-t border-v2-champagne/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ height: "min(90vh, 900px)", minHeight: 600 }}
    >
      {/* ─── BACKGROUND con Ken Burns ─────────────────────────────── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <motion.img
            key={`img-${current.id}`}
            src={current.image}
            alt=""
            aria-hidden
            initial={{ scale: 1.04, x: 0, y: 0 }}
            animate={{ scale: 1.18, x: -16, y: 12 }}
            transition={{ duration: (AUTOROTATE_MS / 1000) + 3, ease: "linear" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* ─── OVERLAYS (legibilidad + cine) ────────────────────────── */}
      {/* Gradient top→bottom para legibilidad */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, hsla(264, 56%, 4%, 0.55) 0%, hsla(264, 56%, 4%, 0.65) 35%, hsla(264, 56%, 4%, 0.92) 100%)",
        }}
      />
      {/* Vignette radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 25%, hsla(264, 56%, 4%, 0.85) 100%)",
        }}
      />
      {/* Plasma glow lateral */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, hsla(317, 100%, 65%, 0.10), transparent 50%), radial-gradient(circle at 15% 80%, hsla(270, 50%, 50%, 0.14), transparent 55%)",
        }}
      />

      {/* Grain SVG filter (sensación filmica) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
        style={{ opacity: 0.13, mixBlendMode: "overlay" }}
      >
        <filter id="kiku-cinema-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.92"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#kiku-cinema-grain)" />
      </svg>

      {/* ─── KANJI WATERMARK decorativo ───────────────────────────── */}
      <span
        className="absolute -bottom-16 -left-10 md:-left-16 font-jp pointer-events-none select-none leading-none"
        style={{
          fontSize: "clamp(220px, 30vw, 420px)",
          color: "hsla(41, 64%, 77%, 0.045)",
        }}
      >
        菊
      </span>

      {/* ─── PREV / NEXT botones laterales (sutiles) ──────────────── */}
      <button
        onClick={prev}
        aria-label="Testimonio anterior"
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-v2-bg/30 backdrop-blur-md border border-v2-champagne/20 text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        aria-label="Testimonio siguiente"
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-v2-bg/30 backdrop-blur-md border border-v2-champagne/20 text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* ─── CONTENT LAYER ────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col justify-between px-6 md:px-16 py-12 md:py-16">
        {/* ── Top: label japonés + contador + play/pause ──────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-jp text-xs tracking-[0.4em] text-v2-champagne mb-2">
              — お客様の声 —
            </p>
            <p className="text-[10px] tracking-[0.32em] uppercase v2-text-muted flex items-center gap-2.5">
              <motion.span
                animate={paused ? { scale: 1 } : { scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block w-1.5 h-1.5 rounded-full bg-v2-accent"
              />
              {paused ? "Pausado" : "En vivo"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Reanudar" : "Pausar"}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-v2-champagne/20 text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-all"
            >
              {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <p
              className="font-display text-3xl md:text-4xl text-v2-champagne tabular-nums leading-none"
              style={{ letterSpacing: "0.02em" }}
            >
              {String(index + 1).padStart(2, "0")}
              <span className="opacity-25 ml-1"> / {String(total).padStart(2, "0")}</span>
            </p>
          </div>
        </div>

        {/* ── Center: highlight + quote ──────────────────────── */}
        <div className="flex-1 flex items-center justify-center my-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={(d: number) => ({ opacity: 0, x: d * 40, y: 16 })}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={(d: number) => ({ opacity: 0, x: -d * 40, y: -16 })}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.7 }}
                className="text-[10px] md:text-[11px] tracking-[0.45em] uppercase text-v2-champagne/70 mb-6"
              >
                — {current.highlight} —
              </motion.p>

              <blockquote>
                <p
                  className="font-display italic font-light text-v2-text leading-[1.18]"
                  style={{ fontSize: "clamp(28px, 4.4vw, 60px)" }}
                >
                  <span className="text-v2-champagne text-5xl md:text-7xl leading-none align-top mr-1 opacity-60 not-italic">
                    “
                  </span>
                  {current.quote}
                  <span className="text-v2-champagne text-5xl md:text-7xl leading-none align-bottom -ml-1 opacity-60 not-italic">
                    ”
                  </span>
                </p>
              </blockquote>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom: autor + estrellas + dots progress ───────── */}
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={`author-${current.id}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-v2-champagne text-v2-champagne"
                  />
                ))}
              </div>
              <p className="font-display text-2xl md:text-3xl text-v2-champagne leading-none mb-1.5">
                {current.name}
              </p>
              <p className="text-[10px] tracking-[0.3em] uppercase v2-text-muted">
                {current.role}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots con progress bar */}
          <div className="flex flex-row items-center gap-2.5">
            {TESTIMONIOS.map((t, i) => {
              const active = i === index;
              return (
                <button
                  key={t.id}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  aria-label={`Ver testimonio ${i + 1}`}
                  className="relative h-1.5 overflow-hidden transition-all duration-500"
                  style={{ width: active ? 56 : 18 }}
                >
                  <span className="absolute inset-0 bg-v2-text-dim/30" />
                  {active && !paused && (
                    <motion.span
                      key={`prog-${current.id}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: AUTOROTATE_MS / 1000, ease: "linear" }}
                      className="absolute inset-y-0 left-0 bg-v2-champagne"
                    />
                  )}
                  {active && paused && (
                    <span className="absolute inset-0 bg-v2-champagne/60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Hint sutil de navegación (desaparece en mobile) ─────── */}
      <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-10 items-center gap-3 text-[9px] tracking-[0.3em] uppercase v2-text-dim pointer-events-none">
        <kbd className="px-1.5 py-0.5 border border-v2-champagne/15 rounded-sm">←</kbd>
        <kbd className="px-1.5 py-0.5 border border-v2-champagne/15 rounded-sm">→</kbd>
        <span>navegá</span>
      </div>
    </section>
  );
};

export default TestimonialsCinema;
