import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LogoLockup } from "./LogoMark";

const NAV_LINKS = [
  { label: "Umami del Sur", anchor: "umami" },
  { label: "Pacífico", anchor: "pacifico" },
  { label: "Omakase", anchor: "omakase" },
  { label: "Kiku Libre", anchor: "kiku-libre" },
  { label: "Itamae", anchor: "itamae" },
];

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
  const location = useLocation();
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 80], [0.4, 0.95]);
  const navBlur = useTransform(scrollY, [0, 80], [4, 16]);

  // En la home los anchors son #seccion; en otras paginas, /#seccion.
  const isHome = location.pathname === "/" || location.pathname === "/preview";
  const anchorHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

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
          <Link to="/" className="z-50">
            <LogoLockup kanjiSize={36} />
          </Link>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-11 ml-auto mr-10">
            {NAV_LINKS.map((link) => (
              <li key={link.anchor}>
                <a
                  href={anchorHref(link.anchor)}
                  className="text-[11px] uppercase tracking-[0.24em] text-v2-text/80 hover:text-v2-champagne transition-colors duration-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/pedir"
                className="text-[11px] uppercase tracking-[0.24em] text-v2-text/80 hover:text-v2-champagne transition-colors duration-300"
              >
                Pedir
              </Link>
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
      </motion.header>

      {/* Mobile menu overlay */}
      <motion.div
        initial={false}
        animate={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-40 bg-v2-bg/97 backdrop-blur-xl lg:hidden"
      >
        <div className="h-full flex flex-col justify-center items-start px-10 gap-6">
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link.anchor}
              href={anchorHref(link.anchor)}
              onClick={() => setOpen(false)}
              initial={{ x: -20, opacity: 0 }}
              animate={{
                x: open ? 0 : -20,
                opacity: open ? 1 : 0,
              }}
              transition={{ delay: open ? 0.1 + i * 0.06 : 0, duration: 0.5 }}
              className="font-display text-4xl text-v2-text hover:text-v2-champagne transition-colors"
            >
              {link.label}
            </motion.a>
          ))}

          {/* Pedir (mismo flujo que el boton del hero: delivery / take away) */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: open ? 0 : -20, opacity: open ? 1 : 0 }}
            transition={{ delay: open ? 0.1 + NAV_LINKS.length * 0.06 : 0, duration: 0.5 }}
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
            transition={{ delay: open ? 0.1 + (NAV_LINKS.length + 1) * 0.06 : 0, duration: 0.5 }}
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
