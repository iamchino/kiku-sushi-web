import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, AlertTriangle, Info, Accessibility } from "lucide-react";
import { motion, useInView } from "framer-motion";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import FooterV2 from "@/components/kiku-v2/FooterV2";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import ambiance from "@/assets/ambiance.webp";

/** Sección con reveal al entrar en viewport */
const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const CTA_CLASSES =
  "group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3";

/**
 * Kiku Libre — página V2.
 * Mismo lenguaje visual que la landing: fondo violeta profundo,
 * champagne, kanji overlines, líneas premium, cards con borde fino.
 */
const SushiLibre = () => {
  useLenisScroll();

  useEffect(() => {
    document.body.classList.add("v2-root");
    return () => { document.body.classList.remove("v2-root"); };
  }, []);

  return (
    <div className="v2-root min-h-screen overflow-x-hidden v2-bg-base">
      <NavbarV2 />

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden">
        <img
          src={ambiance}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-v2-bg/70 via-v2-bg/60 to-v2-bg" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 25% 20%, hsla(270, 50%, 50%, 0.18), transparent 55%), radial-gradient(ellipse at 80% 70%, hsla(317, 100%, 65%, 0.08), transparent 55%)",
          }}
        />
        {/* Líneas premium */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-6 md:left-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/15 to-transparent" />
          <div className="absolute right-6 md:right-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/15 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="font-jp text-xs tracking-[0.45em] text-v2-champagne block mb-6"
          >
            — 食べ放題 —
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-light leading-[0.92] tracking-[-0.025em] mb-6 whitespace-nowrap"
            style={{ fontSize: "clamp(48px, 9vw, 130px)" }}
          >
            Kiku <span className="font-normal v2-gradient-text">Libre</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35 }}
            className="text-lg md:text-xl v2-text-muted max-w-2xl mx-auto mb-10 font-light"
          >
            Sushi ilimitado. Repetí todas las rondas que quieras.
          </motion.p>

          {/* Price */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="inline-flex flex-col items-center v2-bg-card border border-v2-champagne/15 px-12 py-9 mb-10"
            style={{ borderRadius: "24px", boxShadow: "0 0 70px hsla(270, 50%, 50%, 0.22)" }}
          >
            <p className="font-display text-4xl md:text-5xl text-v2-champagne mb-2">$53.500</p>
            <p className="text-[10px] v2-text-muted uppercase tracking-[0.3em]">
              por persona · no incluye bebida
            </p>
            <p className="text-[11px] v2-text-dim mt-2.5">
              Efectivo o transferencia · Otro medio de pago consultar
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.65 }}
          >
            <Link to="/reservar?experiencia=kiku_libre" className={CTA_CLASSES}>
              Reservar Kiku Libre
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 md:py-32 px-6 md:px-14 border-t border-v2-champagne/10">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne block mb-5">
              — 仕組み —
            </span>
            <h2
              className="font-display font-light leading-[0.95] tracking-[-0.02em]"
              style={{ fontSize: "clamp(34px, 4.5vw, 60px)" }}
            >
              ¿Cómo <span className="font-normal text-v2-champagne">funciona</span>?
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: "01",
                title: "Appetizer",
                desc: "Arrancás con un escabeche de vegetales y langostinos ahumados para abrir el paladar.",
              },
              {
                step: "02",
                title: "Rondas de 10 piezas",
                desc: "Variedades Fusion y Exotic. Repetí todas las veces que quieras.",
              },
              {
                step: "03",
                title: "Sin límites",
                desc: "Podés pedir otra ronda cuando termines la anterior. No hay tope de rondas.",
              },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.12}>
                <div
                  className="relative v2-bg-card border border-v2-champagne/12 p-8 hover:border-v2-champagne/30 transition-colors duration-500 h-full"
                  style={{ borderRadius: "20px" }}
                >
                  <span className="font-display text-6xl absolute top-4 right-6" style={{ color: "hsla(41, 64%, 77%, 0.08)" }}>
                    {s.step}
                  </span>
                  <h3 className="font-display text-2xl mb-3 relative">{s.title}</h3>
                  <p className="text-sm v2-text-muted leading-[1.8] relative">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Varieties ── */}
      <section className="py-24 md:py-32 px-6 md:px-14 relative border-t border-v2-champagne/10">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 80% 30%, hsla(270, 50%, 50%, 0.08), transparent 55%)",
          }}
        />
        <div className="max-w-4xl mx-auto relative">
          <Reveal className="text-center mb-14">
            <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne block mb-5">
              — 種類 —
            </span>
            <h2
              className="font-display font-light leading-[0.95] tracking-[-0.02em]"
              style={{ fontSize: "clamp(34px, 4.5vw, 60px)" }}
            >
              Las <span className="font-normal text-v2-champagne">variedades</span>
            </h2>
            <p className="v2-text-muted mt-4 text-sm">
              Cada ronda se sirve de a 10 piezas.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Kiku",
                rolls: ["Ebi Roll", "Philadelphia Roll", "Ahumado Roll", "New York Roll"],
              },
              {
                name: "Fusión",
                rolls: ["Sake Roll", "Tartar Sake Roll", "Guacamole Roll", "Ebi Roll", "Spicy Roll"],
              },
              {
                name: "Exotic",
                rolls: ["Phila Nipón Roll", "Fancy Roll", "Ebi Mango Roll", "Niguiri Thai"],
              },
            ].map((v, i) => (
              <Reveal key={v.name} delay={i * 0.12}>
                <div
                  className="v2-bg-card border border-v2-champagne/12 p-8 hover:border-v2-champagne/30 transition-colors duration-500 text-center h-full"
                  style={{ borderRadius: "20px" }}
                >
                  <h3 className="font-display text-3xl mb-6 text-v2-champagne">{v.name}</h3>
                  <ul className="space-y-3">
                    {v.rolls.map((r) => (
                      <li key={r} className="text-sm v2-text-muted flex items-center justify-center gap-2.5">
                        <span className="w-1 h-1 rounded-full bg-v2-champagne/60 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Important info ── */}
      <section className="py-24 md:py-32 px-6 md:px-14 border-t border-v2-champagne/10">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne block mb-5">
              — ご案内 —
            </span>
            <h2
              className="font-display font-light leading-[0.95] tracking-[-0.02em]"
              style={{ fontSize: "clamp(34px, 4.5vw, 60px)" }}
            >
              Información <span className="font-normal text-v2-champagne">importante</span>
            </h2>
          </Reveal>

          <div className="space-y-5">
            {[
              {
                icon: Info,
                iconClass: "text-v2-champagne",
                title: "Seña de $20.000 por persona",
                desc: "Para reservar se requiere una seña por persona. En caso de no asistir, la seña no es reembolsable.",
              },
              {
                icon: Info,
                iconClass: "text-v2-champagne",
                title: "Rondas ilimitadas",
                desc: "Podés repetir todas las veces que quieras, siempre que la ronda anterior haya sido consumida en su totalidad.",
              },
              {
                icon: Info,
                iconClass: "text-v2-champagne",
                title: "No incluye sashimis ni nigiris",
                desc: "El Kiku Libre se sirve en rondas de rolls. Los sashimis y nigiris no están incluidos.",
              },
              {
                icon: AlertTriangle,
                iconClass: "text-yellow-400/80",
                title: "Restricciones alimenticias",
                desc: "Si tenés alguna restricción alimenticia, la carta del salón está disponible para consumo. No se pueden modificar las variedades de sushi del libre.",
              },
              {
                icon: Accessibility,
                iconClass: "text-v2-champagne",
                title: "Accesibilidad",
                desc: "Si tenés alguna restricción de movilidad, avisanos para adaptar el lugar y que todos estén cómodos.",
              },
              {
                icon: AlertTriangle,
                iconClass: "text-v2-champagne",
                title: "Política anti-desperdicio",
                desc: "Si al finalizar la cena quedan piezas de sushi sin consumir, se cobrará una multa de $1.000 por cada una. ¡Pedí con conciencia! 🍣",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div
                  className="flex gap-5 items-start v2-bg-card border border-v2-champagne/12 p-6 md:p-7 hover:border-v2-champagne/25 transition-colors duration-500"
                  style={{ borderRadius: "18px" }}
                >
                  <item.icon className={`w-5 h-5 shrink-0 mt-0.5 ${item.iconClass}`} />
                  <div>
                    <h4 className="font-display text-lg mb-1.5">{item.title}</h4>
                    <p className="text-sm v2-text-muted leading-[1.8]">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Availability + CTA ── */}
      <section className="py-24 md:py-32 px-6 md:px-14 relative border-t border-v2-champagne/10 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, hsla(270, 50%, 50%, 0.14), transparent 60%)",
          }}
        />
        <div className="max-w-3xl mx-auto relative text-center">
          <Reveal>
            <div
              className="v2-bg-card border border-v2-champagne/15 p-10 md:p-14 mb-12"
              style={{ borderRadius: "24px", boxShadow: "0 0 70px hsla(270, 50%, 50%, 0.18)" }}
            >
              <h3 className="font-display text-2xl md:text-3xl mb-4">Disponibilidad</h3>
              <p className="v2-text-muted mb-1.5">
                <span className="v2-text font-medium">Miércoles y Jueves</span> de cada mes
              </p>
              <p className="text-sm v2-text-muted">
                De 20:00 a 23:40 hs (cierra la barra de sushi)
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p
              className="font-display font-light mb-10"
              style={{ fontSize: "clamp(26px, 3.5vw, 40px)" }}
            >
              ¿Listos para comer <span className="font-normal text-v2-champagne">sin límites</span>?
            </p>
            <Link to="/reservar?experiencia=kiku_libre" className={CTA_CLASSES}>
              Reservar Kiku Libre
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-xs v2-text-dim mt-5">Seña de $20.000 por persona requerida</p>
            <p className="text-[11px] leading-[2] v2-text-dim mt-8 max-w-xl mx-auto">
              El consumo de sal en exceso es perjudicial para la salud. Este establecimiento garantiza a cada comensal un vaso de agua potable de 375 ml sin cargo.
            </p>
          </Reveal>
        </div>
      </section>

      <FooterV2 />
    </div>
  );
};

export default SushiLibre;
