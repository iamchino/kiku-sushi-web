import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

/**
 * Itamae — la sección que enamoró al cliente.
 * Retrato a la izquierda (placeholder hasta que llegue la foto del chef),
 * bio editorial a la derecha con quote destacada con borde champagne.
 */
const ItamaeSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section
      ref={sectionRef}
      id="itamae"
      className="py-32 md:py-44 px-6 md:px-14 border-t border-v2-champagne/10 relative overflow-hidden"
    >
      {/* Glow ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, hsla(270, 50%, 50%, 0.10), transparent 60%)",
        }}
      />

      <div className="max-w-[1320px] mx-auto relative">
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-12 md:gap-22 items-center"
        >
          {/* PORTRAIT */}
          <div className="relative aspect-[3/4] v2-bg-card border border-v2-champagne/10 overflow-hidden flex items-center justify-center">
            <motion.div
              style={{ y: portraitY }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* gradient base */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, hsla(270, 50%, 50%, 0.42), hsla(317, 100%, 65%, 0.18))",
                }}
              />
              {/* Watermark kanji */}
              <span
                className="font-jp absolute text-[280px] md:text-[320px] leading-none"
                style={{ color: "hsla(41, 64%, 77%, 0.08)" }}
              >
                菊
              </span>
            </motion.div>

            {/* Placeholder annotation */}
            <span className="absolute bottom-6 text-[9px] tracking-[0.3em] uppercase v2-text-dim px-3 py-1.5 border border-v2-champagne/24 bg-v2-bg/70 rounded-full">
              Retrato del itamae · B&N · luz neón
            </span>
          </div>

          {/* CONTENT */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="font-jp text-xs tracking-[0.4em] text-v2-champagne mb-6 block"
            >
              — 板前 —
            </motion.span>

            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-light text-5xl md:text-6xl leading-none mb-5"
            >
              El Itamae
            </motion.h3>

            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-[10px] tracking-[0.4em] uppercase v2-text-accent mb-8 block"
            >
              Master Sushi Chef
            </motion.span>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-base leading-[1.85] v2-text-muted mb-5"
            >
              Su mirada es atenta, sus manos están entrenadas, y su respeto por el producto del día es absoluto. Diez años cortando, flameando y emplatando. Cada noche en la barra es una conversación silenciosa entre el itamae y quien se sienta enfrente.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.55 }}
              className="text-base leading-[1.85] v2-text-muted"
            >
              Formado en la tradición nikkei — esa fusión nacida del encuentro entre la precisión japonesa y los sabores latinos — domina el corte hosomaki, el flameado al carbón, y el equilibrio entre acidez y umami.
            </motion.p>

            <motion.blockquote
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: 0.75 }}
              className="border-l-2 border-v2-champagne pl-6 mt-9 font-display italic text-xl md:text-[22px] v2-text"
            >
              "No hay menú fijo. Hay confianza."
            </motion.blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItamaeSection;
