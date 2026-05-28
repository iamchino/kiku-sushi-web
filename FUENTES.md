# Fuentes usadas en kiku-reservations

Listado completo para la community / cuando le pases a alguien que toque la web.

## TL;DR

3 fuentes, todas servidas desde **Google Fonts**. Una sola línea de `@import` en `src/index.css`. No hay self-hosting ni archivos `.woff` locales.

| Fuente | Tipo | Pesos cargados | Tailwind alias | Uso |
|---|---|---|---|---|
| **Cormorant Garamond** | Serif display | 300, 400, 500, 600, 700 | `font-display` | Títulos grandes, hero, headings de sección, números destacados |
| **Inter** | Sans-serif | 300, 400, 500, 600, 700 | `font-sans` (default) | Cuerpo, párrafos, navegación, formularios, microcopy |
| **Noto Serif JP** | Serif japonés | 400, 700 | `font-jp` | Textos en kanji / japonés (overlines tipo `おまかせ`, `菊`, `ご予約`, etc.) |

## Dónde están definidas

### 1. Carga (Google Fonts)
**Archivo:** `src/index.css`, línea 1.

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Noto+Serif+JP:wght@400;700&display=swap');
```

### 2. Aliases en Tailwind
**Archivo:** `tailwind.config.ts`, líneas 79-83.

```ts
fontFamily: {
  display: ['"Cormorant Garamond"', "serif"],
  sans:    ['Inter', "sans-serif"],
  jp:      ['"Noto Serif JP"', "serif"],
},
```

Esto habilita las clases `font-display`, `font-sans` y `font-jp`.

### 3. Asignaciones globales
**Archivo:** `src/index.css`.

- Línea 86: `body { font-family: 'Inter', sans-serif; }` → fuente por defecto del sitio.
- Línea 93: `h1..h6 { font-family: 'Cormorant Garamond', serif; }` → todos los headings sin clase explícita.
- Línea 104-107: utilidades `.font-display` (Cormorant) y `.font-jp` (Noto Serif JP) por si se quieren usar fuera de Tailwind.
- Línea 199: el subtree `.v2-root` fuerza `font-family: 'Inter'` para el rediseño V2.
- Líneas 204-205: dentro de `.v2-root`, `.font-jp` y `.font-display` mapean a Noto Serif JP y Cormorant respectivamente.
- Línea 269: estilo italic decorativo usa Cormorant Garamond.

## Notas para la community

- **No hay licencias por pagar** — las 3 fuentes son gratis (Google Fonts, SIL Open Font License).
- **Pesos elegidos** son los que se usan en clases como `font-light` (300), `font-normal` (400), `font-medium` (500), `font-semibold` (600), `font-bold` (700). Para Noto Serif JP solo 400 y 700 porque sólo se usa en piezas decorativas cortas.
- **`display=swap`** está activado: si las fuentes tardan en cargar, el navegador muestra la fuente del sistema y hace swap cuando terminan. No hay FOUT bloqueante.
- **Reemplazar una fuente** = cambiar la URL del `@import` en `index.css` + actualizar el alias correspondiente en `tailwind.config.ts`.
- **Dirección visual** ("Neón violeta editorial, punk neo-tokyo con cuidado femenino"): Cormorant aporta lo editorial/refinado, Inter la legibilidad neutra moderna, Noto Serif JP el guiño cultural japonés. Cualquier sustitución debería mantener ese balance serif-editorial / sans-neutra / serif-jp.
