import { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import HeroV2 from "@/components/kiku-v2/HeroV2";
import MenuPanel from "@/components/kiku-v2/MenuPanel";
import ItamaeSection from "@/components/kiku-v2/ItamaeSection";
import AboutSection from "@/components/kiku-v2/AboutSection";
import ReservationFormV2 from "@/components/kiku-v2/ReservationFormV2";
import TestimonialsCinema from "@/components/kiku-v2/TestimonialsCinema";
import FooterV2 from "@/components/kiku-v2/FooterV2";

import nigiri from "@/assets/unnamed.webp";
import sushiFlowers from "@/assets/sushi-flowers.webp";
import ambiance from "@/assets/ambiance.webp";
import signatureRoll from "@/assets/signature-roll.webp";

/**
 * Index V2 — la nueva landing.
 * Estructura:
 *   Hero (video + parallax)
 *   01 — Umami del Sur (img izq)
 *   02 — Pacífico y Patagonia (img der)
 *   03 — Omakase (img izq)
 *   04 — Kiku Libre (img der)
 *   Itamae
 *   About — Te recibimos
 *   Form de reserva (Supabase + WhatsApp)
 *   Footer
 *
 * Smooth scroll via Lenis. Animations via Framer Motion.
 * Reading-progress bar arriba.
 */
const IndexV2 = () => {
  useLenisScroll();

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

      {/* 4 paneles zig-zag */}
      <MenuPanel
        id="umami"
        number="01 / 04"
        overline="— 南の旨味 —"
        title="Umami"
        titleAccent="del Sur"
        description="Cortes argentinos pasados por técnica japonesa. Tartare de lomo con yuzu, gyozas de lechón ahumado, tiraditos con ají amarillo de los Andes. Una línea para quien viene buscando sushi y se queda por la cocina caliente."
        ctaLabel="Conocer la línea"
        ctaHref="/umami-del-sur"
        image={nigiri}
        imageAlt="Nigiris de la línea Umami del Sur"
        imagePosition="left"
      />

      <MenuPanel
        id="pacifico"
        number="02 / 04"
        overline="— 太平洋 と パタゴニア —"
        title="Pacífico"
        titleAccent="y Patagonia"
        description="Salmón patagónico seleccionado cada mañana. Pesca del Pacífico cuando la temporada acompaña. Nuestros sashimis y nigiris nacen de una obsesión: el corte limpio, el brillo del pescado fresco, la temperatura justa del arroz."
        ctaLabel="Ver el origen"
        ctaHref="/pacifico-patagonia"
        image={sushiFlowers}
        imageAlt="Roll con flores comestibles y pescados premium"
        imagePosition="right"
      />

      <MenuPanel
        id="omakase"
        number="03 / 04"
        overline="— おまかせ —"
        title=""
        titleAccent="Omakase"
        description='"Me pongo en tus manos." Diez pasos de cocina en vivo en la barra del itamae. Sake o whisky al cierre, entradas y sushi de autor, postre y bebida incluidos. No hay menú fijo. Solo sentarte, confiar y dejarte sorprender.'
        ctaLabel="Reservar Omakase"
        ctaHref="/omakase"
        image={ambiance}
        imageAlt="Ambiente íntimo de la barra del Omakase"
        imagePosition="left"
      />

      <MenuPanel
        id="kiku-libre"
        number="04 / 04"
        overline="— 食べ放題 —"
        title="Kiku"
        titleAccent="Libre"
        description="Sushi ilimitado. Repetí todas las rondas que quieras: Kiku, Fusión o Exotic. Empezás con un escabeche de vegetales y langostinos ahumados, seguís con rondas de diez piezas. $53.500 por persona, no incluye bebida."
        ctaLabel="Ver detalles"
        ctaHref="/sushi-libre"
        image={signatureRoll}
        imageAlt="Roll signature del Kiku Libre"
        imagePosition="right"
      />

      <ItamaeSection />
      <AboutSection />
      <TestimonialsCinema />
      <ReservationFormV2 />
      <FooterV2 />
    </div>
  );
};

export default IndexV2;
