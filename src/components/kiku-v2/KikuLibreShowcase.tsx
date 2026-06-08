import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import kikuLibreBg from "@/assets/kiku-libre-section-bg.webp";

/**
 * KikuLibreShowcase — sección full-width del Kiku Libre.
 * Misma lógica que OmakaseShowcase (parallax + reveal) pero con la
 * imagen menos apagada: el plato es el protagonista.
 * Fondo: kiku libre.jpg (kiku-libre-section-bg.webp).
 */
const KikuLibreShowcase = () => {
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
      id="kiku-libre"
      className="relative min-h-[92svh] md:min-h-screen flex items-center overflow-hidden v2-bg-base"
    >
      {/* BG image con parallax — menos difuminada que Omakase */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-[-5%]">
        <img
          src={kikuLibreBg}
          alt="Plato de rolls y nigiris del Kiku Libre con flores comestibles"
          className="w-full h-full object-cover"
          style={{ filter: "saturate(1) brightness(0.7)", objectPosition: "center 60%" }}
          loading="lazy"
        />
      </motion.div>
      {/* Overlay horizontal solo en desktop (texto a la izquierda) */}
      <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-v2-bg/80 via-v2-bg/40 to-v2-bg/15" />
      {/* Overlay mobile: oscurecido parejo más suave que Omakase */}
      <div className="absolute inset-0 md:hidden bg-v2-bg/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-v2-bg/70 via-transparent to-v2-bg/85" />

      {/* Líneas premium decorativas */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute right-6 md:right-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/20 to-transparent" />
        <div className="absolute top-[18%] right-6 md:right-14 left-[40%] h-px bg-gradient-to-l from-v2-champagne/25 to-transparent" />
        <div className="absolute bottom-[14%] right-[30%] left-6 md:left-14 h-px bg-gradient-to-r from-v2-champagne/25 to-transparent" />
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
          — 食べ放題 —
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-light leading-[0.88] tracking-[-0.03em] mb-10"
          style={{ fontSize: "clamp(56px, 9vw, 140px)" }}
        >
          Kiku <span className="font-normal v2-gradient-text">Libre</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.35 }}
          className="text-base leading-[1.85] v2-text-muted max-w-xl mb-12"
        >
          Sushi ilimitado. Repetí todas las rondas que quieras. Empezás con un
          escabeche de vegetales y langostinos ahumados, seguís con rondas de
          diez piezas. No incluye bebida.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex items-center gap-8 flex-wrap"
        >
          <Link
            to="/reservar?experiencia=kiku_libre"
            className="group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3"
          >
            Reservar Kiku Libre
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
          <Link
            to="/sushi-libre"
            className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-v2-champagne pb-1.5 border-b border-v2-champagne/24 hover:border-v2-champagne transition-all"
          >
            Ver detalles
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-400" />
          </Link>
          <span className="font-display text-xl text-v2-champagne whitespace-nowrap">$53.500 por persona</span>
        </motion.div>
      </div>
    </section>
  );
};

export default KikuLibreShowcase;
