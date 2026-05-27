import { LogoLockup } from "./LogoMark";

const FooterV2 = () => (
  <footer className="px-6 md:px-14 pt-24 pb-10 border-t border-v2-champagne/10 v2-bg-base">
    <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 pb-16 border-b border-v2-champagne/10">
      <div>
        <div className="mb-5">
          <LogoLockup kanjiSize={44} />
        </div>
        <p className="v2-text-muted text-sm max-w-sm leading-[1.8]">
          Sushi de autor en un espacio donde la tradición japonesa se encuentra con la luz violeta de la noche rosarina.
        </p>
      </div>

      <FooterCol title="Visitanos" items={[
        "Callao Bis 139",
        "Rosario, Santa Fe",
        "+341 15-276-4562",
        "Mar–Dom · 20:00–00:00",
      ]} />

      <FooterCol title="Explorar" items={[
        { label: "Umami del Sur", href: "#umami" },
        { label: "Pacífico y Patagonia", href: "#pacifico" },
        { label: "Omakase", href: "#omakase" },
        { label: "Kiku Libre", href: "#kiku-libre" },
      ]} />

      <FooterCol title="Síguenos" items={[
        { label: "Instagram", href: "#" },
        { label: "Spotify · Kiku Sounds", href: "#" },
        { label: "WhatsApp", href: "#" },
      ]} />
    </div>

    <div className="max-w-[1440px] mx-auto mt-8 flex flex-wrap justify-between items-center gap-3 text-[11px] v2-text-dim">
      <span>© {new Date().getFullYear()} Kiku Sushi · Todos los derechos reservados</span>
      <span className="font-jp text-v2-champagne/55">いただきます</span>
    </div>
  </footer>
);

interface ColItem { label: string; href: string }
function FooterCol({ title, items }: { title: string; items: (string | ColItem)[] }) {
  return (
    <div>
      <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-v2-champagne mb-5 font-medium">
        {title}
      </h4>
      <ul className="text-[13px] v2-text-muted leading-[2] list-none">
        {items.map((item, i) => {
          if (typeof item === "string") return <li key={i}>{item}</li>;
          return (
            <li key={i}>
              <a href={item.href} className="hover:v2-text transition-colors">{item.label}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FooterV2;
