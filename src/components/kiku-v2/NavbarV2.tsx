import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LogoLockup } from "./LogoMark";
import { fetchEspeciales, fallbackEspeciales, type Especial } from "@/data/especiales";
import { supabase } from "@/lib/supabase";

interface NavLink {
  label: string;
  /** ancla de la home (#seccion) */
  anchor?: string;
  /** ruta propia (página) */
  to?: string;
}

// Links fijos del header. Los especiales (Umami, Pacífico, etc.) ya NO van uno
// por uno: ahora se listan dinámicamente en el desplegable "Especiales".
const NAV_LINKS: NavLink[] = [
  { label: "Omakase", to: "/omakase" },
  { label: "Kiku Libre", to: "/sushi-libre" },
];

// Etiqueta legible de un especial (título + acento), ej. "Umami del Sur".
const especialLabel = (e: Especial) => [e.title, e.titleAccent].filter(Boolean).join(" ").trim();

// Lee la cantidad total de items del carrito persistido en localStorage.
// El catalogo (/pedidos) guarda en 'kiku-cart' un array { product, quantity }.
const readCartCount = (): number => {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem("kiku-cart");
    if (!raw) return 0;
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum: number, i: { quantity?: number }) => sum + (i.quantity || 0), 0);
  } catch {
    return 0;
  }
};

