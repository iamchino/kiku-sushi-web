import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { useMediodia, formatPesos, precioDesde, type MediodiaConfig, type MenuMediodia } from "@/hooks/useMediodia";

/**
 * MediodiaShowcase — bloque "Mediodías" del home, después de Kiku Libre.
 *
 * Mismo lenguaje que KikuLibreShowcase (parallax + reveal). El contenido
 * sale del dashboard (Menú → "Mediodías"): si la sección está apagada o sin
 * fotos, no renderiza nada, igual que "Nuevo".
 *
 * A la derecha, en desktop, se abanican hasta tres placas del menú del mes
 * como invitación a la página /mediodias.
 */
const MediodiaShowcase = () => {
  const { mediodia, menus } = useMediodia();
  if (!mediodia) return null;
  return <MediodiaShowcaseInner mediodia={mediodia} menus={menus} />;
};

const MediodiaShowcaseInner = ({ mediodia, menus }: { mediodia: MediodiaConfig; menus: MenuMediodia[] }) => {
  const ref = useRef<HTMLElement>(null);
  const inViewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(inViewRef, { once: true, margin: "-120px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  const portada = mediodia.imagenes[0];
  const abanico = mediodia.imagenes.slice(0, 3);
  const desde = precioDesde(menus);

  return (
    <section
      ref={ref}
      id="mediodias"
      className="relative min-h-[92svh] md:min-h-screen flex items-center overflow-hidden v2-bg-base"
    >
      {/* Fondo con parallax: la portada del menú del mes, difuminada */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-[-5%]">
        <img
          src={portada.url}
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
          style={{ filter: "saturate(1.1) brightness(0.4) blur(18px)", objectPosition: "center 25%" }}
          loading="lazy"
        />
      </motion.div>
      <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-v2-bg/85 via-v2-bg/55 to-v2-bg/30" />
      <div className="absolute inset-0 md:hidden bg-v2-bg/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-v2-bg/80 via-transparent to-v2-bg/90" />

      {/* Líneas premium */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute left-6 md:left-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/20 to-transparent" />
        <div className="absolute top-[16%] left-6 md:left-14 right-[45%] h-px bg-gradient-to-r from-v2-champagne/25 to-transparent" />
      </div>

      <div
        ref={inViewRef}
        className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-14 py-28 md:py-40 grid md:grid-cols-[1.15fr_0.85fr] gap-12 md:gap-8 items-center"
      >
        {/* Texto */}
        <div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1 }}
            className="font-jp text-xs tracking-[0.45em] text-v2-champagne mb-8 block"
          >
            — {mediodia.overline || "昼のキク"} —
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-light leading-[0.88] tracking-[-0.03em] mb-6"
            style={{ fontSize: "clamp(52px, 8vw, 128px)" }}
          >
            {mediodia.titulo} <span className="font-normal v2-gradient-text">{mediodia.tituloAccent}</span>
          </motion.h2>

          {mediodia.subtitulo && (
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-[12px] uppercase tracking-[0.3em] text-v2-champagne/90 mb-6"
            >
              {mediodia.subtitulo}
            </motion.p>
          )}

          {mediodia.descripcion && (
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.38 }}
              className="text-base leading-[1.85] v2-text-muted max-w-xl mb-8"
            >
              {mediodia.descripcion}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.45 }}
            className="flex items-center gap-5 flex-wrap mb-10"
          >
            <span className="inline-flex items-center gap-2.5 text-[13px] tracking-[0.2em] uppercase px-4 py-2.5 border border-v2-champagne/25 bg-v2-bg/50 text-v2-text">
              <Clock className="w-3.5 h-3.5 text-v2-champagne" />
              {mediodia.diasTexto}
            </span>
            {desde !== null && (
              <span className="font-display text-2xl text-v2-champagne whitespace-nowrap">
                desde {formatPesos(desde)}
                <span className="font-sans text-[11px] tracking-[0.2em] uppercase v2-text-muted ml-2">menú completo</span>
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.55 }}
            className="flex items-center gap-8 flex-wrap"
          >
            <Link
              to="/mediodias"
              className="group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[13px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3"
            >
              Ver el menú del mes
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <Link
              to="/reservar?experiencia=kiku_mediodia"
              className="group inline-flex items-center gap-3 text-[13px] uppercase tracking-[0.3em] text-v2-champagne pb-1.5 border-b border-v2-champagne/24 hover:border-v2-champagne transition-all"
            >
              Reservar mediodía
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-400" />
            </Link>
          </motion.div>
        </div>

        {/* Abanico de placas (solo desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:block relative h-[520px] lg:h-[600px]"
          aria-hidden="true"
        >
          {abanico.map((im, i) => {
            const n = abanico.length;
            const centro = (n - 1) / 2;
            const off = i - centro; // -1, 0, 1
            return (
              <Link
                key={im.url}
                to="/mediodias"
                tabIndex={-1}
                className="absolute top-1/2 left-1/2 block overflow-hidden border border-v2-champagne/20 shadow-2xl transition-transform duration-500 hover:z-20 hover:scale-[1.04]"
                style={{
                  width: "min(56%, 300px)",
                  aspectRatio: "4 / 5",
                  borderRadius: "18px",
                  transform: `translate(calc(-50% + ${off * 34}%), -50%) rotate(${off * 7}deg)`,
                  zIndex: 10 - Math.abs(off),
                  boxShadow: "0 30px 70px hsla(264, 56%, 2%, 0.7)",
                }}
              >
                <img src={im.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </Link>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default MediodiaShowcase;
