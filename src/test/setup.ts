import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom no implementa IntersectionObserver, y framer-motion lo usa para
// useInView (los reveals al scrollear). Sin este stub, cualquier test que
// renderice una sección animada explota. Reporta "visible" de entrada, que
// es lo que queremos en un test: el contenido revelado.
class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(private cb: IntersectionObserverCallback) {}
  observe(target: Element): void {
    this.cb(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as IntersectionObserver
    );
  }
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserverStub,
});
Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserverStub,
});
