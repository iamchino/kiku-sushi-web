import { Star, Flame, Sparkles, MapPin, Clock, Phone, Instagram, ChevronRight } from "lucide-react";
import Navbar from "@/components/kiku/Navbar";
import StickyCTA from "@/components/kiku/StickyCTA";
import ReservationForm from "@/components/kiku/ReservationForm";
import { useReveal } from "@/hooks/useReveal";
import heroSushi from "@/assets/hero-sushi.webp";
import sushiFlowers from "@/assets/sushi-flowers.webp";
import ambiance from "@/assets/ambiance.webp";
import nigiri from "@/assets/unnamed.webp";
import signatureRoll from "@/assets/signature-roll.webp";
import chef from "@/assets/chef-plating.webp";

const Index = () => {
  useReveal();

  return (
    <div id="top" className="min-h-screen overflow-x-hidden">
      <Navbar />
      <StickyCTA />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16">
        <img
          src={heroSushi}
          alt="Sushi premium con flores comestibles bañado en luz neón en Kiku Sushi"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] bg-glow opacity-70 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[40rem] h-[40rem] bg-glow opacity-50 blur-3xl pointer-events-none" />

        <div className="container relative z-10 text-center">
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-light leading-[0.95] mb-6 animate-fade-up glow-text-soft mt-8">
            EL SUSHI MÁS<br />
            <span className="text-gradient-neon italic font-medium pr-2">exclusivo</span> DE LA CIUDAD
          </h1>

          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up font-light">
            Una experiencia gastronómica única. Estética japonesa, sabores que despiertan los sentidos.
          </p>

          <div id="reservar" className="animate-fade-up scroll-mt-24">
            <ReservationForm />
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground animate-fade-up">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" /> 4.7 · +200 reseñas
            </span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-border" />
            <span className="hidden sm:inline">Plazas limitadas esta semana</span>
          </div>
        </div>
      </section>

      {/* PRUEBA VISUAL — DESEO */}
      <section className="py-24 md:py-32 relative">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-16 reveal">
            <div className="text-center md:text-left">
              <span className="font-jp text-accent text-sm tracking-widest">— 視覚的な誘惑 —</span>
              <h2 className="font-display text-4xl md:text-6xl mt-4">
                Cada plato, una obra de <em className="text-gradient-neon not-italic">arte</em>
              </h2>
            </div>
            <a href="/carta" className="text-sm md:text-base font-semibold uppercase tracking-widest text-accent hover:text-foreground transition-all flex items-center gap-2 px-6 py-3 rounded-full border border-accent/40 hover:bg-accent/10">
              Ver carta completa <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          <div className="grid grid-cols-12 gap-3 md:gap-5">
            <GalleryImg src={sushiFlowers} alt="Roll con flores comestibles y oro" className="col-span-6 md:col-span-5 aspect-[4/5]" />
            <GalleryImg src={ambiance} alt="Ambiente nocturno de Kiku Sushi" className="col-span-6 md:col-span-7 aspect-[4/5] md:aspect-auto" />
            <GalleryImg src={nigiri} alt="Plato premium de nigiri" className="col-span-12 md:col-span-7 aspect-[16/10]" />
            <GalleryImg src={chef} alt="Chef emplatando con luz neón" className="col-span-12 md:col-span-5 aspect-[16/10]" />
          </div>
        </div>
      </section>

      {/* TRANSICIÓN JAPONESA */}
      <div className="w-full overflow-hidden flex justify-center py-6 md:py-8 select-none pointer-events-none reveal">
        <span className="font-jp text-lg md:text-xl tracking-[0.1em] text-purple-400/50 whitespace-nowrap">
          今月のおすすめロール
        </span>
      </div>

      {/* PRODUCTO ESTRELLA */}
      <section id="carta" className="py-16 md:py-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-glow opacity-40 blur-3xl pointer-events-none" />
        <div className="container grid md:grid-cols-2 gap-12 md:gap-20 items-center relative">
          <div className="reveal relative">
            <div className="absolute -inset-4 bg-gradient-neon opacity-30 blur-3xl rounded-full" />
            <img
              src={signatureRoll}
              alt="Ahumado de Maracuyá Roll, plato estrella de Kiku Sushi"
              className="relative rounded-3xl w-full animate-float-slow shadow-[0_30px_80px_-20px_hsl(280_100%_50%/0.6)]"
              loading="lazy"
              width={1280}
              height={1280}
            />
          </div>
          <div className="reveal">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Signature Roll
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-none mb-6">
              Ahumado de<br />
              <span className="text-gradient-neon italic">Maracuyá</span> Roll
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 font-light">
              Salmón flameado al carbón japonés, perlas de maracuyá explotando en boca, queso crema trufado
              y un toque cítrico que cambia el juego. Una creación que solo encontrarás aquí.
            </p>
            <div className="flex flex-wrap gap-3 mb-10 text-xs uppercase tracking-wider text-muted-foreground">
              {["Salmón flameado", "Maracuyá", "Trufa", "Edición limitada"].map(t => (
                <span key={t} className="px-3 py-1.5 rounded-full border border-border bg-card/40">{t}</span>
              ))}
            </div>
            <a
              href="pedidos"
              className="inline-flex items-center gap-2 bg-gradient-neon text-primary-foreground font-semibold uppercase tracking-widest text-sm px-8 py-4 rounded-full glow-neon hover:scale-105 transition-transform"
            >
              Hace un pedido <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* OMAKASE */}
      <section id="experiencia" className="py-24 md:py-36 relative overflow-hidden">
        <img src={ambiance} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />

        <div className="container relative max-w-4xl reveal">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="font-jp text-accent text-sm tracking-widest">— おまかせ —</span>
            <h2 className="font-display text-5xl md:text-7xl mt-4 leading-[0.95] glow-text-soft">
              <em className="text-gradient-neon not-italic">Omakase</em>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl mt-4 font-display italic">
              "Me pongo en tus manos"
            </p>
          </div>

          {/* Description */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-5">
            <p className="text-foreground/90 leading-relaxed">
              Entregarse al arte, al instante, a lo que hoy tenemos para vos.
              Nuestra barra es el corazón del local — nuestro itamae te recibe con la mirada atenta,
              las manos entrenadas y un profundo respeto por el producto del día.
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              No hay menú fijo. No hay decisiones que tomar.
              Solo sentarte, confiar y dejarte sorprender.
            </p>
          </div>

          {/* Features (No icons) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
            {[
              { label: "10 pasos", sub: "de cocina en vivo" },
              { label: "Sake o Whisky", sub: "al finalizar" },
              { label: "Entradas + Sushi", sub: "delux de autor" },
              { label: "Postre + Bebida", sub: "incluidos" },
            ].map((f, i) => (
              <div key={i} className="text-center p-5 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm flex flex-col justify-center min-h-[100px]">
                <div className="font-display text-lg text-foreground">{f.label}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{f.sub}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-6">
            <a
              href={`https://wa.me/5493412764562?text=${encodeURIComponent("Hola Kiku Sushi 🍣, quiero reservar la experiencia *Omakase*.\n\n📅 Fecha deseada: \n👥 Cantidad de personas: \n\n¡Quedo a la espera de su confirmación!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-neon text-primary-foreground font-semibold uppercase tracking-widest text-sm px-8 py-4 rounded-full glow-neon hover:scale-105 transition-transform"
            >
              Reservar Omakase
            </a>
          </div>
        </div>
      </section>

      {/* KIKU LIBRE PROMO */}
      <section className="py-24 md:py-32 relative">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12 reveal">
            <div className="text-center md:text-left">
              <span className="font-jp text-accent text-sm tracking-widest">— 食べ放題 —</span>
              <h2 className="font-display text-4xl md:text-6xl mt-3">
                Kiku <em className="text-gradient-neon not-italic">Libre</em>
              </h2>
              <p className="text-muted-foreground mt-3 text-lg font-light">Sushi ilimitado. Repetí todas las rondas que quieras.</p>
            </div>
            <a href="/sushi-libre" className="text-sm md:text-base font-semibold uppercase tracking-widest text-accent hover:text-foreground transition-all flex items-center gap-2 px-6 py-3 rounded-full border border-accent/40 hover:bg-accent/10 shrink-0">
              Ver detalles <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-5 reveal">
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
              <article key={i} className="group relative bg-gradient-card border border-accent/30 rounded-2xl p-8 overflow-hidden hover:border-accent/60 transition-all duration-500">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-neon blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -inset-20 bg-glow opacity-50 blur-3xl pointer-events-none transition-opacity group-hover:opacity-80" />
                <span className="font-display text-6xl text-accent/15 absolute top-4 right-6 transition-transform duration-500 group-hover:scale-110 group-hover:text-accent/30 pointer-events-none">{s.step}</span>
                <div className="relative z-10">
                  <h3 className="font-display text-3xl mb-3">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* URGENCIA */}
      <section className="py-20 relative">
        <div className="container">
          <div className="reveal relative bg-gradient-card border border-accent/30 rounded-3xl p-10 md:p-14 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-neon blur-md" />
            <div className="absolute -inset-20 bg-glow opacity-50 blur-3xl pointer-events-none" />
            <div className="relative">
              <Flame className="w-8 h-8 text-accent mx-auto mb-4 animate-pulse-glow rounded-full" />
              <h3 className="font-display text-3xl md:text-5xl mb-4">
                Alta demanda los <span className="text-gradient-neon italic">fines de semana</span>
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Reserva con antelación para asegurar tu mesa. Los viernes y sábados se llenan
                con 3-4 días de antelación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRUEBA SOCIAL */}
      <section id="opiniones" className="py-24 md:py-32 relative">
        <div className="container">
          <div className="text-center mb-16 reveal">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-2xl md:text-3xl font-display">
              <span className="text-gradient-neon font-semibold">4.7 / 5</span> · más de 200 clientes lo confirman
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Llegamos sin reserva , la atención fue espectacular, cocina en vivo por parte del chef . Nos supieron recomendar de una manera excelente y nos hicieron vivir una hermosa experiencia. Vamos a volver a ir toda las veces que podamos . Super recomendado!", name: "Charly EF", role: "Verificado · Google" },
              { quote: "Reservamos para el menu especial del dia de los enamorados. Fue una experiencia maravillosa. Los chicos sumanente atentos y respetuosos. La comida riquisima y cada plato con una presentacion unica.", name: "Manuel Díaz", role: "Verificado · Google" },
              { quote: "Excelente lugar! La comida es muy buena, pero lo que más destaco es la atención: mozos atentos, amables y buena onda", name: "Karina Gómez", role: "Verificado · Google" },
            ].map((t, i) => (
              <article key={i} className="reveal flex flex-col h-full bg-gradient-card border border-border rounded-2xl p-7 hover:border-primary/40 transition-all hover:-translate-y-1 duration-500">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-accent text-accent" />)}
                </div>
                <blockquote className="text-foreground text-lg font-display italic leading-snug mb-6 flex-1">
                  “{t.quote}”
                </blockquote>
                <footer className="flex items-center gap-3 pt-4 border-t border-border/60 mt-auto">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-neon flex items-center justify-center font-semibold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-28 md:py-40 relative">
        <div className="absolute inset-0 bg-glow opacity-60 blur-3xl pointer-events-none" />
        <div className="container relative text-center max-w-3xl reveal">
          <span className="font-jp text-3xl text-gradient-neon glow-text">菊</span>
          <h2 className="font-display text-5xl md:text-7xl mt-6 mb-8 leading-none">
            Reservá tu mesa y viví la<br />
            <em className="text-gradient-neon not-italic">experiencia KIKU</em>
          </h2>
          <a
            href="#reservar"
            className="inline-flex items-center gap-3 bg-gradient-neon text-primary-foreground font-semibold uppercase tracking-[0.25em] text-base md:text-lg px-12 py-5 rounded-full glow-neon-strong animate-pulse-glow hover:scale-105 transition-transform"
          >
            Reservar ahora <ChevronRight className="w-5 h-5" />
          </a>
          <p className="text-xs text-muted-foreground mt-6 uppercase tracking-widest">
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="border-t border-border/60 pt-16 pb-28 md:pb-12 bg-card/40">
        <div className="container grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-jp text-4xl text-gradient-neon">菊</span>
              <img src="/logo.png" alt="KIKU" className="h-8 md:h-10 object-contain" />
            </div>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              Sushi de autor en un espacio donde el diseño japonés moderno se encuentra
              con la luz de la noche.
            </p>
          </div>

          <div>
            <h4 className="font-display text-xl mb-4">Visitanos</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-accent mt-0.5" /> Callao Bis 139, Rosario</li>
              <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-accent mt-0.5" /> Mar–Dom · 11:00 – 14:00 · 20:00 – 00:00</li>
              <li className="flex items-start gap-2"><Phone className="w-4 h-4 text-accent mt-0.5" /> +341 15-276-4562</li>
              <li className="flex items-start gap-2"><Instagram className="w-4 h-4 text-accent mt-0.5" /> @kikusushi</li>
            </ul>
          </div>


        </div>
        <div className="container mt-14 pt-6 border-t border-border/40 text-xs text-muted-foreground flex flex-wrap justify-between gap-3">
          <span>© {new Date().getFullYear()} Kiku Sushi · Todos los derechos reservados</span>
          <span className="font-jp">いただきます</span>
        </div>
      </footer>
    </div>
  );
};

const GalleryImg = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <div className={`reveal relative overflow-hidden rounded-2xl group ${className ?? ""}`}>
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-700" />
    <div className="absolute inset-0 ring-1 ring-inset ring-primary/0 group-hover:ring-primary/40 transition-all duration-500 rounded-2xl" />
  </div>
);

export default Index;
