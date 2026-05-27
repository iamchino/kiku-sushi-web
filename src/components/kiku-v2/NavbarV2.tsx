import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LogoLockup } from "./LogoMark";

const NAV_LINKS = [
  { label: "Umami del Sur", anchor: "umami" },
  { label: "Pacífico", anchor: "pacifico" },
  { label: "Omakase", anchor: "omakase" },
  { label: "Kiku Libre", anchor: "kiku-libre" },
  { label: "Itamae", anchor: "itamae" },
];

const NavbarV2 = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 80], [0.4, 0.95]);
  const navBlur = useTransform(scrollY, [0, 80], [4, 16]);

  // Si estamos en la home, los anchors son #seccion. Si estamos en otra
  // página (ej. /reservar), apuntan a /#seccion para que naveguen al home
  // y scrolleen a la sección.
  const isHome = location.pathname === "/" || location.pathname === "/preview";
  const anchorHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
          <ul className="hidden lg:flex items-center gap-11 ml-auto mr-12">
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
          </ul>

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
