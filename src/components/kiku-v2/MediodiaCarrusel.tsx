import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import type { MediodiaImagen } from "@/hooks/useMediodia";

/**
 * MediodiaCarrusel — las fotos del menú de mediodía del mes.
 *
 * Son placas verticales (4:5, las mismas que van a Instagram), con el menú de
 * cada día escrito. Por eso, además del carrusel, cada foto se puede abrir a
 * pantalla completa para leerla cómoda (lightbox con flechas y teclado).
 *
 * Se adapta a la cantidad: con una sola foto no hay flechas ni puntos; con
 * varias, en desktop se ven ~3 por pantalla y en el celular una y media.
 */
const MediodiaCarrusel = ({ imagenes }: { imagenes: MediodiaImagen[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: imagenes.length > 2,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [abierta, setAbierta] = useState<number | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  // ── Lightbox ─────────────────────────────────────────────────────────────
  const cerrar = useCallback(() => setAbierta(null), []);
  const irA = useCallback(
    (delta: number) =>
      setAbierta((i) => (i === null ? null : (i + delta + imagenes.length) % imagenes.length)),
    [imagenes.length],
  );

  useEffect(() => {
    if (abierta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") irA(1);
      if (e.key === "ArrowLeft") irA(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [abierta, cerrar, irA]);

  const varias = imagenes.length > 1;

  return (
    <>
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6 touch-pan-y">
            {imagenes.map((im, i) => (
              <div
                key={im.url}
                className="shrink-0 basis-[78%] sm:basis-[46%] lg:basis-[31%]"
              >
                <button
                  type="button"
                  onClick={() => setAbierta(i)}
                  aria-label={`Ver en grande: ${im.alt || `menú ${i + 1}`}`}
                  className="group relative block w-full overflow-hidden border border-v2-champagne/15 hover:border-v2-champagne/40 transition-colors duration-500 bg-v2-card"
                  style={{ borderRadius: "20px", aspectRatio: "4 / 5" }}
                >
                  <img
                    src={im.url}
                    alt={im.alt || `Menú de mediodía ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading={i < 3 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.2em] bg-v2-bg/70 backdrop-blur-md border border-v2-champagne/20 text-v2-champagne opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3 h-3" /> Ampliar
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {varias && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Anterior"
              className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full border border-v2-champagne/25 bg-v2-bg/80 backdrop-blur-md text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Siguiente"
              className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full border border-v2-champagne/25 bg-v2-bg/80 backdrop-blur-md text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 mt-8">
              {snaps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollTo(i)}
                  aria-label={`Ir a la foto ${i + 1}`}
                  className="h-1.5 rounded-full transition-all duration-400"
                  style={{
                    width: i === selected ? 28 : 8,
                    background: i === selected ? "hsl(41, 64%, 77%)" : "hsla(41, 64%, 77%, 0.3)",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {abierta !== null && imagenes[abierta] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-v2-bg/95 backdrop-blur-xl p-4 md:p-10"
            onClick={cerrar}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de mediodía en grande"
          >
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 flex items-center justify-center rounded-full border border-v2-champagne/25 text-v2-text hover:bg-v2-champagne hover:text-v2-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {varias && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); irA(-1); }}
                  aria-label="Anterior"
                  className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full border border-v2-champagne/25 bg-v2-bg/60 text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); irA(1); }}
                  aria-label="Siguiente"
                  className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full border border-v2-champagne/25 bg-v2-bg/60 text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <motion.img
              key={imagenes[abierta].url}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              src={imagenes[abierta].url}
              alt={imagenes[abierta].alt || `Menú de mediodía ${abierta + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] max-w-full w-auto object-contain border border-v2-champagne/15 shadow-2xl"
              style={{ borderRadius: "16px" }}
            />

            {varias && (
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[12px] tracking-[0.3em] uppercase text-v2-champagne/80">
                {abierta + 1} / {imagenes.length}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MediodiaCarrusel;
