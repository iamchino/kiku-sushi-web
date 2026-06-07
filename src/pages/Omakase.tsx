import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import FooterV2 from "@/components/kiku-v2/FooterV2";
import { useLenisScroll } from "@/hooks/useLenisScroll";

import omakaseHero from "@/assets/omakase-hero.webp";
import omakase1 from "@/assets/omakase-1.webp";
import omakase2 from "@/assets/omakase-2.webp";

/**
 * Omakase — la página de la experiencia estrella.
 * Pensada como un recorrido: entrás, conocés la historia,
 * entendés la filosofía, ves cómo trabajamos y reservás.
 * Mismo lenguaje visual V2: kanji, champagne, líneas premium, glow.
 */

const CTA_CLASSES =
  "group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3";

/** Wrapper con reveal al entrar en viewport */
const Reveal = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-90px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/** Imagen 4:5 con el marco fino + glow de la casa */
const FramedImage = ({ src, alt }: { src: string; alt: string }) => (
  <div className="relative">
    <div
      className="relative overflow-hidden aspect-[4/5] border border-v2-champagne/15"
      style={{
        borderRadius: "28px",
        boxShadow:
          "0 0 90px hsla(270, 50%, 50%, 0.30), 0 0 30px hsla(41, 64%, 77%, 0.10)",
      }}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "saturate(0.95) brightness(0.95)" }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-v2-bg/30 to-transparent pointer-events-none" />
    </div>
    <div
      aria-hidden="true"
      className="absolute -inset-3 md:-inset-4 border border-v2-champagne/10 pointer-events-none"
      style={{ borderRadius: "36px" }}
    />
  </div>
);

const PASOS = [
  {
    n: "01",
    title: "Te sentás a la barra",
    text: "Diez asientos frente a la tabla. La itamae te recibe con la mirada atenta y el producto del día ya seleccionado.",
  },
  {
    n: "02",
    title: "Entradas y sushi delux en 10 pasos",
    text: "Cada paso se crea en el momento, según los ingredientes más frescos, el clima y la noche. No hay dos omakase iguales.",
  },
  {
    n: "03",
    title: "Tu bebida, incluida",
    text: "Copa de vino, cerveza Corona o Heineken, o gaseosa. Lo que mejor acompañe tu recorrido.",
  },
  {
    n: "04",
    title: "Postre y cierre ceremonial",
    text: "Al finalizar el servicio, una medida de whisky o sake japonés de nuestra barra de sushi. El punto final del ritual.",
  },
];