const NavbarV2 = () => {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [especiales, setEspeciales] = useState<Especial[]>([]);
  const [anuncio, setAnuncio] = useState<{ texto: string; activo: boolean }>({ texto: "", activo: false });
  const [espOpen, setEspOpen] = useState(false);       // desplegable desktop
  const [espOpenMobile, setEspOpenMobile] = useState(false);
  const espCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 80], [0.4, 0.95]);
  const navBlur = useTransform(scrollY, [0, 80], [4, 16]);

  // En la home los anchors son #seccion; en otras paginas, /#seccion.
  const isHome = location.pathname === "/" || location.pathname === "/preview";
  const anchorHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  // Cargar la lista de especiales activos (misma fuente que la home).
  useEffect(() => {
    let alive = true;
    fetchEspeciales()
      .then((data) => { if (alive) setEspeciales(data); })
      .catch(() => { if (alive) setEspeciales(fallbackEspeciales); });
    return () => { alive = false; };
  }, []);

  // Barra de anuncio ("segundo header"), gestionada desde el dashboard (/menu).
  useEffect(() => {
    let alive = true;
    supabase
      .from("web_config")
      .select("anuncio_texto, anuncio_activo")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (alive && data) setAnuncio({ texto: data.anuncio_texto || "", activo: Boolean(data.anuncio_activo) });
      });
    return () => { alive = false; };
  }, []);

  const anuncioVisible = anuncio.activo && anuncio.texto.trim().length > 0;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Mantener el contador de la bolsita sincronizado con el carrito.
  // /pedidos emite 'kiku-cart-update' al modificar el carrito; 'storage'
  // cubre cambios desde otra pestana.
  useEffect(() => {
    const update = () => setCartCount(readCartCount());
    update();
    window.addEventListener("kiku-cart-update", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("kiku-cart-update", update);
      window.removeEventListener("storage", update);
    };
  }, [location.pathname]);

  // La bolsita lleva al carrito; con #cart, /pedidos abre el panel del pedido.
  const cartHref = cartCount > 0 ? "/pedidos#cart" : "/pedir";

  const linkCls =
    "text-[11px] uppercase tracking-[0.24em] text-v2-text/80 hover:text-v2-champagne transition-colors duration-300";

  // Hover-intent para el desplegable de escritorio (no se cierra al cruzar el gap).
  const openEsp = () => {
    if (espCloseTimer.current) clearTimeout(espCloseTimer.current);
    setEspOpen(true);
  };
  const closeEspSoon = () => {
    if (espCloseTimer.current) clearTimeout(espCloseTimer.current);
    espCloseTimer.current = setTimeout(() => setEspOpen(false), 140);
  };

  return (
    <>
      <motion.header
        style={{
          backgroundColor: useTransform(navOpacity, (o) => `hsla(264, 56%, 4%, ${o})`),
          backdropFilter: useTransform(navBlur, (b) => `blur(${b}px)`),
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-v2-champagne/10"
      >
        <nav className="max-w-[1440px] mx-auto px-6 md:px-14 h-16 md:h-20 flex items-center justify-between">
          <Link
            to="/"
            className="z-50"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <LogoLockup kanjiSize={36} />
          </Link>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-11 ml-auto mr-10">
            {/* Omakase, Kiku Libre */}
            <li>
              <Link to="/omakase" className={linkCls}>Omakase</Link>
            </li>
            <li>
              <Link to="/sushi-libre" className={linkCls}>Kiku Libre</Link>
            </li>

            {/* Especiales — desplegable con la lista cargada */}
            {especiales.length > 0 && (
              <li
                className="relative"
                onMouseEnter={openEsp}
                onMouseLeave={closeEspSoon}
              >
                <button
                  type="button"
                  onClick={() => setEspOpen((v) => !v)}
                  aria-expanded={espOpen}
                  className={`${linkCls} inline-flex items-center gap-1.5`}
                >
                  Especiales
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${espOpen ? "rotate-180" : ""}`} />
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    opacity: espOpen ? 1 : 0,
                    y: espOpen ? 0 : -8,
                    pointerEvents: espOpen ? "auto" : "none",
                  }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full pt-4 w-64"
                >
                  <div className="rounded-xl border border-v2-champagne/15 bg-v2-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden py-2">
                    {especiales.map((e) => (
                      <a
                        key={e.id}
                        href={anchorHref(e.id)}
                        onClick={() => setEspOpen(false)}
                        className="block px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] text-v2-text/80 hover:text-v2-champagne hover:bg-v2-champagne/5 transition-colors"
                      >
                        {especialLabel(e)}
                      </a>
                    ))}
                    <a
                      href={anchorHref("especiales")}
                      onClick={() => setEspOpen(false)}
                      className="block px-4 py-2.5 mt-1 border-t border-v2-champagne/10 text-[10px] uppercase tracking-[0.24em] text-v2-champagne/70 hover:text-v2-champagne hover:bg-v2-champagne/5 transition-colors"
                    >
                      Ver todos
                    </a>
                  </div>
                </motion.div>
              </li>
            )}

            {/* Itamae */}
            <li>
              <a href={anchorHref("itamae")} className={linkCls}>Itamae</a>
            </li>

            <li>
              <Link to="/carta" className={linkCls}>Carta</Link>
            </li>
            <li>
              <Link to="/pedir" className={linkCls}>Pedir</Link>
            </li>
          </ul>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Bolsita / carrito */}
            <Link
              to={cartHref}
              aria-label="Mi pedido"
              className="relative z-50 inline-flex items-center justify-center w-10 h-10 text-v2-text hover:text-v2-champagne transition-colors"
            >
              <ShoppingBag className="w-[22px] h-[22px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-v2-champagne text-v2-bg text-[10px] font-semibold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Reserve CTA */}
            <Link
              to="/reservar"
              className="hidden md:inline-flex bg-v2-champagne text-v2-bg px-7 py-3 text-[11px] uppercase tracking-[0.24em] font-medium hover:bg-v2-text hover:-translate-y-px transition-all duration-300"
            >
              Reservá
            </Link>

            {/* Mobile toggle */}
            <button
              className="lg:hidden text-v2-text z-50 p-2"
              onClick={() => setOpen(!open)}
              aria-label="Menú"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Segundo header: barra de anuncio (editable desde el dashboard).
            Va DEBAJO del header principal. */}
        {anuncioVisible && (
          <div className="bg-[#e7c98f] text-[#2a1d0e] text-center text-[16px] md:text-[19px] font-semibold tracking-[0.01em] leading-snug px-4 py-3">
            {anuncio.texto}
          </div>
        )}
      </motion.header>

      {/* Mobile menu overlay */}
      <motion.div
        initial={false}
        animate={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-40 bg-v2-bg/97 backdrop-blur-xl lg:hidden overflow-y-auto"
      >
        <div className="min-h-full flex flex-col justify-center items-start px-10 gap-6 py-24">
          {/* Omakase + Kiku Libre */}
          {NAV_LINKS.filter((l) => l.to).map((link, i) => (
            <motion.div
              key={link.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: open ? 0 : -20, opacity: open ? 1 : 0 }}
              transition={{ delay: open ? 0.1 + i * 0.06 : 0, duration: 0.5 }}
            >
              <Link
                to={link.to!}
                onClick={() => setOpen(false)}
                className="font-display text-4xl text-v2-text hover:text-v2-champagne transition-colors"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}

          {/* Especiales — acordeón con la lista cargada */}
          {especiales.length > 0 && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: open ? 0 : -20, opacity: open ? 1 : 0 }}
              transition={{ delay: open ? 0.1 + 2 * 0.06 : 0, duration: 0.5 }}
              className="w-full"
            >
              <button
                type="button"
                onClick={() => setEspOpenMobile((v) => !v)}
                className="font-display text-4xl text-v2-text hover:text-v2-champagne transition-colors inline-flex items-center gap-3"
              >
                Especiales
                <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${espOpenMobile ? "rotate-180" : ""}`} />
              </button>
              {espOpenMobile && (
                <div className="mt-4 flex flex-col gap-3 pl-1 border-l border-v2-champagne/15">
                  {especiales.map((e) => (
                    <a
                      key={e.id}
                      href={anchorHref(e.id)}
                      onClick={() => setOpen(false)}
                      className="pl-4 text-xl text-v2-text/85 hover:text-v2-champagne transition-colors uppercase tracking-[0.12em]"
                    >
                      {especialLabel(e)}
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Itamae */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: open ? 0 : -20, opacity: open ? 1 : 0 }}
            transition={{ delay: open ? 0.1 + 3 * 0.06 : 0, duration: 0.5 }}
          >
            <a
              href={anchorHref("itamae")}
              onClick={() => setOpen(false)}
              className="font-display text-4xl text-v2-text hover:text-v2-champagne transition-colors"
            >
              Itamae
            </a>
          </motion.div>

          {/* Carta Salón */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: open ? 0 : -20, opacity: open ? 1 : 0 }}
            transition={{ delay: open ? 0.1 + 4 * 0.06 : 0, duration: 0.5 }}
          >
            <Link
              to="/carta"
              onClick={() => setOpen(false)}
              className="font-display text-4xl text-v2-text hover:text-v2-champagne transition-colors"
            >
              Carta
            </Link>
          </motion.div>

          {/* Pedir (mismo flujo que el boton del hero: delivery / take away) */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: open ? 0 : -20, opacity: open ? 1 : 0 }}
            transition={{ delay: open ? 0.1 + 5 * 0.06 : 0, duration: 0.5 }}
          >
            <Link
              to="/pedir"
              onClick={() => setOpen(false)}
              className="font-display text-4xl text-v2-text hover:text-v2-champagne transition-colors"
            >
              Pedir
            </Link>
          </motion.div>

          {/* Mi pedido / bolsita */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: open ? 0 : -20, opacity: open ? 1 : 0 }}
            transition={{ delay: open ? 0.1 + 6 * 0.06 : 0, duration: 0.5 }}
          >
            <Link
              to={cartHref}
              onClick={() => setOpen(false)}
              className="font-display text-4xl text-v2-text hover:text-v2-champagne transition-colors inline-flex items-center gap-3"
            >
              <ShoppingBag className="w-7 h-7" />
              Mi pedido
              {cartCount > 0 && (
                <span className="min-w-[26px] h-[26px] px-1.5 rounded-full bg-v2-champagne text-v2-bg text-sm font-semibold inline-flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: open ? 0 : -20, opacity: open ? 1 : 0 }}
            transition={{ delay: open ? 0.5 : 0, duration: 0.5 }}
            className="mt-6"
          >
            <Link
              to="/reservar"
              onClick={() => setOpen(false)}
              className="inline-block bg-v2-champagne text-v2-bg px-8 py-4 text-xs uppercase tracking-[0.3em] font-medium"
            >
              Reservar mesa
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default NavbarV2;
