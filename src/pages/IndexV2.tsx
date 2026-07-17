import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import HeroV2 from "@/components/kiku-v2/HeroV2";
import NovedadShowcase from "@/components/kiku-v2/NovedadShowcase";
import OmakaseShowcase from "@/components/kiku-v2/OmakaseShowcase";
import EspecialesSection from "@/components/kiku-v2/EspecialesSection";
import KikuLibreShowcase from "@/components/kiku-v2/KikuLibreShowcase";
import ItamaeSection from "@/components/kiku-v2/ItamaeSection";
import ReservationFormV2 from "@/components/kiku-v2/ReservationFormV2";
import TestimonialsCinema from "@/components/kiku-v2/TestimonialsCinema";
import FooterV2 from "@/components/kiku-v2/FooterV2";

/**
 * Index V2 — la nueva landing.
 * Estructura:
 *   Hero (video + parallax)
 *   Nuevo — el plato del momento, editable desde el dashboard (se auto-oculta)
 *   Omakase — showcase full-width (la estrella)
 *   Especiales de Kiku — scroll horizontal (Umami del Sur · Pacífico y Patagonia · Kiku Otoñal)
 *   Kiku Libre — showcase full-width (foto propia de fondo)
 *   Itamae
 *   Testimonios
 *   Form de reserva (Supabase + WhatsApp)
 *   Footer
 *
 * Smooth scroll via Lenis. Animations via Framer Motion.
 * Reading-progress bar arriba.
 */
const IndexV2 = () => {
  useLenisScroll();

  // Si llegamos con un hash (/#umami desde otra página), scrollear a esa sección
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => clearTimeout(t);
  }, [location.hash]);

  // Reading-progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Aplicar la clase v2-root al body mientras esta página está montada
  useEffect(() => {
    document.body.classList.add("v2-root");
    return () => { document.body.classList.remove("v2-root"); };
  }, []);

  return (
    <div className="v2-root min-h-screen overflow-x-hidden">
      {/* Reading-progress bar */}
      <motion.div
        className="v2-progress-bar w-full"
        style={{ scaleX }}
      />

      <NavbarV2 />
      <HeroV2 />

      {/* El plato del momento. Contenido y visibilidad se manejan desde el
          dashboard (/menu → tab "Nuevo"). Si está apagada, no renderiza nada. */}
      <NovedadShowcase />

      {/* La estrella de Kiku */}
      <OmakaseShowcase />

      {/* Especiales rotativos — scroll horizontal */}
      <EspecialesSection />

      {/* Kiku Libre — showcase full-width con foto propia */}
      <KikuLibreShowcase />

      <ItamaeSection />
      <TestimonialsCinema />
      <ReservationFormV2 />
      <FooterV2 />
    </div>
  );
};

export default IndexV2;
