import { useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { ChevronRight, Clock, MessageCircle, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { motion, useInView } from "framer-motion";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import FooterV2 from "@/components/kiku-v2/FooterV2";
import MediodiaCarrusel from "@/components/kiku-v2/MediodiaCarrusel";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useLibreConfig } from "@/hooks/useLibreConfig";
import { useMediodia, formatPesos, precioDesde } from "@/hooks/useMediodia";

/** Sección con reveal al entrar en viewport (mismo que Kiku Libre). */
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
  "group bg-v2-champagne text-v2-bg px-10 py-[17px] text-[13px] uppercase tracking-[0.3em] font-medium hover:bg-v2-text hover:-translate-y-0.5 transition-all duration-400 inline-flex items-center gap-3";
const CTA_SECUNDARIO =
  "group inline-flex items-center gap-3 text-[13px] uppercase tracking-[0.3em] text-v2-champagne pb-1.5 border-b border-v2-champagne/24 hover:border-v2-champagne transition-all";

export const WHATSAPP_PICKUP_URL =
  `https://wa.me/5493412764562?text=${encodeURIComponent("Hola Kiku 🍣 Quiero pedir el menú de mediodía para retirar (pick up).")}`;

/**
 * Mediodías — página propia, mismo lenguaje visual que Kiku Libre.
 * Todo el contenido sale del dashboard:
 *   · textos y fotos del menú del mes → web_config.mediodia_* (Menú → "Mediodías")
 *   · menús con precio y detalle       → reservas_config.menus_mediodia (Configuración → Reservas)
 * Si la sección está apagada, redirige al home.
 */
const Mediodias = () => {
  useLenisScroll();
  const { mediodia, menus, loading } = useMediodia();
  const libre = useLibreConfig();

  useEffect(() => {
    document.body.classList.add("v2-root");
    return () => { document.body.classList.remove("v2-root"); };
  }, []);

  if (!loading && !mediodia) return <Navigate to="/" replace />;

  const desde = precioDesde(menus);
  const portada = mediodia?.imagenes[0];

  return (
    <div className="v2-root min-h-screen overflow-x-hidden v2-bg-base">
      <NavbarV2 />

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden">
        {portada && (
          <img
            src={portada.url}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            style={{ objectPosition: "center 30%", filter: "blur(16px) saturate(1.15)", transform: "scale(1.1)" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-v2-bg/75 via-v2-bg/65 to-v2-bg" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 25% 20%, hsla(41, 64%, 60%, 0.14), transparent 55%), radial-gradient(ellipse at 80% 70%, hsla(270, 50%, 50%, 0.16), transparent 55%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-6 md:left-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/15 to-transparent" />
          <div className="absolute right-6 md:right-14 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-v2-champagne/15 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {mediodia && (
            <>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="font-jp text-xs tracking-[0.45em] text-v2-champagne block mb-6"
              >
                — {mediodia.overline || "昼のキク"} —
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-light leading-[0.92] tracking-[-0.025em] mb-6"
                style={{ fontSize: "clamp(48px, 9vw, 130px)" }}
              >
                {mediodia.titulo} <span className="font-normal v2-gradient-text">{mediodia.tituloAccent}</span>
              </motion.h1>

              {mediodia.subtitulo && (
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="text-[12px] md:text-[13px] uppercase tracking-[0.3em] text-v2-champagne/90 mb-6"
                >
                  {mediodia.subtitulo}
                </motion.p>
              )}

              {mediodia.descripcion && (
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="text-lg md:text-xl v2-text-muted max-w-2xl mx-auto mb-10 font-light"
                >
                  {mediodia.descripcion}
                </motion.p>
              )}

              {/* Días + precio desde */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="inline-flex flex-col items-center v2-bg-card border border-v2-champagne/15 px-10 md:px-12 py-8 mb-10"
                style={{ borderRadius: "24px", boxShadow: "0 0 70px hsla(270, 50%, 50%, 0.22)" }}
              >
                <p className="inline-flex items-center gap-2.5 font-display text-2xl md:text-3xl text-v2-text mb-2">
                  <Clock className="w-5 h-5 text-v2-champagne" />
                  {mediodia.diasTexto}
                </p>
                {desde !== null ? (
                  <>
                    <p className="font-display text-4xl md:text-5xl text-v2-champagne mt-3 mb-1">
                      desde {formatPesos(desde)}
                    </p>
                    <p className="text-[12px] v2-text-muted uppercase tracking-[0.3em]">
                      menú completo · por persona
                    </p>
                  </>
                ) : (
                  <p className="text-[12px] v2-text-muted uppercase tracking-[0.3em] mt-2">
                    salón y pick up
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.65 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
              >
                <Link to="/reservar?experiencia=kiku_mediodia" className={CTA_CLASSES}>
                  Reservar mediodía
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#menu-del-mes" className={CTA_SECUNDARIO}>
                  Ver el menú del mes
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {mediodia && (
        <>
          {/* ── El menú del mes (fotos) ── */}
          <section id="menu-del-mes" className="py-24 md:py-32 px-6 md:px-14 border-t border-v2-champagne/10 scroll-mt-24">
            <div className="max-w-6xl mx-auto">
              <Reveal className="text-center mb-14">
                <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne block mb-5">
                  — 今月のメニュー —
                </span>
                <h2
                  className="font-display font-light leading-[0.95] tracking-[-0.02em]"
                  style={{ fontSize: "clamp(34px, 4.5vw, 60px)" }}
                >
                  El menú <span className="font-normal text-v2-champagne">del mes</span>
                </h2>
                <p className="v2-text-muted mt-4 text-sm">
                  Tocá una foto para verla en grande.
                </p>
              </Reveal>

              <Reveal delay={0.1} className="px-0 md:px-6">
                <MediodiaCarrusel imagenes={mediodia.imagenes} />
              </Reveal>
            </div>
          </section>

          {/* ── Los menús (de Configuración → Reservas) ── */}
          {menus.length > 0 && (
            <section className="py-24 md:py-32 px-6 md:px-14 relative border-t border-v2-champagne/10">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 80% 30%, hsla(270, 50%, 50%, 0.08), transparent 55%)" }}
              />
              <div className="max-w-4xl mx-auto relative">
                <Reveal className="text-center mb-14">
                  <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne block mb-5">
                    — メニュー —
                  </span>
                  <h2
                    className="font-display font-light leading-[0.95] tracking-[-0.02em]"
                    style={{ fontSize: "clamp(34px, 4.5vw, 60px)" }}
                  >
                    Los <span className="font-normal text-v2-champagne">menús</span>
                  </h2>
                  <p className="v2-text-muted mt-4 text-sm">
                    Elegís el menú al reservar o al llegar. La carta habitual también está disponible.
                  </p>
                </Reveal>

                <div className={`grid gap-6 ${menus.length === 1 ? "max-w-md mx-auto" : menus.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                  {menus.map((m, i) => (
                    <Reveal key={m.id} delay={i * 0.12}>
                      <div
                        className="v2-bg-card border border-v2-champagne/12 p-8 hover:border-v2-champagne/30 transition-colors duration-500 text-center h-full flex flex-col"
                        style={{ borderRadius: "20px" }}
                      >
                        <h3 className="font-display text-2xl md:text-3xl mb-2 text-v2-champagne">{m.nombre}</h3>
                        {m.precio !== null && (
                          <p className="font-display text-3xl md:text-4xl mb-6">{formatPesos(m.precio)}</p>
                        )}
                        {m.detalle.length > 0 && (
                          <ul className="space-y-3 mt-auto">
                            {m.detalle.map((linea) => (
                              <li key={linea} className="text-sm v2-text-muted leading-[1.7] flex items-start justify-center gap-2.5 text-left">
                                <span className="w-1 h-1 mt-2.5 rounded-full bg-v2-champagne/60 shrink-0" />
                                <span>{linea}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Salón o pick up ── */}
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
                  En el salón <span className="font-normal text-v2-champagne">o para llevar</span>
                </h2>
              </Reveal>

              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { icon: UtensilsCrossed, title: "Salón", desc: mediodia.notaSalon || "Reservá tu mesa y elegí el menú al llegar." },
                  { icon: ShoppingBag, title: "Pick up", desc: mediodia.notaPickup || "Pedilo por WhatsApp y retiralo en el local." },
                ].map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.1}>
                    <div
                      className="flex gap-5 items-start v2-bg-card border border-v2-champagne/12 p-6 md:p-7 hover:border-v2-champagne/25 transition-colors duration-500 h-full"
                      style={{ borderRadius: "18px" }}
                    >
                      <item.icon className="w-5 h-5 shrink-0 mt-0.5 text-v2-champagne" />
                      <div>
                        <h4 className="font-display text-xl mb-1.5">{item.title}</h4>
                        <p className="text-sm v2-text-muted leading-[1.8]">{item.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA final ── */}
          <section className="py-24 md:py-32 px-6 md:px-14 relative border-t border-v2-champagne/10 overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 60%, hsla(270, 50%, 50%, 0.14), transparent 60%)" }}
            />
            <div className="max-w-3xl mx-auto relative text-center">
              <Reveal>
                <p
                  className="font-display font-light mb-10"
                  style={{ fontSize: "clamp(26px, 3.5vw, 40px)" }}
                >
                  El mediodía <span className="font-normal text-v2-champagne">se renueva</span> en Kiku
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
                  <Link to="/reservar?experiencia=kiku_mediodia" className={CTA_CLASSES}>
                    Reservar mediodía
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a href={WHATSAPP_PICKUP_URL} target="_blank" rel="noopener noreferrer" className={CTA_SECUNDARIO}>
                    <MessageCircle className="w-4 h-4" />
                    Pedir para retirar
                  </a>
                </div>
                <p className="text-xs v2-text-dim mt-5">{mediodia.diasTexto}</p>
                <p className="text-base md:text-lg leading-[1.9] v2-text-muted mt-8 max-w-2xl mx-auto">
                  El consumo de sal en exceso es perjudicial para la salud. {libre.agua_texto}
                </p>
              </Reveal>
            </div>
          </section>
        </>
      )}

      <FooterV2 />
    </div>
  );
};

export default Mediodias;
