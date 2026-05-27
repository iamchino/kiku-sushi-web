import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";
import heroSushi from "@/assets/hero-sushi.webp";

/**
 * Hero brutal:
 * - Video full-bleed con parallax (se mueve a 0.6× scroll)
 * - Fallback elegante a imagen estática si no hay video
 * - Headline con stagger reveal letra por letra
 * - 2 CTAs: Reservar (champagne) + Pedir (ghost)
 * - Scroll indicator animado
 *
 * Cuando tengas el video: dropealo en /public/video/hero-loop.mp4
 * y descomentá las líneas marcadas.
 */
const HeroV2 = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax intensity
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative h-screen min-h-[700px] flex items-center justify-center text-center overflow-hidden v2-bg-base"
    >
      {/* VIDEO LAYER (con parallax) */}
      <motion.div
        style={{ y: videoY, scale: videoScale }}
        className="absolute inset-0 w-full h-[120%]"
      >
        {/* Cuando el video esté listo, descomentá este block: */}
        {/*
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          autoPlay muted loop playsInline
          poster="/video/hero-poster.webp"
        >
          <source src="/video/hero-loop.webm" type="video/webm" />
          <source src="/video/hero-loop.mp4" type="video/mp4" />
        </video>
        */}

        {/* Fallback: imagen + gradient (activo hasta que llegue el video) */}
        <img
          src={heroSushi}
          alt="Sushi premium bajo luz neón violeta · Kiku Sushi"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 25%, hsla(270, 50%, 50%, 0.38), transparent 55%),
              radial-gradient(ellipse at 75% 80%, hsla(317, 100%, 65%, 0.16), transparent 55%)
            `,
          }}
        />
      </motion.div>

      {/* Overlay para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-v2-bg/55 via-v2-bg/40 to-v2-bg/90" />

      {/* Noise texture (grano sutil) */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      {/* CONTENT */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-5xl px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="font-jp text-[13px] tracking-[0.45em] text-v2-champagne mb-7"
        >
          — 菊 寿司 —
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-light leading-[0.9] tracking-[-0.025em] mb-8"
          style={{ fontSize: "clamp(56px, 10vw, 152px)" }}
        >
          Una mesa.
          <br />
          Una <em className="italic font-normal v2-gradient-text">ceremonia</em>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="font-display italic text-xl md:text-2xl v2-text-muted max-w-xl mx-auto mb-12 font-light"
        >
          El sushi más exclusivo de Rosario. Diez asientos en la barra, una experiencia en cada plato.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link
            to="/reservar"
            className="group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3"
          >
            Reservar mesa
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/pedir"
            className="group bg-transparent text-v2-text border border-v2-champagne/24 px-10 py-[17px] text-[11px] uppercase tracking-[0.3em] font-medium hover:border-v2-champagne hover:text-v2-champagne hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3"
          >
            Pedir
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
      >
        <span className="text-[10px] tracking-[0.35em] uppercase v2-text-dim">Scroll</span>
        <motion.span
          animate={{ scaleY: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 origin-top"
          style={{ background: "linear-gradient(to bottom, hsl(41 64% 77% / 0.55), transparent)" }}
        />
      </motion.div>
    </section>
  );
};

export default HeroV2;
