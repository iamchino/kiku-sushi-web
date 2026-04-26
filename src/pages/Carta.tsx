import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Loader2, Sparkles, UtensilsCrossed } from "lucide-react";
import Navbar from "@/components/kiku/Navbar";
import { fallbackCartaData, fetchCartaFromSheet, type CartaSection } from "@/data/cartaSalon";

const Carta = () => {
  const [sections, setSections] = useState<CartaSection[]>(fallbackCartaData);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

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
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute -top-40 -left-40 w-[50rem] h-[50rem] bg-glow opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-glow opacity-40 blur-3xl pointer-events-none" />

        <div className="container relative z-10 text-center max-w-3xl pt-10 pb-6">
          <span className="font-jp text-accent text-sm tracking-widest">— お品書き —</span>
          <h1 className="font-display text-5xl sm:text-7xl mt-4 mb-3 glow-text-soft">
            Carta <span className="text-gradient-neon italic">Salón</span>
          </h1>
          <p className="text-muted-foreground mb-2">
            Descubrí nuestra propuesta nikkei en cada plato.
          </p>
          <p className="text-xs text-accent/80 flex items-center justify-center gap-1.5">
            <UtensilsCrossed className="w-3 h-3" /> Cubiertos $3.500
          </p>
        </div>
      </section>

      {/* ── Sticky search + pills ── */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40 py-4">
        <div className="container">
          {/* Search */}
          <div className="relative max-w-xl mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar en la carta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/60 border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveSection(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-all ${
                !activeSection
                  ? "bg-gradient-neon text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {sections.map((s) => (
              <button
                key={s.name}
                onClick={() => scrollToSection(s.name)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-all ${
                  activeSection === s.name
                    ? "bg-gradient-neon text-primary-foreground border-transparent"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu content ── */}
      <section className="py-12">
        <div className="container max-w-5xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-muted-foreground text-sm">Cargando carta...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No se encontraron platos para "{searchQuery}"
              </p>
            </div>
          ) : (
            filtered.map((section, sIdx) => (
              <div
                key={section.name}
                ref={(el) => { if (el) sectionRefs.current.set(section.name, el); }}
                className="mb-16 scroll-mt-40 animate-fade-up"
                style={{ animationDelay: `${sIdx * 60}ms` }}
              >
                {/* Section header */}
                <div className="relative mb-8">
                  <div className="flex items-end gap-4">
                    <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
                      {section.name}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-transparent mb-2" />
                  </div>
                  {section.subtitle && (
                    <p className="text-sm text-accent/70 mt-1 font-light tracking-wide">
                      {section.subtitle}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {section.items.map((item, iIdx) => (
                    <div
                      key={item.id}
                      className="group relative flex gap-4 items-start py-4 px-4 -mx-4 rounded-2xl hover:bg-card/60 transition-all duration-300"
                      style={{ animationDelay: `${(sIdx * 60) + (iIdx * 30)}ms` }}
                    >
                      {/* Thumbnail */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shrink-0 border border-border/50"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl shrink-0 bg-gradient-to-br from-primary/10 to-accent/10 border border-border/40 flex items-center justify-center">
                          <span className="font-jp text-2xl text-primary/25">菊</span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display text-xl md:text-2xl text-foreground group-hover:text-gradient-neon transition-all duration-300">
                                {item.name}
                              </h3>
                              {item.badge && (
                                <span className="px-2 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[9px] uppercase tracking-widest font-semibold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-1 max-w-xl">
                              {item.description}
                            </p>
                          </div>

                          {/* Price */}
                          {item.price && (
                            <span className="text-sm md:text-base font-semibold text-gradient-neon whitespace-nowrap pt-1 font-display shrink-0">
                              {item.price}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Subtle line separator */}
                      <div className="absolute bottom-0 left-4 right-4 h-px bg-border/30 group-last:hidden" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="py-16 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="container relative z-10">
          <Sparkles className="w-5 h-5 text-accent mx-auto mb-3" />
          <p className="font-display text-2xl md:text-3xl mb-6 glow-text-soft">
            ¿Listo para vivir la <span className="text-gradient-neon italic">experiencia Kiku</span>?
          </p>
          <a
            href="/#reservar"
            className="inline-flex items-center gap-2 bg-gradient-neon text-primary-foreground font-semibold uppercase tracking-widest text-sm px-8 py-4 rounded-full glow-neon hover:scale-105 transition-transform"
          >
            Reservar mesa
          </a>
        </div>
      </section>
    </div>
  );
};

export default Carta;
