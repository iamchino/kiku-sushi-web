import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import itamaePhoto from "@/assets/itamae.webp";

/**
 * Itamae — la sección que enamoró al cliente.
 * Foto real de la itamae a la izquierda (marco fino + glow, como los especiales),
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
  const portraitY = useTransform(scrollYProgress, [0, 1], ["-2.5%", "2.5%"]);

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
          className="grid grid-cols-1 md:grid-cols-[6fr_6fr] gap-12 md:gap-22 items-center"
        >
          {/* FOTO */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              className="relative overflow-hidden aspect-[16/10] border border-v2-champagne/15"
              style={{
                borderRadius: "28px",
                boxShadow:
                  "0 0 90px hsla(270, 50%, 50%, 0.30), 0 0 30px hsla(41, 64%, 77%, 0.10)",
              }}
            >
              <motion.img
                src={itamaePhoto}
                alt="La itamae de Kiku trabajando en la barra"
                style={{ y: portraitY, scale: 1.06, filter: "saturate(0.95) brightness(0.95)" }}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-v2-bg/30 to-transparent pointer-events-none" />
            </div>
            {/* Marco fino exterior */}
            <div
              aria-hidden="true"
              className="absolute -inset-3 md:-inset-4 border border-v2-champagne/10 pointer-events-none"
              style={{ borderRadius: "36px" }}
            />
          </motion.div>

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
              Itamae
            </motion.h3>

            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-[10px] tracking-[0.4em] uppercase v2-text-accent mb-8 block"
            >
              Noe Vera · Sushiwoman
            </motion.span>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-base leading-[1.85] v2-text-muted mb-5"
            >
              Precisión japonesa, frescura peruana y espíritu rebelde. Formada en la tradición nikkei, nuestra sushiwoman Noe Vera es la mente detrás de Kiku Sushi. Su propuesta nace del respeto absoluto por el producto del día, en un entorno que cruza lo íntimo y familiar con la cultura underground.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.55 }}
              className="text-base leading-[1.85] v2-text-muted"
            >
              En Kiku conviven el cuidado y la entrega: el equipo diseña experiencias únicas en cada pieza y los comensales se entregan al juego de texturas de la casa. Al final, el alma del lugar es el reflejo de su fundadora: una fuerza femenina que cuida el detalle, pero que mantiene intacta su esencia punk.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItamaeSection;
