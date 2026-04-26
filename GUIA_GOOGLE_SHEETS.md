# 🍣 Guía de Configuración: Catálogo autogestionable con Google Sheets

El sistema está preparado para que el dueño de **Kiku Sushi** pueda modificar la carta, precios e imágenes sin tocar el código. Todo se gestiona desde **un solo archivo de Google Sheets** con **dos pestañas**.

---

## Estructura del Google Sheet

Usamos **una sola hoja de cálculo** con **dos pestañas** (tabs):

| Pestaña | Página web | Archivo del código |
|---------|-----------|-------------------|
| **Pedidos** | `/pedidos` (delivery y retiro) | `src/data/catalog.ts` |
| **Carta Salón** | `/carta` (menú para comer en el local) | `src/data/cartaSalon.ts` |

---

## Paso 1: Crear la planilla

1. Entra a [Google Sheets](https://sheets.google.com) y crea una **hoja de cálculo en blanco**.
2. Renombrá la primera pestaña (abajo a la izquierda) como **"Pedidos"**.
3. Creá una segunda pestaña haciendo clic en el **"+"** y nombrala **"Carta Salón"**.

## Paso 2: Configurar las columnas

En **ambas pestañas**, la Fila 1 debe tener estos encabezados exactos:

| Columna | Ejemplo | ¿Obligatorio? |
|---------|---------|---------------|
| `categoria` | Gyozas | ✅ Sí |
| `subtitulo_categoria` | Empanadillas japonesas · 4 unidades | No |
| `nombre` | Gyozas de Langostinos | ✅ Sí |
| `descripcion` | Relleno de langostinos al curry... | ✅ Sí |
| `precio` | $12.900 | No (la carta salón puede no tener precios) |
| `imagen_url` | https://i.imgur.com/AbCdEf.jpg | No |
| `etiqueta` | Popular, Premium, Nuevo | No |

> [!IMPORTANT]  
> Los títulos de la Fila 1 deben estar **sin tildes** y exactamente como se muestran arriba.

## Paso 3: Cargar los productos

- Cada fila = un producto.
- Los productos con la misma `categoria` se agrupan automáticamente bajo esa sección.
- Si creás una categoría nueva (ej: "Postres"), aparece automáticamente en la web.
- Si borrás todos los productos de una categoría, esa sección desaparece de la web.

## Paso 4: Publicar cada pestaña como CSV

Hay que publicar **cada pestaña por separado**:

1. En tu Google Sheet: **Archivo > Compartir > Publicar en la web**.
2. En la ventana:
   - Primer menú: elegir la pestaña **"Pedidos"**.
   - Segundo menú: **"Valores separados por comas (.csv)"**.
3. Clic en **"Publicar"** → Copiar el enlace generado.
4. **Repetir** para la pestaña **"Carta Salón"** → Copiar su enlace.

> [!WARNING]
> Cada pestaña genera un enlace diferente. No mezclarlos.

## Paso 5: Pegar las URLs en el código

Abrí los dos archivos y pegá cada URL en su lugar:

**Para Pedidos** → `src/data/catalog.ts` (línea ~14):
```typescript
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/...pedidos...pub?output=csv";
```

**Para Carta Salón** → `src/data/cartaSalon.ts` (línea ~14):
```typescript
const CARTA_SHEET_CSV_URL = "https://docs.google.com/...carta...pub?output=csv";
```

Guardá ambos archivos. ¡Listo!

---

## 📸 ¿Cómo cargar imágenes?

La columna `imagen_url` espera un **enlace directo** a una imagen.

**Método recomendado (Imgur):**
1. Subí la foto a [Imgur.com](https://imgur.com/upload) (gratis, sin cuenta).
2. Clic derecho sobre la imagen → **"Copiar dirección de imagen"**.
3. Pegá ese enlace en la columna `imagen_url`.
   *(Ej: `https://i.imgur.com/AbCdEf.jpg`)*

Si dejás la celda vacía, la web muestra un elegante placeholder con el kanji "菊".

> [!NOTE]
> Ambas páginas (**Pedidos** y **Carta Salón**) soportan imágenes. Si dejás la celda vacía, se muestra un elegante placeholder con el kanji "菊".

---

## 💡 Resumen rápido para el dueño

| Quiero... | Qué hacer |
|-----------|-----------|
| Cambiar un precio | Editar la celda en el Sheet → se actualiza al recargar la web |
| Agregar un plato nuevo | Agregar una fila nueva en el Sheet |
| Quitar un plato | Borrar la fila del Sheet |
| Crear una categoría nueva | Escribir un nombre nuevo en la columna `categoria` |
| Eliminar una categoría | Borrar todas las filas de esa categoría |
| Cambiar una foto | Subir la nueva foto a Imgur y pegar el link nuevo |

> [!TIP]
> Todo se puede hacer desde el celular con la app de Google Sheets. Los cambios se reflejan instantáneamente al recargar la página web.
