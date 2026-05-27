import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * About — el "Te recibimos".
 * Centrada, con divider vertical animado y reveal stagger.
 */
const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-32 md:py-44 px-6 md:px-14 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, hsla(270, 50%, 50%, 0.08), transparent 60%)",
        }}
      />

      <div ref={ref} className="max-w-3xl mx-auto relative">
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={inView ? { scaleY: 1, opacity: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="w-px h-16 mx-auto mb-10 origin-top"
          style={{ background: "linear-gradient(to bottom, transparent, hsla(41, 64%, 77%, 0.55), transparent)" }}
        />

        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-jp text-xs tracking-[0.4em] text-v2-champagne mb-6 block"
        >
          — 私たちの物語 —
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-light tracking-[-0.02em] mb-12 leading-none"
          style={{ fontSize: "clamp(48px, 6vw, 88px)" }}
        >
          Te <em className="italic font-normal text-v2-champagne">recibimos</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-display italic text-2xl md:text-[26px] leading-[1.5] v2-text mb-8 font-light"
        >
          Kiku — 菊 — es el crisantemo. La flor de la realeza imperial japonesa. Símbolo de longevidad y de lo que florece en otoño cuando todo lo demás se apaga.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-base leading-[1.85] v2-text-muted max-w-xl mx-auto"
        >
          Trabajamos con salmón fresco seleccionado cada mañana, langostinos de la primera línea de pesca, y una obsesión por el detalle que viene de mirar cocinar a los maestros. Cada pieza es una decisión. Cada decisión, una pequeña ceremonia.
        </motion.p>
      </div>
    </section>
  );
};

export default AboutSection;
