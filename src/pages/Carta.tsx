import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, UtensilsCrossed, X } from "lucide-react";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import FooterV2 from "@/components/kiku-v2/FooterV2";
import { fallbackCartaData, fetchCartaFromSheet, type CartaSection, type CartaItem } from "@/data/cartaSalon";

const Carta = () => {
  const [sections, setSections] = useState<CartaSection[]>(fallbackCartaData);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [zoomItem, setZoomItem] = useState<CartaItem | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Aplicar la estética v2 mientras esta página está montada
  useEffect(() => {
    document.body.classList.add("v2-root");
    return () => { document.body.classList.remove("v2-root"); };
  }, []);

  // Cerrar la imagen ampliada con Escape
  useEffect(() => {
    if (!zoomItem) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomItem(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomItem]);

  useEffect(() => {
    fetchCartaFromSheet()
      .then((d) => setSections(d))
      .catch(() => setSections(fallbackCartaData))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let data = sections;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data
        .map((s) => ({
          ...s,
          items: s.items.filter(
            (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
          ),
        }))
        .filter((s) => s.items.length > 0);
    }
    if (activeSection) {
      data = data.filter((s) => s.name === activeSection);
    }
    return data;
  }, [searchQuery, activeSection, sections]);

  const scrollToSection = (name: string) => {
    setActiveSection(name === activeSection ? null : name);
    const el = sectionRefs.current.get(name);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="v2-root min-h-screen overflow-x-hidden v2-bg-base">
      <NavbarV2 />

      {/* ── Hero ── */}
      <section className="relative pt-32 md:pt-40 pb-12 px-6 md:px-14 text-center">
        <span className="font-jp text-xs tracking-[0.4em] text-v2-champagne mb-5 block">
          — お品書き —
        </span>
        <h1 className="font-display font-light tracking-[-0.02em] leading-none text-5xl md:text-7xl text-v2-text">
          Carta <em className="italic font-normal text-v2-champagne">Salón</em>
        </h1>
        <p className="v2-text-muted text-base leading-[1.85] max-w-xl mx-auto mt-6">
          Nuestra propuesta nikkei completa para disfrutar en el salón.
        </p>
        <p className="text-[11px] uppercase tracking-[0.24em] text-v2-champagne/80 flex items-center justify-center gap-2 mt-5">
          <UtensilsCrossed className="w-3.5 h-3.5" /> Cubiertos $3.500
        </p>
      </section>

      {/* ── Sticky search + pills ── */}
      <div className="sticky top-16 md:top-20 z-30 v2-bg-base/90 backdrop-blur-lg border-y border-v2-champagne/10 py-4">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          {/* Search */}
          <div className="relative max-w-xl mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-v2-champagne/60" />
            <input
              type="text"
              placeholder="Buscar en la carta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full v2-bg-card border border-v2-champagne/15 rounded-full pl-11 pr-4 py-3 text-sm text-v2-text placeholder:text-v2-text-dim outline-none focus:border-v2-champagne/50 transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveSection(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] border transition-all ${
                !activeSection
                  ? "bg-v2-champagne text-v2-bg border-transparent"
                  : "border-v2-champagne/20 text-v2-text-muted hover:border-v2-champagne/50 hover:text-v2-text"
              }`}
            >
              Todos
            </button>
            {sections.map((s) => (
              <button
                key={s.name}
                onClick={() => scrollToSection(s.name)}
                className={`shrink-0 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] border transition-all whitespace-nowrap ${
                  activeSection === s.name
                    ? "bg-v2-champagne text-v2-bg border-transparent"
                    : "border-v2-champagne/20 text-v2-text-muted hover:border-v2-champagne/50 hover:text-v2-text"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu content ── */}
      <section className="py-14 px-6 md:px-14">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-v2-champagne animate-spin" />
              <p className="v2-text-muted text-sm">Cargando carta...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="v2-text-muted text-lg">
                No se encontraron platos para "{searchQuery}"
              </p>
            </div>
          ) : (
            filtered.map((section) => (
              <div
                key={section.name}
                ref={(el) => { if (el) sectionRefs.current.set(section.name, el); }}
                className="mb-16 scroll-mt-40"
              >
                {/* Section header */}
                <div className="relative mb-8">
                  <div className="flex items-end gap-4">
                    <h2 className="font-display font-light text-4xl md:text-5xl text-v2-text leading-tight">
                      {section.name}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-v2-champagne/40 to-transparent mb-3" />
                  </div>
                  {section.subtitle && (
                    <p className="text-xs uppercase tracking-[0.2em] text-v2-champagne/70 mt-2">
                      {section.subtitle}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div>
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex gap-5 items-start py-5 border-b border-v2-champagne/10 last:border-b-0"
                    >
                      {/* Thumbnail */}
                      {item.image ? (
                        <button
                          type="button"
                          onClick={() => setZoomItem(item)}
                          className="shrink-0 rounded-lg overflow-hidden cursor-zoom-in"
                          aria-label={`Ampliar imagen de ${item.name}`}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 md:w-24 md:h-24 object-cover border border-v2-champagne/15 transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                          />
                        </button>
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg shrink-0 v2-bg-card border border-v2-champagne/10 flex items-center justify-center">
                          <span className="font-jp text-2xl text-v2-champagne/25">菊</span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display text-xl md:text-2xl text-v2-text group-hover:text-v2-champagne transition-colors duration-300">
                                {item.name}
                              </h3>
                              {item.badge && (
                                <span className="px-2 py-0.5 rounded-full border border-v2-champagne/30 text-v2-champagne text-[9px] uppercase tracking-widest font-semibold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs md:text-sm v2-text-muted leading-relaxed mt-1.5 max-w-xl">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Price */}
                          {item.price && (
                            <span className="text-base md:text-lg text-v2-champagne whitespace-nowrap pt-1 font-display shrink-0">
                              {item.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      {/* ── Notas ── */}
      <section className="px-6 pb-2">
        <div className="max-w-3xl mx-auto border-t border-v2-champagne/10 pt-8">
          <ul className="text-[11px] leading-[2] v2-text-dim space-y-1">
            <li>· Servicio de mesa: $3.500 · solo a la carta de salón.</li>
            <li>· El consumo de sal en exceso es perjudicial para la salud.</li>
            <li>· Este establecimiento garantiza a cada comensal un vaso de agua potable de 375 ml sin cargo.</li>
          </ul>
        </div>
      </section>


      {/* ── CTA ── */}
      <section className="py-16 text-center px-6">
        <p className="font-display font-light text-3xl md:text-4xl text-v2-text mb-7">
          ¿Listo para vivir la <span className="text-v2-champagne">experiencia Kiku</span>?
        </p>
        <Link
          to="/reservar"
          className="inline-flex items-center bg-v2-champagne text-v2-bg px-9 py-4 text-[11px] uppercase tracking-[0.24em] font-medium hover:bg-v2-text hover:-translate-y-px transition-all duration-300"
        >
          Reservá tu mesa
        </Link>
      </section>

      {/* ── Imagen ampliada ── */}
      {zoomItem && zoomItem.image && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={() => setZoomItem(null)}
        >
          <div className="absolute inset-0 bg-v2-bg/90 backdrop-blur-md" />
          <div
            className="relative w-full max-w-lg v2-bg-card border border-v2-champagne/15 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomItem(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-v2-bg/70 border border-v2-champagne/25 flex items-center justify-center text-v2-text-muted hover:text-v2-text transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={zoomItem.image}
              alt={zoomItem.name}
              className="w-full max-h-[55vh] object-contain bg-black/30"
            />

            <div className="p-6">
              {zoomItem.badge && (
                <span className="inline-block mb-2 px-2.5 py-0.5 rounded-full border border-v2-champagne/30 text-v2-champagne text-[10px] uppercase tracking-wider font-semibold">
                  {zoomItem.badge}
                </span>
              )}
              <h3 className="font-display text-2xl text-v2-text mb-2">{zoomItem.name}</h3>
              {zoomItem.description && (
                <p className="text-sm v2-text-muted leading-relaxed mb-4">
                  {zoomItem.description}
                </p>
              )}
              {zoomItem.price && (
                <span className="text-lg font-display text-v2-champagne">
                  {zoomItem.price}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <FooterV2 />
    </div>
  );
};

export default Carta;
