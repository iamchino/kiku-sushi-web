import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, Store, ChevronRight, Clock, MapPin } from "lucide-react";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import FooterV2 from "@/components/kiku-v2/FooterV2";

/**
 * Página dedicada al inicio del flujo de pedido (/pedir).
 *
 * Muestra las 2 opciones (Delivery / Retiro en local) con el rebranding V2.
 * Al seleccionar, redirige a /pedidos?modo=delivery|takeaway que es la
 * página V1 del catálogo (sigue funcionando intacta).
 */
const Pedir = () => {
  useLenisScroll();

  useEffect(() => {
    document.body.classList.add("v2-root");
    return () => { document.body.classList.remove("v2-root"); };
  }, []);

  return (
    <div className="min-h-screen bg-v2-bg v2-text flex flex-col">
      <NavbarV2 />

      {/* ─── Mini-hero / encabezado ─────────────────────────────── */}
      <section className="relative pt-28 md:pt-32 pb-6 md:pb-10 px-6 md:px-14 overflow-hidden text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top, hsla(270, 50%, 50%, 0.12), transparent 60%)" }}
        />

        <div className="relative max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase v2-text-muted hover:text-v2-champagne transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
            </Link>
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-jp text-xs tracking-[0.4em] text-v2-champagne mb-3 block"
          >
            — ご注文 —
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-light tracking-[-0.02em] leading-none mb-4"
            style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
          >
            Pedí en <em className="italic font-normal text-v2-champagne">casa</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm md:text-base v2-text-muted max-w-xl mx-auto font-light"
          >
            Elegí cómo querés disfrutarlo. La carta de delivery está disponible las 24 horas online.
          </motion.p>
        </div>
      </section>

      {/* ─── Cards de selección ─────────────────────────────────── */}
      <section className="relative flex-1 px-6 md:px-14 pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <OptionCard
            to="/pedidos?modo=delivery"
            icon={<Truck className="w-6 h-6" />}
            overline="— Te lo llevamos —"
            title="Delivery"
            description="Lo enviamos directo a tu domicilio."
            highlight="Envío $3.500"
            iconAccentClass="text-v2-accent"
            delay={0.2}
          />

          <OptionCard
            to="/pedidos?modo=takeaway"
            icon={<Store className="w-6 h-6" />}
            overline="— Lo pasás a buscar —"
            title="Retiro en local"
            description="Pasás a buscarlo cuando esté listo."
            highlight="Sin costo de envío"
            iconAccentClass="text-v2-champagne"
            delay={0.35}
          />
        </div>

        {/* Info extra del local */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-5xl mx-auto mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-[11px] tracking-[0.24em] uppercase v2-text-muted"
        >
          <span className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-v2-champagne" />
            Mar–Dom · 20:00 – 00:00
          </span>
          <span className="hidden sm:inline-block w-px h-3 bg-v2-champagne/20" />
          <span className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-v2-champagne" />
            Callao Bis 139, Rosario
          </span>
        </motion.div>
      </section>

      <FooterV2 />
    </div>
  );
};

// ─── Sub-componente: card de opción ─────────────────────────────────────────
interface OptionCardProps {
  to: string;
  icon: React.ReactNode;
  overline: string;
  title: string;
  description: string;
  highlight: string;
  iconAccentClass: string;
  delay?: number;
}

const OptionCard = ({
  to, icon, overline, title, description, highlight, iconAccentClass, delay = 0,
}: OptionCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    <Link
      to={to}
      className="group relative block bg-v2-card/60 border border-v2-champagne/20 backdrop-blur-xl p-7 md:p-9 overflow-hidden hover:border-v2-champagne/60 hover:-translate-y-1 transition-all duration-500"
    >
      {/* Glow violeta al hover */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 opacity-0 group-hover:opacity-100 blur-3xl pointer-events-none transition-opacity duration-700"
        style={{ background: "radial-gradient(circle, hsla(270, 50%, 50%, 0.35), transparent 70%)" }}
      />

      <div className="relative">
        {/* Icon container */}
        <div className="w-14 h-14 rounded-full bg-v2-bg/60 border border-v2-champagne/30 flex items-center justify-center mb-7 group-hover:border-v2-champagne transition-colors">
          <span className={iconAccentClass}>{icon}</span>
        </div>

        {/* Overline editorial */}
        <p className="text-[10px] tracking-[0.4em] uppercase text-v2-champagne/70 mb-3">
          {overline}
        </p>

        {/* Title */}
        <h2
          className="font-display font-light tracking-[-0.01em] leading-none mb-3"
          style={{ fontSize: "clamp(32px, 3.6vw, 44px)" }}
        >
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm v2-text-muted mb-6 leading-relaxed">
          {description}
        </p>

        {/* Footer row: highlight + arrow */}
        <div className="flex items-center justify-between pt-5 border-t border-v2-champagne/10">
          <p className="text-[11px] tracking-[0.24em] uppercase text-v2-champagne font-medium">
            {highlight}
          </p>
          <span className="flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase v2-text-muted group-hover:text-v2-champagne transition-colors">
            Continuar
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default Pedir;
