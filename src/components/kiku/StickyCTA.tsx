const StickyCTA = () => {
  return (
    <a
      href="/pedidos"
      className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-gradient-neon text-primary-foreground text-center font-semibold tracking-wider uppercase py-4 rounded-2xl glow-neon-strong animate-pulse-glow text-sm flex items-center justify-center gap-2"
    >
      🛵 Pedir delivery ahora
    </a>
  );
};

export default StickyCTA;
