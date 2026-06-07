import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import IndexV2 from "./pages/IndexV2.tsx";
import NotFound from "./pages/NotFound.tsx";
import Pedidos from "./pages/Pedidos.tsx";
import Carta from "./pages/Carta.tsx";
import SushiLibre from "./pages/SushiLibre.tsx";
import Omakase from "./pages/Omakase.tsx";
import Reservar from "./pages/Reservar.tsx";
import Pedir from "./pages/Pedir.tsx";

const queryClient = new QueryClient();

/** Al cambiar de página, subir siempre al top. Los anchors (/#seccion) los maneja cada página. */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* V2 es ahora la web principal */}
          <Route path="/" element={<IndexV2 />} />
          {/* Version original (V1) conservada */}
          <Route path="/v1" element={<Index />} />
          {/* Alias previo de la V2, se mantiene por compatibilidad */}
          <Route path="/preview" element={<IndexV2 />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/carta" element={<Carta />} />
          <Route path="/sushi-libre" element={<SushiLibre />} />
          <Route path="/omakase" element={<Omakase />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/pedir" element={<Pedir />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
