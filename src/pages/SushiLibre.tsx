import { ChevronRight, Sparkles, AlertTriangle, Info, Accessibility } from "lucide-react";
import Navbar from "@/components/kiku/Navbar";
import { useReveal } from "@/hooks/useReveal";
import ambiance from "@/assets/ambiance.webp";

const WHATSAPP_URL = `https://wa.me/5493412764562?text=${encodeURIComponent(
  "Hola Kiku Sushi 🍣, quiero reservar *Kiku Libre*.\n\n📅 Fecha deseada: \n👥 Cantidad de personas: \n\n¡Quedo a la espera de su confirmación!"
)}`;

const SushiLibre = () => {
  useReveal();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <img src={ambiance} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background" />
        <div className="absolute -top-40 -left-40 w-[50rem] h-[50rem] bg-glow opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-glow opacity-40 blur-3xl pointer-events-none" />

        <div className="container relative z-10 text-center max-w-4xl pt-12 pb-6">
          <span className="font-jp text-accent text-sm tracking-widest">— 食べ放題 —</span>
          <h1 className="font-display text-6xl sm:text-8xl mt-4 mb-4 glow-text-soft leading-[0.9]">
            Kiku <span className="text-gradient-neon italic">Libre</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8 font-light">
            Sushi ilimitado. Repetí todas las rondas que quieras.
          </p>

          {/* Price */}
          <div className="inline-flex flex-col items-center bg-card/40 backdrop-blur-sm border border-border/40 rounded-3xl px-10 py-8 mb-8">
            <p className="font-display text-4xl md:text-5xl text-gradient-neon mb-1 pr-2">$53.500</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              por persona · no incluye bebida
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-2">
              Efectivo o transferencia · Otro medio de pago consultar
            </p>
          </div>

          <div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-neon text-primary-foreground font-semibold uppercase tracking-widest text-sm px-10 py-4 rounded-full glow-neon hover:scale-105 transition-transform"
            >
              Reservar Kiku Libre <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 md:py-28">
        <div className="container max-w-5xl">
          <div className="text-center mb-16 reveal">
            <Sparkles className="w-5 h-5 text-accent mx-auto mb-3" />
            <h2 className="font-display text-4xl md:text-5xl glow-text-soft">
              ¿Cómo <span className="text-gradient-neon italic">funciona</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 reveal">
            {[
              {
                step: "01",
                title: "Appetizer",
                desc: "Arrancás con un escabeche de vegetales y langostinos ahumados para abrir el paladar.",
              },
              {
                step: "02",
                title: "Rondas de 10 piezas",
                desc: "Elegí entre las variedades Kiku, Fusión o Exotic. Repetí todas las veces que quieras.",
              },
              {
                step: "03",
                title: "Sin límites",
                desc: "Podés pedir otra ronda cuando termines la anterior. No hay tope de rondas.",
              },
            ].map((s, i) => (
              <div key={i} className="relative bg-gradient-card border border-border rounded-2xl p-8 hover:border-primary/40 transition-all duration-500">
                <span className="font-display text-6xl text-primary/10 absolute top-4 right-6">{s.step}</span>
                <h3 className="font-display text-2xl mb-3 relative">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed relative">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Varieties ── */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent" />
        <div className="container max-w-4xl relative">
          <div className="text-center mb-14 reveal">
            <h2 className="font-display text-4xl md:text-5xl glow-text-soft">
              Las <span className="text-gradient-neon italic">variedades</span>
            </h2>
            <p className="text-muted-foreground mt-3 text-sm">
              Cada ronda se sirve de a 10 piezas. Elegí tu combinado favorito.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 reveal">
            {[
              {
                name: "Kiku",
                rolls: ["Ebi Roll", "Philadelphia Roll", "Ahumado Roll", "New York Roll"],
                accent: "from-purple-500/20 to-pink-500/20",
              },
              {
                name: "Fusión",
                rolls: ["Sake Roll", "Tartar Sake Roll", "Guacamole Roll", "Ebi Roll", "Spicy Roll"],
                accent: "from-pink-500/20 to-orange-500/20",
              },
              {
                name: "Exotic",
                rolls: ["Phila Nipón Roll", "Fancy Roll", "Ebi Mango Roll", "Niguiri Thai"],
                accent: "from-blue-500/20 to-purple-500/20",
              },
            ].map((v, i) => (
              <div
                key={i}
                className="border border-border rounded-2xl p-7 bg-gradient-card hover:border-primary/40 transition-all duration-500 text-center"
              >
                <h3 className="font-display text-3xl mb-5 text-gradient-neon">{v.name}</h3>
                <ul className="space-y-2.5">
                  {v.rolls.map((r) => (
                    <li key={r} className="text-sm text-foreground/80 flex items-center justify-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Important info ── */}
      <section className="py-20 md:py-28">
        <div className="container max-w-3xl">
          <div className="text-center mb-14 reveal">
            <h2 className="font-display text-4xl md:text-5xl">
              Información <span className="text-gradient-neon italic">importante</span>
            </h2>
          </div>

          <div className="space-y-5 reveal">
            {/* Seña */}
            <div className="flex gap-4 items-start bg-gradient-card border border-border rounded-2xl p-6">
              <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-lg mb-1">Seña de $20.000 por persona</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para reservar se requiere una seña por persona. En caso de no asistir, la seña no es reembolsable.
                </p>
              </div>
            </div>

            {/* Rondas */}
            <div className="flex gap-4 items-start bg-gradient-card border border-border rounded-2xl p-6">
              <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-lg mb-1">Rondas ilimitadas</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Podés repetir todas las veces que quieras, siempre que la ronda anterior haya sido consumida en su totalidad.
                </p>
              </div>
            </div>

            {/* Restricciones */}
            <div className="flex gap-4 items-start bg-gradient-card border border-border rounded-2xl p-6">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-lg mb-1">Restricciones alimenticias</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Si tenés alguna restricción alimenticia, la carta del salón está disponible para consumo.
                  No se pueden modificar las variedades de sushi del libre.
                </p>
              </div>
            </div>

            {/* Accesibilidad */}
            <div className="flex gap-4 items-start bg-gradient-card border border-border rounded-2xl p-6">
              <Accessibility className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-lg mb-1">Accesibilidad</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Si tenés alguna restricción de movilidad, avisanos para adaptar el lugar y que todos estén cómodos.
                </p>
              </div>
            </div>

            {/* Multa */}
            <div className="flex gap-4 items-start bg-gradient-card border border-border rounded-2xl p-6">
              <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-lg mb-1">Política anti-desperdicio</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Si al finalizar la cena quedan piezas de sushi sin consumir, se cobrará una multa de $1.000 por cada una.
                  ¡Pedí con conciencia! 🍣
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Availability + CTA ── */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-glow opacity-30 blur-3xl pointer-events-none" />
        <div className="container max-w-3xl relative text-center reveal">
          <div className="bg-gradient-card border border-border rounded-3xl p-10 md:p-14 mb-10">
            <h3 className="font-display text-2xl md:text-3xl mb-3">Disponibilidad</h3>
            <p className="text-muted-foreground mb-1">
              <span className="text-foreground font-medium">Martes, Miércoles y Jueves</span> de cada mes
            </p>
            <p className="text-sm text-muted-foreground">
              De 20:00 a 23:40 hs (cierra la barra de sushi)
            </p>
          </div>

          <Sparkles className="w-5 h-5 text-accent mx-auto mb-4" />
          <p className="font-display text-2xl md:text-3xl mb-8 glow-text-soft">
            ¿Listos para comer <span className="text-gradient-neon italic">sin límites</span>?
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-neon text-primary-foreground font-semibold uppercase tracking-widest text-sm px-10 py-4 rounded-full glow-neon hover:scale-105 transition-transform"
          >
            Reservar Kiku Libre <ChevronRight className="w-5 h-5" />
          </a>
          <p className="text-xs text-muted-foreground mt-4">Seña de $20.000 por persona requerida</p>
        </div>
      </section>
    </div>
  );
};

export default SushiLibre;
