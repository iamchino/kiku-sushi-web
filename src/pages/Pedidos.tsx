import { useState, useMemo, useEffect } from "react";
import { ShoppingBag, Search, Truck, Store, Plus, Minus, Trash2, X, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "@/components/kiku/Navbar";
import { fallbackData, fetchCatalogFromSheet, type CatalogProduct, type CatalogCategory } from "@/data/catalog";
import { supabase } from "@/lib/supabase";

// Parsea precios en formato argentino: "$3.500" → 3500
const parsePrice = (s: string) => parseInt(s.replace(/[$. ]/g, ''), 10) || 0;

interface CartItem {
  product: CatalogProduct;
  quantity: number;
}

const Pedidos = () => {

  const [orderMode, setOrderMode] = useState<"delivery" | "takeaway" | null>(null);
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

  // Persistir carrito en localStorage + notificar Navbar
  useEffect(() => {
    localStorage.setItem('kiku-cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('kiku-cart-update'));
  }, [cart]);

  // Checkout flow
  const [step, setStep] = useState<"catalog" | "checkout" | "confirmado">("catalog");
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pedidoNum, setPedidoNum] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notasExtra, setNotasExtra] = useState("");

  // ─── Fetch catalog from Google Sheets ─────────────────────────────────────
  const [catalogData, setCatalogData] = useState<CatalogCategory[]>(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalogFromSheet()
      .then((data) => setCatalogData(data))
      .catch(() => setCatalogData(fallbackData))
      .finally(() => setLoading(false));
  }, []);

  // Auto-open cart when navigated with #cart hash
  useEffect(() => {
    if (window.location.hash === '#cart' && cart.length > 0) {
      setCartOpen(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

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
    setEnviando(true);
    try {
      const subtotal = cart.reduce((s, i) => s + parsePrice(i.product.price) * i.quantity, 0);
      const envio   = orderMode === "delivery" ? 3500 : 0;
      const total   = subtotal + envio;

      const notas = [
        `Cliente: ${nombre}`,
        `Tel: ${telefono}`,
        orderMode === "delivery" ? `Dirección: ${direccion}` : "Retiro en local",
        notasExtra ? `Notas: ${notasExtra}` : "",
      ].filter(Boolean).join(" | ");

      const { data: pedido, error: e1 } = await supabase
        .from("pedidos")
        .insert({ canal: orderMode === "delivery" ? "delivery" : "takeaway", total, notas })
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

  // ─── Mode selection screen ──────────────────────────────────────────────────
  if (!orderMode) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] bg-glow opacity-70 blur-3xl pointer-events-none" />

          <div className="container relative z-10 text-center max-w-2xl">
            <span className="font-jp text-accent text-sm tracking-widest">— ご注文 —</span>
            <h1 className="font-display text-5xl sm:text-7xl mt-4 mb-4 glow-text-soft">
              Pedidos
            </h1>
            <p className="text-muted-foreground mb-12">
              Realizá tu pedido para delivery o takeaway
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              <button
                onClick={() => setOrderMode("delivery")}
                className="group relative bg-gradient-card border border-border rounded-2xl p-8 text-left hover:border-primary/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-glow opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/40 flex items-center justify-center mb-5">
                    <Truck className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-display text-2xl mb-2">Delivery</h3>
                  <p className="text-sm text-muted-foreground mb-1">Lo enviamos a tu domicilio</p>
                  <p className="text-xs text-accent">Costo de envío: $3.500</p>
                </div>
              </button>

              <button
                onClick={() => setOrderMode("takeaway")}
                className="group relative bg-gradient-card border border-border rounded-2xl p-8 text-left hover:border-primary/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-glow opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/40 flex items-center justify-center mb-5">
                    <Store className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-display text-2xl mb-2">Retiro en local</h3>
                  <p className="text-sm text-muted-foreground mb-1">Pasás a buscarlo al local</p>
                  <p className="text-xs text-accent">Sin costo de envío</p>
                </div>
              </button>
            </div>

            <a
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground mt-10 hover:text-foreground transition-colors"
            >
              ← Volver al inicio
            </a>
          </div>
        </section>
      </div>
    );
  }

  // ─── Catalog view ───────────────────────────────────────────────────────────
  const categories = filteredCategories;
  const visibleCategories = activeCategory
    ? categories.filter((c) => c.name === activeCategory)
    : categories;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header bar */}
      <section className="pt-24 pb-6 relative">
        <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] bg-glow opacity-50 blur-3xl pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOrderMode(null)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                ← Cambiar
              </button>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent text-[10px] uppercase tracking-[0.3em]">
                {orderMode === "delivery" ? (
                  <><Truck className="w-3 h-3" /> Delivery</>
                ) : (
                  <><Store className="w-3 h-3" /> Retiro en local</>
                )}
              </span>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2 bg-gradient-neon text-primary-foreground text-xs font-semibold uppercase tracking-widest px-5 py-2.5 rounded-full hover:scale-105 transition-transform glow-neon"
            >
              <ShoppingBag className="w-4 h-4" />
              Pedido
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar en el menú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/60 border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-5 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-all ${
                !activeCategory
                  ? "bg-gradient-neon text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {catalogData.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name === activeCategory ? null : cat.name)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-all ${
                  activeCategory === cat.name
                    ? "bg-gradient-neon text-primary-foreground border-transparent"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="pb-32">
        <div className="container">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-muted-foreground text-sm">Cargando menú...</p>
            </div>
          ) : visibleCategories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No se encontraron productos para "{searchQuery}"
              </p>
            </div>
          ) : (
          visibleCategories.map((cat) => (
            <div key={cat.name} className="mb-14">
              <div className="mb-6 animate-fade-up">
                <h2 className="font-display text-3xl md:text-4xl">{cat.name}</h2>
                {cat.subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{cat.subtitle}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.products.map((product) => {
                  const inCart = cart.find((i) => i.product.id === product.id);
                  return (
                    <article
                      key={product.id}
                      className="group relative bg-gradient-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all duration-500 overflow-hidden animate-fade-up"
                    >
                      <div className="absolute -top-20 -right-20 w-32 h-32 bg-glow opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
                      <div className="relative flex flex-col h-full">
                        {/* Image placeholder — ready for real images from sheet/db */}
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-40 object-cover rounded-xl mb-4"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-40 rounded-xl mb-4 bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 flex items-center justify-center">
                            <span className="font-jp text-3xl text-primary/30">菊</span>
                          </div>
                        )}

                        {product.badge && (
                          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-accent text-[10px] uppercase tracking-wider font-semibold">
                            {product.badge}
                          </span>
                        )}

                        <h3 className="font-display text-xl mb-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-sm font-semibold text-gradient-neon">
                            {product.price}
                          </span>

                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold w-5 text-center">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => addToCart(product)}
                                className="w-7 h-7 rounded-full bg-gradient-neon flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/40 text-xs text-accent hover:bg-gradient-neon hover:text-primary-foreground hover:border-transparent transition-all"
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
          className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-gradient-neon text-primary-foreground text-center font-semibold tracking-wider uppercase py-4 rounded-2xl glow-neon-strong animate-pulse-glow text-sm flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Ver pedido · {cartCount} {cartCount === 1 ? "item" : "items"}
        </button>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-fade-up">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-display text-2xl">Tu pedido</h3>
              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Tu pedido está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-start gap-3 bg-background/40 rounded-xl p-4 border border-border/60"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-base truncate">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.product.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item.product)}
                            className="w-6 h-6 rounded-full bg-gradient-neon flex items-center justify-center text-primary-foreground"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-border">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">Modo</span>
                  <span className="font-semibold">{orderMode === "delivery" ? "Delivery (+$3.500)" : "Retiro en local"}</span>
                </div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${cart.reduce((s,i) => s + parsePrice(i.product.price)*i.quantity,0).toLocaleString("es-AR")}</span>
                </div>
                {orderMode === "delivery" && (
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-semibold">$3.500</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-5 text-sm font-bold">
                  <span>Total</span>
                  <span className="text-accent">${(cart.reduce((s,i) => s + parsePrice(i.product.price)*i.quantity,0) + (orderMode==="delivery"?3500:0)).toLocaleString("es-AR")}</span>
                </div>
                <button
                  onClick={() => { setCartOpen(false); setStep("checkout"); }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-neon text-primary-foreground font-semibold uppercase tracking-widest text-sm py-4 rounded-full glow-neon hover:scale-[1.02] transition-transform"
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
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" onClick={() => setStep("catalog")} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-display text-2xl">Datos de contacto</h3>
              <button onClick={() => setStep("catalog")} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={confirmarPedido} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nombre completo *</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                  placeholder="Tu nombre" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Teléfono *</label>
                <input value={telefono} onChange={e => setTelefono(e.target.value)} required type="tel"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                  placeholder="+54 9 341 000 0000" />
              </div>
              {orderMode === "delivery" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Dirección de entrega *</label>
                  <input value={direccion} onChange={e => setDireccion(e.target.value)} required
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                    placeholder="Calle y número, piso/depto" />
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notas (opcional)</label>
                <textarea value={notasExtra} onChange={e => setNotasExtra(e.target.value)} rows={2}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 resize-none"
                  placeholder="Sin cebolla, sin tacc, etc." />
              </div>
              {errorMsg && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400 break-all">
                  ⚠️ {errorMsg}
                </div>
              )}
              <button type="submit" disabled={enviando}
                onClick={() => setErrorMsg(null)}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-neon text-primary-foreground font-semibold uppercase tracking-widest text-sm py-4 rounded-full glow-neon hover:scale-[1.02] transition-transform disabled:opacity-60">
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar pedido"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Pedido confirmado ── */}
      {step === "confirmado" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <p className="font-jp text-accent text-sm tracking-widest mb-2">— ありがとう —</p>
              <h2 className="font-display text-4xl mb-2">¡Pedido recibido!</h2>
              {pedidoNum && <p className="text-muted-foreground text-sm">Pedido <span className="text-accent font-bold">#{pedidoNum}</span></p>}
              <p className="text-muted-foreground text-sm mt-2">Nos ponemos a prepararlo. Te contactamos a la brevedad al número que indicaste.</p>
            </div>
            <button onClick={() => { setStep("catalog"); setOrderMode(null); }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-sm hover:border-primary/40 hover:text-accent transition-colors">
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;
