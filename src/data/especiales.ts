// ─── Kiku Sushi – Especiales de Kiku ──────────────────────────────────────────
// Fuente de datos: Supabase (tablas `especiales` + `especial_pasos`)
// El dueño los gestiona desde el dashboard en /menu → tab "Especiales Web".
// Fallback: los 3 especiales originales hardcodeados, por si Supabase no responde.
// ──────────────────────────────────────────────────────────────────────────────

import { supabase } from '../lib/supabase'

import umamiImg from '@/assets/umami-especial.webp'
import pacificoImg from '@/assets/pacifico-especial.webp'
import pastaNikkeiImg from '@/assets/pasta-nikkei.webp'

// ─── Types (shape que consume EspecialesSection) ─────────────────────────────

export interface RollItem {
  /** Nombre del roll, ej: "Centolla roll" */
  roll: string
  /** Descripción del roll */
  detalle: string
}

export interface Paso {
  label: string
  text: string
  /** Si el paso es un combo, lista de rolls que lo componen */
  items?: RollItem[]
}

export interface Especial {
  id: string
  /** id de experiencia en el form de reservas */
  experiencia: string
  number: string
  overline: string
  title: string
  titleAccent: string
  description: string
  pasos?: Paso[]
  precio?: string
  /** Línea de autor, ej: "— Chef Selection · Marcelo Castro —" */
  firma?: string
  image: string
  imageAlt: string
}

// Imágenes locales por slug: si el especial no tiene imagen subida en el
// dashboard, usamos el asset original del repo.
const IMAGENES_LOCALES: Record<string, string> = {
  umami: umamiImg,
  pacifico: pacificoImg,
  'pasta-nikkei': pastaNikkeiImg,
}
const IMAGEN_DEFAULT = umamiImg

// ─── Formato de precio ────────────────────────────────────────────────────────
// La BD guarda el precio numérico (ej. 39500) + nota ("por persona").
// Lo mostramos como "$39.500 por persona".
function formatPrecio(precio: unknown, nota?: string | null): string | undefined {
  if (precio == null || precio === '') return undefined
  const n = typeof precio === 'number' ? precio : Number(String(precio).replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(n) || n <= 0) return undefined
  return `$${n.toLocaleString('es-AR')}${nota ? ` ${nota}` : ''}`
}

// ─── Mapeo fila BD → shape del componente ─────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(row: any): Especial {
  const pasosRows = ((row.especial_pasos || []) as any[])
    .slice()
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))

  const pasos: Paso[] = pasosRows.map((p) => {
    const items = Array.isArray(p.items)
      ? (p.items as any[])
          .filter((it) => it && it.roll)
          .map((it) => ({ roll: String(it.roll), detalle: String(it.detalle || '') }))
      : []
    return {
      label: p.etiqueta,
      text: p.texto,
      ...(items.length > 0 ? { items } : {}),
    }
  })

  return {
    id: row.slug || row.id,
    experiencia: row.experiencia,
    number: row.numero || '',
    overline: row.overline || '',
    title: row.titulo,
    titleAccent: row.titulo_acento || '',
    description: row.descripcion || '',
    ...(pasos.length > 0 ? { pasos } : {}),
    precio: formatPrecio(row.precio, row.precio_nota),
    ...(row.firma ? { firma: row.firma } : {}),
    image: row.imagen_url || IMAGENES_LOCALES[row.slug] || IMAGEN_DEFAULT,
    imageAlt: row.imagen_alt || `Especial ${row.titulo}`,
  }
}

// ─── Fetch desde Supabase ─────────────────────────────────────────────────────
// - Devuelve solo los activos (además la RLS filtra activo=true para anon).
// - Si la BD devuelve [] (todos desactivados a propósito), respetamos el vacío
//   y la sección se oculta.
// - Si hay error (tabla inexistente, red caída), devolvemos el fallback para
//   que la web nunca quede rota.

export async function fetchEspeciales(): Promise<Especial[]> {
  try {
    const { data, error } = await supabase
      .from('especiales')
      .select('*, especial_pasos(*)')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) throw error
    if (!data) return fallbackEspeciales

    return data.map(mapRow)
  } catch (err) {
    console.error('Error cargando especiales desde Supabase:', err)
    return fallbackEspeciales
  }
}

// ─── Datos de respaldo (los 3 especiales originales) ──────────────────────────

export const fallbackEspeciales: Especial[] = [
  {
    id: 'umami',
    experiencia: 'umami_del_sur',
    number: '01',
    overline: '— 南の旨味 —',
    title: 'Umami',
    titleAccent: 'del Sur',
    description:
      'Una experiencia de pasos donde el mar toma protagonismo. Los sabores se vuelven más profundos, cada paso está pensado para sorprender.',
    pasos: [
      {
        label: 'Entrada',
        text: 'Ostras gratinadas en emulsión de manteca, lima y parmesano.',
      },
      {
        label: 'Principal',
        text: '15 piezas de autor.',
        items: [
          {
            roll: 'Centolla roll',
            detalle: 'shiromi furai y palta, coronado con centolla y mayo nipona.',
          },
          {
            roll: 'Maki de vieiras',
            detalle:
              'salmón, rúcula y pepino en juliana, coronado de tartar de vieiras y emulsión cítrica.',
          },
          {
            roll: 'Ebi furai roll',
            detalle: 'langostinos furai y queso crema, chimi nipón, coronado con crocante de boniato.',
          },
        ],
      },
      {
        label: 'Maridaje',
        text: 'Albariño y Riesling de Viña las Perdices.',
      },
    ],
    precio: '$39.500 por persona',
    image: umamiImg,
    imageAlt: 'Especial Umami — pasos de mar con maridaje',
  },
  {
    id: 'pacifico',
    experiencia: 'pacifico_y_patagonia',
    number: '02',
    overline: '— 太平洋 と パタゴニア —',
    title: 'Pacífico',
    titleAccent: 'y Patagonia',
    description:
      'El mar en cada paso: de la costa peruana a los fríos del sur, con maridaje by Viñas Las Perdices.',
    pasos: [
      {
        label: 'Entrada',
        text: 'Causa limeña con navajas del Sur.',
      },
      {
        label: 'Principal',
        text: '15 piezas de sushi.',
        items: [
          {
            roll: 'Huancaína roll',
            detalle:
              'langostinos furai y palta, semicubierto de salmón, salsa huancaína y polvo de aceituna.',
          },
          {
            roll: 'Maguro roll',
            detalle: 'tartar de atún rojo y paltas selladas, semicubierto de salmón, salsa brava.',
          },
          {
            roll: 'Ceviche roll',
            detalle:
              'langostinos furai y queso crema, coronado con ceviche confitado de langostinos australes y pesca blanca, con notas cítricas.',
          },
        ],
      },
      {
        label: 'Maridaje',
        text: 'Albariño y Riesling de Viña las Perdices.',
      },
    ],
    precio: '$39.500 por persona',
    image: pacificoImg,
    imageAlt: 'Especial Pacífico y Patagonia — rolls con maridaje',
  },
  {
    id: 'pasta-nikkei',
    experiencia: 'pasta_nikkei',
    number: '03',
    overline: '— 日系 パスタ —',
    title: 'Pasta Nikkei',
    titleAccent: 'del Atlántico',
    description:
      'Pasta negra con tinta de calamar, crema suave de miso, mejillones y langostinos salteados, terminada con aceite picante y crocante de almendras.',
    precio: '$30.000 por persona',
    image: pastaNikkeiImg,
    imageAlt: 'Pasta Nikkei del Atlántico — pasta negra con mejillones y langostinos',
  },
]
