import { Link } from "react-router-dom";
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

      <div>
        <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-v2-champagne mb-5 font-medium">
          Visitanos
        </h4>
        <ul className="text-[13px] v2-text-muted leading-[2] list-none">
          <li>
            <a
              href="https://maps.app.goo.gl/WtTjUhcp9nQa7y9t6"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-v2-champagne transition-colors"
            >
              Callao Bis 139
              <br />
              Rosario, Santa Fe
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/5493412764562"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-v2-champagne transition-colors"
            >
              +54 9 341 276-4562
            </a>
          </li>
          <li>Mar–Sáb · 20:00–01:00</li>
        </ul>
        <Link
          to="/trabaja-con-nosotros"
          className="font-body text-[10px] tracking-[0.3em] uppercase text-v2-champagne font-medium mt-6 inline-block hover:text-v2-text transition-colors"
        >
          Trabajá con nosotros
        </Link>
      </div>

      <FooterCol title="Explorar" items={[
        { label: "Umami del Sur", href: "/#umami" },
        { label: "Pacífico y Patagonia", href: "/#pacifico" },
        { label: "Pasta Nikkei", href: "/#pasta-nikkei" },
        { label: "Omakase", href: "/omakase" },
        { label: "Kiku Libre", href: "/sushi-libre" },
        { label: "Carta", href: "/carta" },
      ]} />

      <FooterCol title="Síguenos" items={[
        { label: "Instagram", href: "https://www.instagram.com/kikusushi.rosario", external: true },
        { label: "Facebook", href: "https://www.facebook.com/profile.php?id=100067842387204&sk=about", external: true },
        { label: "WhatsApp", href: "https://wa.me/5493412764562", external: true },
      ]} />
    </div>

    <div className="max-w-[1440px] mx-auto mt-8 flex flex-wrap justify-between items-center gap-3 text-[11px] v2-text-dim">
      <span>© {new Date().getFullYear()} Kiku Sushi · Todos los derechos reservados</span>
      <span className="font-jp text-v2-champagne/55">いただきます</span>
    </div>
  </footer>
);

interface ColItem {
  label: string;
  href: string;
  /** true = link externo (nueva pestaña) */
  external?: boolean;
}

function FooterCol({ title, items }: { title: string; items: (string | ColItem)[] }) {
  return (
    <div>
      <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-v2-champagne mb-5 font-medium">
        {title}
      </h4>
      <ul className="text-[13px] v2-text-muted leading-[2] list-none">
        {items.map((item, i) => {
          if (typeof item === "string") return <li key={i}>{item}</li>;
          if (item.external) {
            return (
              <li key={i}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-v2-champagne transition-colors"
                >
                  {item.label}
                </a>
              </li>
            );
          }
          return (
            <li key={i}>
              <Link to={item.href} className="hover:text-v2-champagne transition-colors">
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FooterV2;
