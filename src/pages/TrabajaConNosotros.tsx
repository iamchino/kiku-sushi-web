import { useEffect, useRef } from "react";
import { Mail, ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import FooterV2 from "@/components/kiku-v2/FooterV2";
import { useLenisScroll } from "@/hooks/useLenisScroll";

const EMAIL = "kikusushirosario@gmail.com";
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent("Quiero trabajar en Kiku")}`;

/**
 * Trabajá con nosotros — página simple y cálida.
 * Un solo objetivo: que quien quiera sumarse nos escriba un mail.
 */
const TrabajaConNosotros = () => {
  useLenisScroll();

  useEffect(() => {
    document.body.classList.add("v2-root");
    return () => {
      document.body.classList.remove("v2-root");
    };
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div className="v2-root min-h-screen overflow-x-hidden v2-bg-base flex flex-col">
      <NavbarV2 />

      <main className="flex-1 relative flex items-center overflow-hidden pt-24 pb-24">
        {/* Glow + líneas premium */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 25%, hsla(270, 50%, 50%, 0.14), transparent 55%), radial-gradient(ellipse at 80% 75%, hsla(317, 100%, 65%, 0.07), transparent 55%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-6 md:left-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/15 to-transparent" />
          <div className="absolute right-6 md:right-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/15 to-transparent" />
        </div>
        <span
          aria-hidden="true"
          className="absolute -bottom-10 right-0 font-jp pointer-events-none select-none leading-none"
          style={{ fontSize: "clamp(200px, 28vw, 400px)", color: "hsla(41, 64%, 77%, 0.04)" }}
        >
          仲間
        </span>

        <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-6 text-center w-full">
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1 }}
            className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-7 block"
          >
            — 仲間 · SUMATE AL EQUIPO —
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-light leading-[0.95] tracking-[-0.025em] mb-8"
            style={{ fontSize: "clamp(40px, 7vw, 92px)" }}
          >
            Trabajá{" "}
            <span className="font-normal v2-gradient-text">con nosotros</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.35 }}
            className="text-base md:text-lg leading-[1.9] v2-text-muted max-w-xl mx-auto mb-6"
          >
            Kiku lo hacemos entre todos: la barra, el salón, la cocina y la
            gente que le pone ganas cada noche. Si te apasiona la gastronomía,
            te gusta el detalle y querés crecer en un equipo con espíritu
            propio, queremos conocerte.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.45 }}
            className="text-base md:text-lg leading-[1.9] v2-text-muted max-w-xl mx-auto mb-12"
          >
            Mandanos un mail contándonos quién sos, qué te gustaría hacer y
            adjuntá tu CV. Leemos todo, y si hay lugar para vos, te escribimos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <a
              href={MAILTO}
              className="group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3"
            >
              <Mail className="w-4 h-4" />
              Enviar mi mail
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-[12px] v2-text-dim">
              o escribinos directo a{" "}
              <a
                href={MAILTO}
                className="text-v2-champagne hover:underline underline-offset-4"
              >
                {EMAIL}
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <FooterV2 />
    </div>
  );
};

export default TrabajaConNosotros;
