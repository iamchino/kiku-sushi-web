import { useState, useMemo, useEffect } from "react";
import { ShoppingBag, Search, Truck, Store, Plus, Minus, Trash2, X, Loader2, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import { fallbackData, fetchCatalogFromSheet, type CatalogProduct, type CatalogCategory } from "@/data/catalog";
import { supabase } from "@/lib/supabase";

// Parsea precios en formato argentino: "$3.500" → 3500
const parsePrice = (s: string) => parseInt(s.replace(/[$. ]/g, ''), 10) || 0;

// Formatea un precio (string o número) al formato argentino: 22000 → "$22.000"
const formatPrice = (s: string) => `$${parsePrice(s).toLocaleString("es-AR")}`;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Horario de atención de pedidos (hora Argentina) ───
//   Martes a jueves: 19:30 → 00:00 (medianoche)
//   Viernes y sábado: 19:30 → 01:00 (esa madrugada cae en sábado y domingo)
// Domingo (salvo 00:00–01:00) y lunes: cerrado.
// Se calcula siempre en hora de Argentina, sin importar la zona del dispositivo.
const kikuAbierto = (): { abierto: boolean; motivo: string } => {
  const arg = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
  );
  const dow = arg.getDay();                       // 0=Dom .. 6=Sáb
  const mins = arg.getHours() * 60 + arg.getMinutes();

  const noche = [2, 3, 4, 5, 6].includes(dow) && mins >= 19 * 60 + 30;  // 19:30 en adelante
  const madrugada = [6, 0].includes(dow) && mins <= 60;                 // hasta 01:00 (sáb y dom)

  if (noche || madrugada) return { abierto: true, motivo: "" };
  if (dow === 1) return { abierto: false, motivo: "Hoy (lunes) estamos cerrados." };
  return {
    abierto: false,
    motivo: "Por ahora estamos cerrados. Tomamos pedidos de martes a jueves de 19:30 a 00:00, y viernes y sábado de 19:30 a 01:00.",
  };
};

// ¿Un horario "YYYY-MM-DDTHH:MM" (hora Argentina) cae dentro de atención?
const horarioPedidoValido = (value: string): boolean => {
  if (!value) return false;
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return false;
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();  // weekday TZ-independiente
  const mins = hh * 60 + mm;
  return ([2, 3, 4, 5, 6].includes(dow) && mins >= 19 * 60 + 30)
      || ([6, 0].includes(dow) && mins <= 60);
};

// Date → "YYYY-MM-DDTHH:MM" (para min/max del input datetime-local).
const dtLocalInput = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

// "YYYY-MM-DDTHH:MM" interpretado como hora Argentina (UTC-3, sin DST) → ISO UTC.
const programadoAISO = (value: string): string => new Date(value + ":00-03:00").toISOString();
const programadoTimeMs = (value: string): number => new Date(value + ":00-03:00").getTime();

interface CartItem {
  product: CatalogProduct;
  quantity: number;
}

