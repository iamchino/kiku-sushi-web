import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    try {
      const saved = localStorage.getItem("kiku-cart");
      if (saved) {
        const items: { quantity: number }[] = JSON.parse(saved);
        setCartCount(items.reduce((s, i) => s + i.quantity, 0));
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("kiku-cart-update", updateCartCount);
    return () => window.removeEventListener("kiku-cart-update", updateCartCount);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
      <nav className="container flex items-center justify-between h-16 md:h-20">
        <a href="/#top" className="flex items-center gap-3 md:gap-4 group">
          <span className="font-jp text-4xl md:text-5xl text-gradient-neon glow-text-soft">菊</span>
          <img src="/logo.png" alt="KIKU" className="h-10 md:h-12 object-contain" />
        </a>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-[11px] lg:text-xs uppercase tracking-[0.2em] text-foreground/80 ml-auto">
          <li><a href="/carta"       className="hover:text-foreground transition-colors">Carta</a></li>
          <li><a href="/pedidos"     className="hover:text-foreground transition-colors">Pedidos</a></li>
          <li><a href="/#experiencia"className="hover:text-foreground transition-colors">Omakase</a></li>
          <li><a href="/sushi-libre" className="hover:text-foreground transition-colors">Sushi Libre</a></li>
          <li><a href="/#contacto"   className="hover:text-foreground transition-colors">Contacto</a></li>
        </ul>

        {/* Cart icon — desktop + mobile */}
        <a
          href="/pedidos"
          className="relative flex items-center justify-center w-9 h-9 rounded-full ml-4 transition-all hover:bg-white/10"
          aria-label="Ver carrito"
        >
          <ShoppingBag className="w-5 h-5 text-foreground/80" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </a>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-foreground p-2 ml-1" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 py-6 px-6 flex flex-col gap-6 text-sm uppercase tracking-[0.2em] text-foreground/80 shadow-2xl">
          <a href="/carta"        className="hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>Carta</a>
          <a href="/pedidos"      className="hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
            Pedidos {cartCount > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-accent text-white text-[9px] font-bold">{cartCount}</span>}
          </a>
          <a href="/#experiencia" className="hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>Omakase</a>
          <a href="/sushi-libre"  className="hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>Sushi Libre</a>
          <a href="/#contacto"    className="hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>Contacto</a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
