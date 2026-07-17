import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Tests de la sección Ramen del home.
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
const mockUseRamen = vi.fn();
vi.mock("@/hooks/useRamen", () => ({
  useRamen: () => mockUseRamen(),
  formatPesos: (n: number) => `$${Number(n || 0).toLocaleString("es-AR")}`,
}));

// embla necesita mediciones de layout que jsdom no hace; lo stubbeamos con una
// API mínima. No testeamos embla (es una librería probada), sino que le
// pasemos la cantidad correcta de slides.
vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), undefined],
}));

import RamenShowcase from "@/components/kiku-v2/RamenShowcase";

const fotos = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    url: `https://example.test/ramen-${i + 1}.webp`,
    alt: `Foto ${i + 1}`,
  }));

const ramenBase = {
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
      <RamenShowcase />
    </MemoryRouter>
  );

// Cuenta solo las fotos del carrusel (la de fondo es aria-hidden).
const fotosDelCarrusel = () =>
  screen.queryAllByRole("img").filter((img) => !img.hasAttribute("aria-hidden"));

beforeEach(() => {
  mockUseRamen.mockReset();
});

describe("RamenShowcase — cuándo NO debe aparecer", () => {
  it("no renderiza nada si la sección está apagada", () => {
    mockUseRamen.mockReturnValue({ ramen: null, loading: false });
    const { container } = renderShowcase();
    expect(container).toBeEmptyDOMElement();
  });

  it("no renderiza nada mientras carga", () => {
    mockUseRamen.mockReturnValue({ ramen: null, loading: true });
    const { container } = renderShowcase();
    expect(container).toBeEmptyDOMElement();
  });
});

describe("RamenShowcase — contenido", () => {
  it("muestra título, descripción y precio formateado en pesos", () => {
    mockUseRamen.mockReturnValue({ ramen: ramenBase, loading: false });
    renderShowcase();

    expect(screen.getByRole("heading")).toHaveTextContent("Ramen de Kiku");
    expect(screen.getByText(/Caldo de 12 horas/)).toBeInTheDocument();
    expect(screen.getByText("$18.000")).toBeInTheDocument();
  });

  it("oculta el precio si es 0 — útil mientras todavía no está definido", () => {
    mockUseRamen.mockReturnValue({ ramen: { ...ramenBase, precio: 0 }, loading: false });
    renderShowcase();

    expect(screen.queryByText(/^\$/)).not.toBeInTheDocument();
    // pero el resto de la sección sigue en pie
    expect(screen.getByRole("heading")).toHaveTextContent("Ramen");
  });

  it("omite el overline japonés si viene vacío", () => {
    mockUseRamen.mockReturnValue({ ramen: { ...ramenBase, overline: "" }, loading: false });
    renderShowcase();
    expect(screen.queryByText(/—\s*ラーメン\s*—/)).not.toBeInTheDocument();
  });
});

describe("RamenShowcase — el carrusel se adapta a las fotos que haya", () => {
  it.each([2, 3, 4, 5])("con %i fotos renderiza exactamente %i slides", (n) => {
    mockUseRamen.mockReturnValue({ ramen: { ...ramenBase, imagenes: fotos(n) }, loading: false });
    renderShowcase();

    expect(fotosDelCarrusel()).toHaveLength(n);
  });

  it("usa el alt cargado desde el dashboard en cada foto", () => {
    mockUseRamen.mockReturnValue({ ramen: { ...ramenBase, imagenes: fotos(3) }, loading: false });
    renderShowcase();

    expect(screen.getByAltText("Foto 1")).toBeInTheDocument();
    expect(screen.getByAltText("Foto 3")).toBeInTheDocument();
  });

  it("cae a un alt derivado del título si la foto no trae alt", () => {
    mockUseRamen.mockReturnValue({
      ramen: { ...ramenBase, imagenes: [{ url: "a.webp", alt: "" }, { url: "b.webp", alt: "" }] },
      loading: false,
    });
    renderShowcase();

    expect(screen.getAllByAltText("Ramen de Kiku")).toHaveLength(2);
  });

  it("muestra los controles de navegación cuando hay más de una foto", () => {
    mockUseRamen.mockReturnValue({ ramen: { ...ramenBase, imagenes: fotos(4) }, loading: false });
    renderShowcase();

    expect(screen.getByLabelText("Foto anterior")).toBeInTheDocument();
    expect(screen.getByLabelText("Foto siguiente")).toBeInTheDocument();
  });

  it("la primera foto carga en eager y las demás en lazy (es la que se ve al bajar del hero)", () => {
    mockUseRamen.mockReturnValue({ ramen: { ...ramenBase, imagenes: fotos(3) }, loading: false });
    renderShowcase();

    const imgs = fotosDelCarrusel();
    expect(imgs[0]).toHaveAttribute("loading", "eager");
    expect(imgs[1]).toHaveAttribute("loading", "lazy");
    expect(imgs[2]).toHaveAttribute("loading", "lazy");
  });
});
