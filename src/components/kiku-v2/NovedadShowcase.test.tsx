import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Tests de la sección "Nuevo" del home (el plato del momento).
 *
 * Lo que importa acá no es que renderice lindo, sino que respete las dos reglas
 * que la hacen segura de tener en producción con contenido a medio cargar:
 *
 *   1. Si está apagada o incompleta, NO se renderiza nada.
 *   2. El carrusel se adapta a la cantidad real de fotos (2 a 5), sin huecos.
 */

// El hook consulta Supabase; acá lo mockeamos entero para controlar el input.
// No usamos importActual: cargar el módulo real arrastra src/lib/supabase.ts,
// que tira si faltan las env vars — y en un test unitario no queremos esa red.
const mockUseNovedad = vi.fn();
vi.mock("@/hooks/useNovedad", () => ({
  useNovedad: () => mockUseNovedad(),
  formatPesos: (n: number) => `$${Number(n || 0).toLocaleString("es-AR")}`,
}));

// embla necesita mediciones de layout que jsdom no hace; lo stubbeamos con una
// API mínima. No testeamos embla (es una librería probada), sino que le
// pasemos la cantidad correcta de slides.
vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), undefined],
}));

import NovedadShowcase from "@/components/kiku-v2/NovedadShowcase";

const fotos = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    url: `https://example.test/novedad-${i + 1}.webp`,
    alt: `Foto ${i + 1}`,
  }));

const novedadBase = {
  activo: true,
  overline: "ラーメン",
  titulo: "Ramen",
  tituloAccent: "de Kiku",
  descripcion: "Caldo de 12 horas y fideos frescos.",
  precio: 18000,
  imagenes: fotos(3),
};

const renderShowcase = () =>
  render(
    <MemoryRouter>
      <NovedadShowcase />
    </MemoryRouter>
  );

// Cuenta solo las fotos del carrusel (la de fondo es aria-hidden).
const fotosDelCarrusel = () =>
  screen.queryAllByRole("img").filter((img) => !img.hasAttribute("aria-hidden"));

beforeEach(() => {
  mockUseNovedad.mockReset();
});

describe("NovedadShowcase — cuándo NO debe aparecer", () => {
  it("no renderiza nada si la sección está apagada", () => {
    mockUseNovedad.mockReturnValue({ novedad: null, loading: false });
    const { container } = renderShowcase();
    expect(container).toBeEmptyDOMElement();
  });

  it("no renderiza nada mientras carga", () => {
    mockUseNovedad.mockReturnValue({ novedad: null, loading: true });
    const { container } = renderShowcase();
    expect(container).toBeEmptyDOMElement();
  });
});

describe("NovedadShowcase — contenido", () => {
  it("muestra título, descripción y precio formateado en pesos", () => {
    mockUseNovedad.mockReturnValue({ novedad: novedadBase, loading: false });
    renderShowcase();

    expect(screen.getByRole("heading")).toHaveTextContent("Ramen de Kiku");
    expect(screen.getByText(/Caldo de 12 horas/)).toBeInTheDocument();
    expect(screen.getByText("$18.000")).toBeInTheDocument();
  });

  it("oculta el precio si es 0 — útil mientras todavía no está definido", () => {
    mockUseNovedad.mockReturnValue({ novedad: { ...novedadBase, precio: 0 }, loading: false });
    renderShowcase();

    expect(screen.queryByText(/^\$/)).not.toBeInTheDocument();
    // pero el resto de la sección sigue en pie
    expect(screen.getByRole("heading")).toHaveTextContent("Ramen");
  });

  it("omite el overline japonés si viene vacío", () => {
    mockUseNovedad.mockReturnValue({ novedad: { ...novedadBase, overline: "" }, loading: false });
    renderShowcase();
    expect(screen.queryByText(/—\s*ラーメン\s*—/)).not.toBeInTheDocument();
  });
});

describe("NovedadShowcase — el carrusel se adapta a las fotos que haya", () => {
  it.each([2, 3, 4, 5])("con %i fotos renderiza exactamente %i slides", (n) => {
    mockUseNovedad.mockReturnValue({ novedad: { ...novedadBase, imagenes: fotos(n) }, loading: false });
    renderShowcase();

    expect(fotosDelCarrusel()).toHaveLength(n);
  });

  it("usa el alt cargado desde el dashboard en cada foto", () => {
    mockUseNovedad.mockReturnValue({ novedad: { ...novedadBase, imagenes: fotos(3) }, loading: false });
    renderShowcase();

    expect(screen.getByAltText("Foto 1")).toBeInTheDocument();
    expect(screen.getByAltText("Foto 3")).toBeInTheDocument();
  });

  it("cae a un alt derivado del título si la foto no trae alt", () => {
    mockUseNovedad.mockReturnValue({
      novedad: { ...novedadBase, imagenes: [{ url: "a.webp", alt: "" }, { url: "b.webp", alt: "" }] },
      loading: false,
    });
    renderShowcase();

    expect(screen.getAllByAltText("Ramen de Kiku")).toHaveLength(2);
  });

  it("muestra los controles de navegación cuando hay más de una foto", () => {
    mockUseNovedad.mockReturnValue({ novedad: { ...novedadBase, imagenes: fotos(4) }, loading: false });
    renderShowcase();

    expect(screen.getByLabelText("Foto anterior")).toBeInTheDocument();
    expect(screen.getByLabelText("Foto siguiente")).toBeInTheDocument();
  });

  it("la primera foto carga en eager y las demás en lazy (es la que se ve al bajar del hero)", () => {
    mockUseNovedad.mockReturnValue({ novedad: { ...novedadBase, imagenes: fotos(3) }, loading: false });
    renderShowcase();

    const imgs = fotosDelCarrusel();
    expect(imgs[0]).toHaveAttribute("loading", "eager");
    expect(imgs[1]).toHaveAttribute("loading", "lazy");
    expect(imgs[2]).toHaveAttribute("loading", "lazy");
  });
});