const Omakase = () => {
  useLenisScroll();

  useEffect(() => {
    document.body.classList.add("v2-root");
    return () => {
      document.body.classList.remove("v2-root");
    };
  }, []);

  // Parallax del hero
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="v2-root min-h-screen overflow-x-hidden v2-bg-base">
      <NavbarV2 />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[640px] flex items-center overflow-hidden"
      >
        <motion.div style={{ y: bgY }} className="absolute inset-0 h-[120%]">
          <img
            src={omakaseHero}
            alt="La barra del Omakase de Kiku"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(0.9) brightness(0.55)" }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-v2-bg/85 via-v2-bg/40 to-v2-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-v2-bg/60 via-transparent to-v2-bg" />

        {/* Líneas premium */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-6 md:left-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/20 to-transparent" />
          <div className="absolute top-[20%] left-6 md:left-14 right-[45%] h-px bg-gradient-to-r from-v2-champagne/25 to-transparent" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-14"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-7 block"
          >
            — おまかせ —
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-light leading-[0.88] tracking-[-0.03em] mb-8"
            style={{ fontSize: "clamp(60px, 11vw, 160px)" }}
          >
            <span className="font-normal v2-gradient-text">Omakase</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-display text-xl md:text-2xl v2-text-muted max-w-xl leading-[1.7] font-light"
          >
            "Me pongo en tus manos." Una sola frase, dicha en una barra de Tokio,
            que se volvió la forma más pura de comer sushi.
          </motion.p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
        >
          <span className="text-[10px] tracking-[0.35em] uppercase v2-text-dim">
            La historia
          </span>
          <motion.span
            animate={{ scaleY: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 origin-top"
            style={{
              background:
                "linear-gradient(to bottom, hsl(41 64% 77% / 0.55), transparent)",
            }}
          />
        </motion.div>
      </section>

      {/* ── EL ORIGEN ── */}
      <section className="relative py-28 md:py-40 px-6 md:px-14 overflow-hidden">
        <span
          aria-hidden="true"
          className="absolute -top-6 right-0 font-jp pointer-events-none select-none leading-none"
          style={{ fontSize: "clamp(180px, 24vw, 360px)", color: "hsla(41, 64%, 77%, 0.04)" }}
        >
          江戸
        </span>
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-24 items-center">
          <Reveal>
            <FramedImage src={omakase1} alt="Pieza de sushi del Omakase de Kiku" />
          </Reveal>
          <div>
            <Reveal>
              <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-6 block">
                — 江戸前 · EL ORIGEN —
              </span>
              <h2
                className="font-display font-light leading-[0.95] tracking-[-0.02em] mb-8"
                style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
              >
                Nació en la calle,{" "}
                <span className="font-normal text-v2-champagne">
                  se volvió ceremonia
                </span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-base leading-[1.9] v2-text-muted mb-6">
                El sushi que hoy se sirve en las barras más exclusivas del mundo
                nació como comida callejera. En el Edo del siglo XIX —la actual
                Tokio—, los puestos junto a la bahía servían pescado del día
                sobre arroz avinagrado: rápido, fresco, de pie. Esa tradición se
                llamó edomae, "frente a Edo", por el mar que daba los
                ingredientes.
              </p>
              <p className="text-base leading-[1.9] v2-text-muted mb-6">
                Mucho después, en esas mismas barras, los comensales empezaron a
                pronunciar una frase: omakase shimasu — del verbo makaseru,
                confiar, encargar. "Me pongo en tus manos". Sin carta, sin
                elegir: el itamae decide cada pieza según lo que el mar trajo
                esa mañana.
              </p>
              <p className="text-base leading-[1.9] v2-text-muted">
                Lo que empezó como un gesto de confianza entre dos personas se
                convirtió en la experiencia más codiciada de la gastronomía
                japonesa: un menú sin menú, distinto cada noche, imposible de
                repetir.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── LA FILOSOFÍA ── */}
      <section className="relative py-28 md:py-40 px-6 md:px-14 border-t border-v2-champagne/10 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 30%, hsla(270, 50%, 50%, 0.10), transparent 55%)",
          }}
        />
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-24 items-center">
          <div className="md:order-1 order-2">
            <Reveal>
              <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-6 block">
                — 職人 · LA FILOSOFÍA —
              </span>
              <h2
                className="font-display font-light leading-[0.95] tracking-[-0.02em] mb-8"
                style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
              >
                Shokunin: el arte de{" "}
                <span className="font-normal text-v2-champagne">
                  perfeccionar un oficio
                </span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-base leading-[1.9] v2-text-muted mb-6">
                En Japón existe una palabra para quien dedica su vida a un solo
                oficio: shokunin. No es un trabajo — es una vocación. En Kiku,
                esa palabra tiene nombre propio: Noe Vera.
              </p>
              <p className="text-base leading-[1.9] v2-text-muted mb-6">
                Nuestra itamae se formó durante diez años en la tradición
                nikkei: primero el arroz, después el corte, recién al final la
                barra. Diez años cortando, flameando y emplatando antes de
                pararse frente a vos. Porque en el omakase no hay dónde
                esconderse — todo sucede a la vista, a un metro de tu plato.
              </p>
              <p className="text-base leading-[1.9] v2-text-muted">
                Y ahí está el secreto de nuestra barra: Noe no solo cocina.
                Observa. Lee cada reacción, ajusta la temperatura del arroz, el
                punto del corte, el ritmo de los pasos. Por eso ningún omakase
                de Kiku se repite: el menú se escribe en tiempo real, entre sus
                manos y tu mesa.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <blockquote className="border-l-2 border-v2-champagne pl-6 mt-9 font-display text-xl md:text-[22px] v2-text">
                "No hay menú fijo. Hay confianza."
              </blockquote>
            </Reveal>
          </div>
          <Reveal className="md:order-2 order-1">
            <FramedImage src={omakase2} alt="La itamae de Kiku preparando una pieza en la barra" />
          </Reveal>
        </div>
      </section>

      {/* ── ASÍ TRABAJAMOS ── */}
      <section className="relative py-28 md:py-40 px-6 md:px-14 border-t border-v2-champagne/10 overflow-hidden">
        <span
          aria-hidden="true"
          className="absolute top-6 left-0 font-jp pointer-events-none select-none leading-none"
          style={{ fontSize: "clamp(180px, 24vw, 360px)", color: "hsla(41, 64%, 77%, 0.04)" }}
        >
          菊
        </span>
        <div className="max-w-3xl mx-auto text-center relative">
          <Reveal>
            <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-6 block">
              — 菊 · EN KIKU —
            </span>
            <h2
              className="font-display font-light leading-[0.95] tracking-[-0.02em] mb-10"
              style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
            >
              Nuestra barra es{" "}
              <span className="font-normal text-v2-champagne">
                el corazón del local
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-base md:text-lg leading-[1.9] v2-text-muted mb-6">
              Precisión japonesa, frescura peruana y espíritu rebelde. Nuestra
              itamae te recibe con la mirada atenta, las manos entrenadas y un
              respeto absoluto por el producto del día. Cada omakase se diseña
              de forma única: según los ingredientes más frescos, el clima y el
              momento, en un entorno que cruza lo íntimo con la cultura
              underground.
            </p>
            <p className="text-base md:text-lg leading-[1.9] v2-text-muted">
              No hay decisiones que tomar. Solo sentarte, confiar y dejarte
              sorprender.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── LA PROPUESTA (pasos) ── */}
      <section className="relative py-28 md:py-40 px-6 md:px-14 border-t border-v2-champagne/10">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16 md:mb-20">
            <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-6 block">
              — 十の手順 · LA PROPUESTA —
            </span>
            <h2
              className="font-display font-light leading-[0.95] tracking-[-0.02em]"
              style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
            >
              Una noche,{" "}
              <span className="font-normal text-v2-champagne">diez pasos</span>
            </h2>
          </Reveal>

          <div className="relative">
            {/* Línea vertical del recorrido */}
            <div
              aria-hidden="true"
              className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/25 to-transparent"
            />
            <div className="space-y-14 md:space-y-20">
              {PASOS.map((p, i) => (
                <Reveal key={p.n} delay={i * 0.08}>
                  <div
                    className={`relative flex flex-col md:flex-row items-start gap-5 md:gap-0 ${
                      i % 2 === 0 ? "" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Nodo */}
                    <span className="absolute left-[12px] md:left-1/2 md:-translate-x-1/2 top-1 w-4 h-4 rounded-full border border-v2-champagne/60 bg-v2-bg flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-v2-champagne" />
                    </span>
                    <div
                      className={`pl-12 md:pl-0 md:w-1/2 ${
                        i % 2 === 0
                          ? "md:pr-16 md:text-right"
                          : "md:pl-16 md:text-left"
                      }`}
                    >
                      <span className="font-display text-3xl text-v2-champagne/40 block mb-2">
                        {p.n}
                      </span>
                      <h3 className="font-display text-2xl mb-3">{p.title}</h3>
                      <p className="text-sm leading-[1.85] v2-text-muted">{p.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIO + CTA ── */}
      <section className="relative py-28 md:py-36 px-6 md:px-14 border-t border-v2-champagne/10 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, hsla(270, 50%, 50%, 0.14), transparent 60%)",
          }}
        />
        <div className="max-w-3xl mx-auto relative text-center">
          <Reveal>
            <div
              className="v2-bg-card border border-v2-champagne/15 p-10 md:p-14 mb-12"
              style={{
                borderRadius: "24px",
                boxShadow: "0 0 70px hsla(270, 50%, 50%, 0.18)",
              }}
            >
              <span className="font-jp text-[11px] tracking-[0.4em] text-v2-champagne block mb-5">
                — おまかせ —
              </span>
              <p className="font-display text-4xl md:text-5xl text-v2-champagne mb-3">
                $65.000
              </p>
              <p className="text-[10px] v2-text-muted uppercase tracking-[0.3em] mb-3">
                por persona · bebida y postre incluidos
              </p>
              <p className="text-[11px] v2-text-dim mb-1">
                Efectivo o transferencia · Consultar por otro medio de pago
              </p>
              <p className="text-[11px] v2-text-dim">
                Viernes y sábado · Hasta 6 personas por reserva · No incluye
                servicio de mesa ($3.500)
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p
              className="font-display font-light mb-10"
              style={{ fontSize: "clamp(26px, 3.5vw, 40px)" }}
            >
              ¿Te ponés en{" "}
              <span className="font-normal text-v2-champagne">
                nuestras manos
              </span>
              ?
            </p>
            <Link to="/reservar?experiencia=omakase" className={CTA_CLASSES}>
              Reservar Omakase
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>
        </div>
      </section>

      <FooterV2 />
    </div>
  );
};

export default Omakase;
