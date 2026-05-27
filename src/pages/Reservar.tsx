import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import ReservationFormV2 from "@/components/kiku-v2/ReservationFormV2";
import FooterV2 from "@/components/kiku-v2/FooterV2";

/**
 * Página dedicada a reservar (/reservar).
 * Encabezado único + form en modo single-page (fecha + datos visibles juntos,
 * sin wizard de pasos).
 */
const Reservar = () => {
  useLenisScroll();

  useEffect(() => {
    document.body.classList.add("v2-root");
    return () => { document.body.classList.remove("v2-root"); };
  }, []);

  return (
    <div className="min-h-screen bg-v2-bg v2-text">
      <NavbarV2 />

      {/* Encabezado compacto: título único + breadcrumb */}
      <section className="relative pt-28 md:pt-32 pb-2 md:pb-4 px-6 md:px-14 overflow-hidden text-center">
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
            — ご予約 —
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-light tracking-[-0.02em] leading-none"
            style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
          >
            Reservá tu <em className="italic font-normal text-v2-champagne">mesa</em>
          </motion.h1>
        </div>
      </section>

      {/* Form single-page (fecha + datos juntos) */}
      <ReservationFormV2 singlePage />

      <FooterV2 />
    </div>
  );
};

export default Reservar;