const Pedidos = () => {

  // Aplicar la estética v2 mientras esta página está montada
  useEffect(() => {
    document.body.classList.add("v2-root");
    return () => { document.body.classList.remove("v2-root"); };
  }, []);

  // Modo inicial: 1) ?modo= de la URL (viene de /pedir), 2) último modo guardado.
  // Persistir el modo permite que la bolsita del navbar (/pedidos#cart) reabra
  // el carrito real en vez de volver a la pantalla de selección.
  const initialMode = (() => {
    if (typeof window === 'undefined') return null
    const m = new URLSearchParams(window.location.search).get('modo')
    if (m === 'delivery' || m === 'takeaway') return m
    const saved = localStorage.getItem('kiku-order-mode')
    return saved === 'delivery' || saved === 'takeaway' ? saved : null
  })() as "delivery" | "takeaway" | null;

  const [orderMode, setOrderMode] = useState<"delivery" | "takeaway" | null>(initialMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kiku-cart')
      if (saved) return JSON.parse(saved) as CartItem[]
    } catch {}
    return []
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [zoomProduct, setZoomProduct] = useState<CatalogProduct | null>(null);

  // Estado de apertura del local (se refresca cada 30s para abrir/cerrar solo).
  const [estadoLocal, setEstadoLocal] = useState(kikuAbierto);
  useEffect(() => {
    const id = setInterval(() => setEstadoLocal(kikuAbierto()), 30000);
    return () => clearInterval(id);
  }, []);

  // Cerrar la imagen ampliada con Escape
  useEffect(() => {
    if (!zoomProduct) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomProduct(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomProduct]);

  // Persistir carrito en localStorage + notificar Navbar
  useEffect(() => {
    localStorage.setItem('kiku-cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('kiku-cart-update'));
  }, [cart]);

  // Persistir el modo de pedido (delivery / takeaway)
  useEffect(() => {
    if (orderMode) localStorage.setItem('kiku-order-mode', orderMode);
    else localStorage.removeItem('kiku-order-mode');
  }, [orderMode]);

  // Checkout flow
  const [step, setStep] = useState<"catalog" | "checkout" | "confirmado">("catalog");
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pedidoNum, setPedidoNum] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notasExtra, setNotasExtra] = useState("");
  const [cuando, setCuando] = useState<"asap" | "programar">("asap");
  const [programadoLocal, setProgramadoLocal] = useState("");

  // ─── Fetch catálogo (Supabase, tipo delivery) ──────────────────────────────
  const [catalogData, setCatalogData] = useState<CatalogCategory[]>(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalogFromSheet()
      .then((data) => setCatalogData(data))
      .catch(() => setCatalogData(fallbackData))
      .finally(() => setLoading(false));
  }, []);

  // Abrir el carrito cuando se navega a /pedidos#cart — incluso si ya estamos
  // parados en /pedidos (la bolsita del navbar usa ese hash). Reaccionamos a
  // cada navegación mediante location.key.
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.hash === '#cart') {
      setCartOpen(true);
      navigate(location.pathname + location.search, { replace: true }); // limpia el #cart
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Filter products by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return catalogData;
    const q = searchQuery.toLowerCase();
    return catalogData
      .map((cat) => ({
        ...cat,
        products: cat.products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.products.length > 0);
  }, [searchQuery, catalogData]);

  // Cart helpers
  const addToCart = (product: CatalogProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Confirmar pedido → Supabase
  const confirmarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) return;
    if (orderMode === "delivery" && !direccion.trim()) return;

    // ¿Cuándo? Si está cerrado ahora, se obliga a programar.
    const est = kikuAbierto();
    const debeProgramar = !est.abierto || cuando === "programar";
    let programadoPara: string | null = null;
    if (debeProgramar) {
      if (!programadoLocal) { setErrorMsg("Elegí el día y la hora para tu pedido."); return; }
      if (!horarioPedidoValido(programadoLocal)) {
        setErrorMsg("Ese horario está fuera de atención (Mar–Jue 19:30–00:00, Vie–Sáb 19:30–01:00).");
        return;
      }
      const t = programadoTimeMs(programadoLocal);
      if (t < Date.now() + 30 * 60000) { setErrorMsg("Programá con al menos 30 minutos de anticipación."); return; }
      if (t > Date.now() + 3 * 24 * 60 * 60000) { setErrorMsg("Solo se puede programar hasta 3 días de anticipación."); return; }
      programadoPara = programadoAISO(programadoLocal);
    }

    setEnviando(true);
    try {
      const subtotal = cart.reduce((s, i) => s + parsePrice(i.product.price) * i.quantity, 0);
      const envio   = orderMode === "delivery" ? 3500 : 0;
      const total   = subtotal + envio;

      const { data: pedido, error: e1 } = await supabase
        .from("pedidos")
        .insert({
          canal:             orderMode === "delivery" ? "delivery" : "takeaway",
          origen:            "web",
          total,
          cliente_nombre:    nombre.trim(),
          cliente_telefono:  telefono.trim(),
          cliente_direccion: orderMode === "delivery" ? direccion.trim() : null,
          notas:             notasExtra.trim() || null,
          programado_para:   programadoPara,
        })
        .select("id, numero")
        .single();

      if (e1) throw e1;
      if (!pedido) throw new Error('Sin respuesta del servidor');

      await supabase.from("pedido_items").insert(
        cart.map((i) => ({
          pedido_id:       pedido.id,
          nombre:          i.product.name,
          precio_unitario: parsePrice(i.product.price),
          cantidad:        i.quantity,
          menu_item_id:     UUID_RE.test(i.product.id) ? i.product.id : null,
        }))
      );

      setPedidoNum(pedido.numero ?? null);
      setCart([]);
      localStorage.removeItem('kiku-cart');
      setCartOpen(false);
      setStep("confirmado");
    } catch (err: unknown) {
      console.error('Error Supabase:', err);
      const msg =
        (err as { message?: string })?.message ||
        JSON.stringify(err) ||
        'Error desconocido';
      setErrorMsg(msg);
    } finally {
      setEnviando(false);
    }
  };

  // ─── Pantalla de selección de modo ──────────────────────────────────────────
  // La página queda siempre abierta: si está cerrado, en el checkout se ofrece
  // programar el pedido (ver selector "¿Cuándo?").

  if (!orderMode) {
    return (
      <div className="v2-root min-h-screen overflow-x-hidden v2-bg-base">
        <NavbarV2 />
        <section className="relative min-h-screen flex items-center justify-center pt-28 pb-16 px-6 md:px-14 overflow-hidden text-center">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at top, hsla(270, 50%, 50%, 0.12), transparent 60%)" }}
          />
          <div className="relative z-10 max-w-2xl w-full">
            <span className="font-jp text-xs tracking-[0.4em] text-v2-champagne mb-4 block">— ご注文 —</span>
            <h1 className="font-display font-light text-5xl sm:text-7xl text-v2-text leading-none mb-4">
              Pedidos
            </h1>
            <p className="v2-text-muted mb-12">
              Realizá tu pedido para delivery o retiro en el local
            </p>

            <div className="grid sm:grid-cols-2 gap-5 text-left">
              <button
                onClick={() => setOrderMode("delivery")}
                className="group relative v2-bg-card border border-v2-champagne/15 rounded-2xl p-8 hover:border-v2-champagne/50 hover:-translate-y-0.5 transition-all duration-500 overflow-hidden"
              >
                <div className="w-14 h-14 rounded-2xl border border-v2-champagne/30 flex items-center justify-center mb-5">
                  <Truck className="w-6 h-6 text-v2-champagne" />
                </div>
                <h3 className="font-display text-2xl text-v2-text mb-2">Delivery</h3>
                <p className="text-sm v2-text-muted mb-1">Lo enviamos a tu domicilio</p>
                <p className="text-xs text-v2-champagne">Costo de envío: $3.500</p>
              </button>

              <button
                onClick={() => setOrderMode("takeaway")}
                className="group relative v2-bg-card border border-v2-champagne/15 rounded-2xl p-8 hover:border-v2-champagne/50 hover:-translate-y-0.5 transition-all duration-500 overflow-hidden"
              >
                <div className="w-14 h-14 rounded-2xl border border-v2-champagne/30 flex items-center justify-center mb-5">
                  <Store className="w-6 h-6 text-v2-champagne" />
                </div>
                <h3 className="font-display text-2xl text-v2-text mb-2">Retiro en local</h3>
                <p className="text-sm v2-text-muted mb-1">Pasás a buscarlo al local</p>
                <p className="text-xs text-v2-champagne">Sin costo de envío</p>
              </button>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] v2-text-muted mt-10 hover:text-v2-champagne transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // ─── Vista del catálogo ─────────────────────────────────────────────────────
  const categories = filteredCategories;
  const visibleCategories = activeCategory
    ? categories.filter((c) => c.name === activeCategory)
    : categories;

  return (
    <div className="v2-root min-h-screen overflow-x-hidden v2-bg-base">
      <NavbarV2 />

      {/* Header bar */}
      <section className="pt-28 md:pt-32 pb-6 px-6 md:px-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                to="/pedir"
                className="inline-flex items-center gap-1.5 v2-text-muted hover:text-v2-champagne transition-colors text-[11px] uppercase tracking-[0.24em]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cambiar
              </Link>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-v2-champagne/30 text-v2-champagne text-[10px] uppercase tracking-[0.24em]">
                {orderMode === "delivery" ? (
                  <><Truck className="w-3 h-3" /> Delivery</>
                ) : (
                  <><Store className="w-3 h-3" /> Retiro en local</>
                )}
              </span>
            </div>
            {/* El botón de pedido duplicado se quitó: la bolsita del navbar (arriba
                a la derecha) abre el carrito en esta misma página. */}
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-v2-champagne/60" />
            <input
              type="text"
              placeholder="Buscar en el menú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full v2-bg-card border border-v2-champagne/15 rounded-full pl-11 pr-4 py-3 text-sm text-v2-text placeholder:text-v2-text-dim outline-none focus:border-v2-champagne/50 transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-5 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] border transition-all ${
                !activeCategory
                  ? "bg-v2-champagne text-v2-bg border-transparent"
                  : "border-v2-champagne/20 text-v2-text-muted hover:border-v2-champagne/50 hover:text-v2-text"
              }`}
            >
              Todos
            </button>
            {catalogData.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name === activeCategory ? null : cat.name)}
                className={`shrink-0 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] border transition-all whitespace-nowrap ${
                  activeCategory === cat.name
                    ? "bg-v2-champagne text-v2-bg border-transparent"
                    : "border-v2-champagne/20 text-v2-text-muted hover:border-v2-champagne/50 hover:text-v2-text"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="pb-32 px-6 md:px-14">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-v2-champagne animate-spin" />
              <p className="v2-text-muted text-sm">Cargando menú...</p>
            </div>
          ) : visibleCategories.length === 0 ? (
            <div className="text-center py-20">
              <p className="v2-text-muted text-lg">
                No se encontraron productos para "{searchQuery}"
              </p>
            </div>
          ) : (
          visibleCategories.map((cat) => (
            <div key={cat.name} className="mb-14">
              <div className="mb-6">
                <h2 className="font-display font-light text-3xl md:text-4xl text-v2-text">{cat.name}</h2>
                {cat.subtitle && (
                  <p className="text-xs uppercase tracking-[0.2em] text-v2-champagne/70 mt-1.5">{cat.subtitle}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.products.map((product) => {
                  const inCart = cart.find((i) => i.product.id === product.id);
                  return (
                    <article
                      key={product.id}
                      className="group relative v2-bg-card border border-v2-champagne/12 rounded-2xl p-5 hover:border-v2-champagne/40 transition-all duration-500 overflow-hidden"
                    >
                      <div className="relative flex flex-col h-full">
                        {product.image ? (
                          <button
                            type="button"
                            onClick={() => setZoomProduct(product)}
                            className="block w-full mb-4 rounded-xl overflow-hidden cursor-zoom-in"
                            aria-label={`Ampliar imagen de ${product.name}`}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          </button>
                        ) : (
                          <div className="w-full h-40 rounded-xl mb-4 v2-bg-base border border-v2-champagne/10 flex items-center justify-center">
                            <span className="font-jp text-3xl text-v2-champagne/25">菊</span>
                          </div>
                        )}

                        {product.badge && (
                          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full border border-v2-champagne/30 text-v2-champagne text-[10px] uppercase tracking-wider font-semibold bg-v2-bg/60">
                            {product.badge}
                          </span>
                        )}

                        <h3 className="font-display text-xl text-v2-text mb-1">{product.name}</h3>
                        <p className="text-xs v2-text-muted leading-relaxed mb-4 flex-1">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-base font-display text-v2-champagne">
                            {formatPrice(product.price)}
                          </span>

                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="w-7 h-7 rounded-full border border-v2-champagne/25 flex items-center justify-center text-v2-text-muted hover:text-v2-text hover:border-v2-champagne/50 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold w-5 text-center text-v2-text">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => addToCart(product)}
                                className="w-7 h-7 rounded-full bg-v2-champagne flex items-center justify-center text-v2-bg hover:bg-v2-text transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-v2-champagne/40 text-xs text-v2-champagne hover:bg-v2-champagne hover:text-v2-bg hover:border-transparent transition-all"
                            >
                              <Plus className="w-3 h-3" /> Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))
          )}
        </div>
      </section>

      {/* Floating cart button (mobile) */}
      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-v2-champagne text-v2-bg text-center font-medium tracking-[0.2em] uppercase py-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-2xl"
        >
          <ShoppingBag className="w-4 h-4" />
          Ver pedido · {cartCount} {cartCount === 1 ? "item" : "items"}
        </button>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-v2-bg/80 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md v2-bg-card border-l border-v2-champagne/15 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-v2-champagne/12">
              <h3 className="font-display text-2xl text-v2-text">Tu pedido</h3>
              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 rounded-full border border-v2-champagne/25 flex items-center justify-center text-v2-text-muted hover:text-v2-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag className="w-10 h-10 text-v2-text-dim mx-auto mb-3" />
                  <p className="v2-text-muted">Tu pedido está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-start gap-3 v2-bg-base rounded-xl p-4 border border-v2-champagne/10"
                    >
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 border border-v2-champagne/15"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-base text-v2-text truncate">{item.product.name}</h4>
                        <p className="text-xs text-v2-champagne">{formatPrice(item.product.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-6 h-6 rounded-full border border-v2-champagne/25 flex items-center justify-center text-v2-text-muted hover:text-v2-text transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold w-5 text-center text-v2-text">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item.product)}
                            className="w-6 h-6 rounded-full bg-v2-champagne flex items-center justify-center text-v2-bg hover:bg-v2-text transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-v2-text-dim hover:text-red-400 transition-colors mt-1"
                        aria-label={`Quitar ${item.product.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-v2-champagne/12">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="v2-text-muted">Modo</span>
                  <span className="font-semibold text-v2-text">{orderMode === "delivery" ? "Delivery (+$3.500)" : "Retiro en local"}</span>
                </div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="v2-text-muted">Subtotal</span>
                  <span className="font-semibold text-v2-text">${cart.reduce((s,i) => s + parsePrice(i.product.price)*i.quantity,0).toLocaleString("es-AR")}</span>
                </div>
                {orderMode === "delivery" && (
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="v2-text-muted">Envío</span>
                    <span className="font-semibold text-v2-text">$3.500</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-5 text-sm font-bold">
                  <span className="text-v2-text">Total</span>
                  <span className="text-v2-champagne">${(cart.reduce((s,i) => s + parsePrice(i.product.price)*i.quantity,0) + (orderMode==="delivery"?3500:0)).toLocaleString("es-AR")}</span>
                </div>
                <button
                  onClick={() => { setCartOpen(false); setStep("checkout"); }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-v2-champagne text-v2-bg font-medium uppercase tracking-[0.2em] text-sm py-4 rounded-xl hover:bg-v2-text transition-colors"
                >
                  Confirmar pedido <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Checkout overlay ── */}
      {step === "checkout" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-v2-bg/90 backdrop-blur-sm" onClick={() => setStep("catalog")} />
          <div className="relative w-full max-w-md v2-bg-card border border-v2-champagne/15 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-v2-champagne/12">
              <h3 className="font-display text-2xl text-v2-text">Datos de contacto</h3>
              <button onClick={() => setStep("catalog")} className="w-8 h-8 rounded-full border border-v2-champagne/25 flex items-center justify-center text-v2-text-muted hover:text-v2-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={confirmarPedido} className="p-6 space-y-4">
              {/* ¿Cuándo lo querés? */}
              <div>
                <label className="text-xs v2-text-muted mb-1 block">¿Cuándo lo querés?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={!estadoLocal.abierto}
                    onClick={() => { setCuando("asap"); setErrorMsg(null); }}
                    className={`rounded-xl px-3 py-2.5 text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      cuando === "asap" && estadoLocal.abierto
                        ? "bg-v2-champagne text-v2-bg border-v2-champagne"
                        : "v2-bg-base text-v2-text border-v2-champagne/15"
                    }`}>
                    Lo antes posible
                  </button>
                  <button type="button"
                    onClick={() => { setCuando("programar"); setErrorMsg(null); }}
                    className={`rounded-xl px-3 py-2.5 text-sm border transition-colors ${
                      cuando === "programar" || !estadoLocal.abierto
                        ? "bg-v2-champagne text-v2-bg border-v2-champagne"
                        : "v2-bg-base text-v2-text border-v2-champagne/15"
                    }`}>
                    Programar
                  </button>
                </div>
                {!estadoLocal.abierto && (
                  <p className="text-[11px] v2-text-dim mt-1.5">Ahora estamos cerrados — programá tu pedido.</p>
                )}
                {(cuando === "programar" || !estadoLocal.abierto) && (
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      value={programadoLocal}
                      min={dtLocalInput(new Date(Date.now() + 30 * 60000))}
                      max={dtLocalInput(new Date(Date.now() + 3 * 24 * 60 * 60000))}
                      onChange={(e) => { setProgramadoLocal(e.target.value); setErrorMsg(null); }}
                      className="w-full v2-bg-base border border-v2-champagne/15 rounded-xl px-4 py-3 text-sm text-v2-text outline-none focus:border-v2-champagne/50"
                    />
                    <p className="text-[11px] v2-text-dim mt-1.5">
                      Atención: Mar–Jue 19:30–00:00 · Vie–Sáb 19:30–01:00.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs v2-text-muted mb-1 block">Nombre completo *</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} required
                  className="w-full v2-bg-base border border-v2-champagne/15 rounded-xl px-4 py-3 text-sm text-v2-text outline-none focus:border-v2-champagne/50"
                  placeholder="Tu nombre" />
              </div>
              <div>
                <label className="text-xs v2-text-muted mb-1 block">Teléfono *</label>
                <input value={telefono} onChange={e => setTelefono(e.target.value)} required type="tel"
                  className="w-full v2-bg-base border border-v2-champagne/15 rounded-xl px-4 py-3 text-sm text-v2-text outline-none focus:border-v2-champagne/50"
                  placeholder="+54 9 341 000 0000" />
              </div>
              {orderMode === "delivery" && (
                <div>
                  <label className="text-xs v2-text-muted mb-1 block">Dirección de entrega *</label>
                  <input value={direccion} onChange={e => setDireccion(e.target.value)} required
                    className="w-full v2-bg-base border border-v2-champagne/15 rounded-xl px-4 py-3 text-sm text-v2-text outline-none focus:border-v2-champagne/50"
                    placeholder="Calle y número, piso/depto" />
                </div>
              )}
              <div>
                <label className="text-xs v2-text-muted mb-1 block">Notas (opcional)</label>
                <textarea value={notasExtra} onChange={e => setNotasExtra(e.target.value)} rows={2}
                  className="w-full v2-bg-base border border-v2-champagne/15 rounded-xl px-4 py-3 text-sm text-v2-text outline-none focus:border-v2-champagne/50 resize-none"
                  placeholder="Sin cebolla, sin tacc, etc." />
              </div>
              {errorMsg && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400 break-all">
                  ⚠️ {errorMsg}
                </div>
              )}
              <button type="submit" disabled={enviando}
                onClick={() => setErrorMsg(null)}
                className="w-full inline-flex items-center justify-center gap-2 bg-v2-champagne text-v2-bg font-medium uppercase tracking-[0.2em] text-sm py-4 rounded-xl hover:bg-v2-text transition-colors disabled:opacity-60">
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar pedido"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Pedido confirmado ── */}
      {step === "confirmado" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-v2-bg/95 backdrop-blur-md">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <p className="font-jp text-v2-champagne text-sm tracking-widest mb-2">— ありがとう —</p>
              <h2 className="font-display text-4xl text-v2-text mb-2">¡Pedido recibido!</h2>
              {pedidoNum && <p className="v2-text-muted text-sm">Pedido <span className="text-v2-champagne font-bold">#{pedidoNum}</span></p>}
              <p className="v2-text-muted text-sm mt-2">Nos ponemos a prepararlo. Te contactamos a la brevedad al número que indicaste.</p>
            </div>
            <button onClick={() => { setStep("catalog"); setOrderMode(null); }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-v2-champagne/30 text-sm text-v2-text hover:border-v2-champagne/60 hover:text-v2-champagne transition-colors">
              Volver al inicio
            </button>
          </div>
        </div>
      )}

      {/* ── Imagen ampliada del producto ── */}
      {zoomProduct && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={() => setZoomProduct(null)}
        >
          <div className="absolute inset-0 bg-v2-bg/90 backdrop-blur-md" />
          <div
            className="relative w-full max-w-lg v2-bg-card border border-v2-champagne/15 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomProduct(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-v2-bg/70 border border-v2-champagne/25 flex items-center justify-center text-v2-text-muted hover:text-v2-text transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            {zoomProduct.image && (
              <img
                src={zoomProduct.image}
                alt={zoomProduct.name}
                className="w-full max-h-[55vh] object-contain bg-black/30"
              />
            )}

            <div className="p-6">
              {zoomProduct.badge && (
                <span className="inline-block mb-2 px-2.5 py-0.5 rounded-full border border-v2-champagne/30 text-v2-champagne text-[10px] uppercase tracking-wider font-semibold">
                  {zoomProduct.badge}
                </span>
              )}
              <h3 className="font-display text-2xl text-v2-text mb-2">{zoomProduct.name}</h3>
              <p className="text-sm v2-text-muted leading-relaxed mb-4">
                {zoomProduct.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-display text-v2-champagne">
                  {formatPrice(zoomProduct.price)}
                </span>
                <button
                  onClick={() => { addToCart(zoomProduct); setZoomProduct(null); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-v2-champagne text-v2-bg text-xs font-medium uppercase tracking-[0.2em] hover:bg-v2-text transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;
