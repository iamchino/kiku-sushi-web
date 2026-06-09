import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import omakaseSectionBg from "@/assets/omakase-section-bg.webp";

/**
 * OmakaseShowcase — la estrella de Kiku.
 * Full-width, imagen de fondo con parallax, tipografía gigante,
 * líneas premium decorativas. Fondo: OMAK1HERO (omakase-section-bg.webp).
 */
const OmakaseShowcase = () => {
  const ref = useRef<HTMLElement>(null);
  const inViewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(inViewRef, { once: true, margin: "-120px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <section
      ref={ref}
      id="omakase"
      className="relative min-h-[92svh] md:min-h-screen flex items-center overflow-hidden v2-bg-base"
    >
      {/* BG image con parallax */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-[-5%]">
        <img
          src={omakaseSectionBg}
          alt="Barra del Omakase bajo luz violeta"
          className="w-full h-full object-cover"
          style={{ filter: "saturate(0.95) brightness(0.58)", objectPosition: "center 55%" }}
          loading="lazy"
        />
      </motion.div>
      {/* Overlay horizontal solo en desktop (texto a la izquierda) */}
      <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-v2-bg/80 via-v2-bg/40 to-v2-bg/20" />
      {/* Overlay mobile: oscurecido parejo + degradé vertical más fuerte */}
      <div className="absolute inset-0 md:hidden bg-v2-bg/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-v2-bg/70 via-transparent to-v2-bg/90" />

      {/* Líneas premium decorativas */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* línea vertical izquierda */}
        <div className="absolute left-6 md:left-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/20 to-transparent" />
        {/* línea horizontal superior */}
        <div className="absolute top-[18%] left-6 md:left-14 right-[40%] h-px bg-gradient-to-r from-v2-champagne/25 to-transparent" />
        {/* línea horizontal inferior */}
        <div className="absolute bottom-[14%] left-[30%] right-6 md:right-14 h-px bg-gradient-to-l from-v2-champagne/25 to-transparent" />
        {/* cruz fina esquina derecha */}
        <div className="absolute top-[18%] right-[40%] w-px h-10 bg-v2-champagne/25 -translate-y-1/2" />
      </div>

      {/* CONTENT */}
      <div
        ref={inViewRef}
        className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-14 py-28 md:py-44"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-8 block"
        >
          — おまかせ —
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-light leading-[0.88] tracking-[-0.03em] mb-10"
          style={{ fontSize: "clamp(64px, 11vw, 170px)" }}
        >
          <span className="font-normal v2-gradient-text">Omakase</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.35 }}
          className="font-display text-xl md:text-2xl v2-text-muted max-w-xl leading-[1.7] font-light mb-6"
        >
          "Me pongo en tus manos."
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.45 }}
          className="text-base leading-[1.85] v2-text-muted max-w-xl mb-12"
        >
          Cocina y sushi en vivo. No hay menú fijo. Solo sentarte, confiar y
          dejarte sorprender.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex items-center gap-8 flex-wrap"
        >
          <Link
            to="/reservar?experiencia=omakase"
            className="group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3"
          >
            Reservar Omakase
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
          <Link
            to="/omakase"
            className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-v2-champagne pb-1.5 border-b border-v2-champagne/24 hover:border-v2-champagne transition-all"
          >
            Conocer la experiencia
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-400" />
          </Link>
          <span className="font-display text-xl text-v2-champagne whitespace-nowrap">$65.000 por persona</span>
        </motion.div>
      </div>
    </section>
  );
};

export default OmakaseShowcase;
