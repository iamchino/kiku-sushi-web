import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";

/**
 * Testimonios — versión sobria y profesional.
 * - Los 3 visibles a la vez en desktop (grid).
 * - En móvil: carrusel con scroll lateral + snap.
 * - Sin imágenes de fondo. Cards limpias sobre el fondo base,
 *   con borde champagne sutil y reveal escalonado.
 */

interface Testimonio {
  id: number;
  quote: string;
  name: string;
  role: string;
  highlight: string;
}

const TESTIMONIOS: Testimonio[] = [
  {
    id: 1,
    quote:
      "Llegamos sin reserva, la atención fue espectacular. Cocina en vivo por parte del chef. Nos supieron recomendar de una manera excelente y nos hicieron vivir una hermosa experiencia.",
    name: "Charly EF",
    role: "Verificado · Google",
    highlight: "Cocina en vivo",
  },
  {
    id: 2,
    quote:
      "Reservamos para el menú especial del día de los enamorados. Fue una experiencia maravillosa. Los chicos sumamente atentos y respetuosos. La comida riquísima y cada plato con una presentación única.",
    name: "Manuel Díaz",
    role: "Verificado · Google",
    highlight: "Menú especial",
  },
  {
    id: 3,
    quote:
      "Excelente lugar. La comida es muy buena, pero lo que más destaco es la atención: mozos atentos, amables y buena onda.",
    name: "Karina Gómez",
    role: "Verificado · Google",
    highlight: "Atención impecable",
  },
];

const TestimonialsCinema = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="testimonios"
      className="relative v2-bg-base border-t border-v2-champagne/10 py-28 md:py-40 overflow-hidden"
    >
      {/* Línea premium sutil de fondo */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/8 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div ref={ref} className="max-w-[1440px] mx-auto px-6 md:px-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 md:mb-20"
        >
          <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-5 block">
            — お客様の声 —
          </span>
          <h2
            className="font-display font-light leading-[0.95] tracking-[-0.02em]"
            style={{ fontSize: "clamp(36px, 4.5vw, 68px)" }}
          >
            Lo que se dice <span className="font-normal text-v2-champagne">de Kiku</span>
          </h2>
        </motion.div>

        {/* Cards: grid en desktop, scroll-snap lateral en móvil */}
        <div
          className="flex md:grid md:grid-cols-3 gap-5 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 pb-4 md:pb-0"
          style={{ scrollbarWidth: "none" }}
        >
          {TESTIMONIOS.map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.9,
                delay: 0.2 + i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="shrink-0 w-[84%] sm:w-[70%] md:w-auto snap-center flex flex-col justify-between v2-bg-card border border-v2-champagne/12 p-8 md:p-10 hover:border-v2-champagne/30 transition-colors duration-500"
            >
              <div>
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-3.5 h-3.5 fill-v2-champagne text-v2-champagne"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] tracking-[0.35em] uppercase text-v2-champagne/60">
                    {t.highlight}
                  </span>
                </div>

                <blockquote>
                  <p className="font-display font-light text-lg md:text-xl leading-[1.65] v2-text">
                    “{t.quote}”
                  </p>
                </blockquote>
              </div>

              <figcaption className="mt-9 pt-7 border-t border-v2-champagne/10">
                <p className="font-display text-xl text-v2-champagne leading-none mb-2">
                  {t.name}
                </p>
                <p className="text-[10px] tracking-[0.3em] uppercase v2-text-muted">
                  {t.role}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCinema;
