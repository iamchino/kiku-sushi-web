// ─── Kiku Sushi – Carta Salón ─────────────────────────────────────────────────
// Fuente de datos: Supabase (tabla menu_items, tipo = 'carta')
// El dueño gestiona los productos desde el dashboard en /menu
// ──────────────────────────────────────────────────────────────────────────────

import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartaItem {
  id: string
  name: string
  description: string
  price?: string
  image?: string
  category: string
  badge?: string
}

export interface CartaSection {
  name: string
  subtitle?: string
  items: CartaItem[]
}

// ─── Fetch desde Supabase ─────────────────────────────────────────────────────

export async function fetchCartaFromSheet(): Promise<CartaSection[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, categoria, subtitulo, nombre, descripcion, precio, imagen_url, etiqueta')
      .eq('tipo', 'carta')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) throw error
    if (!data?.length) return fallbackCartaData

    return groupToSections(data)
  } catch (err) {
    console.error('Error cargando carta desde Supabase:', err)
    return fallbackCartaData
  }
}

// ─── Agrupador por sección ────────────────────────────────────────────────────

function groupToSections(rows: any[]): CartaSection[] {
  const map = new Map<string, CartaSection>()

  rows.forEach((row) => {
    if (!map.has(row.categoria)) {
      map.set(row.categoria, {
        name: row.categoria,
        subtitle: row.subtitulo || undefined,
        items: [],
      })
    }
    map.get(row.categoria)!.items.push({
      id: row.id,
      name: row.nombre,
      description: row.descripcion || '',
      price: row.precio || undefined,
      image: row.imagen_url || undefined,
      category: row.categoria,
      badge: row.etiqueta || undefined,
    })
  })

  return Array.from(map.values())
}

// ─── Datos de respaldo ────────────────────────────────────────────────────────

export const fallbackCartaData: CartaSection[] = [
  {
    name: 'Combinados',
    subtitle: 'Surtidos de 12 y 15 piezas',
    items: [
      { id: 'c-kiku-12', name: 'Kiku 12 pzas', description: 'Ebi Roll · Philadelphia Roll · Ahumado Roll · New York Roll', category: 'Combinados', badge: 'Popular' },
      { id: 'c-fusion-12', name: 'Fusión 12 pzas', description: 'Sake Roll · Tartar Sake Roll · Guacamole Roll · Ebi Roll · Spicy Roll', category: 'Combinados' },
      { id: 'c-nikkei-12', name: 'Nikkei 12 pzas', description: 'Sake Roll · Tempura Roll · Acevichado Roll · Ebi Roll · Nikkei Roll', category: 'Combinados', badge: 'Premium' },
    ],
  },
  {
    name: 'Gyozas',
    subtitle: 'Empanadillas japonesas · 4 unidades',
    items: [
      { id: 'g-langostinos', name: 'Gyozas de Langostinos', description: 'Relleno de langostinos al curry. Selladas y al vapor.', category: 'Gyozas' },
      { id: 'g-ternera', name: 'Gyozas de Ternera', description: 'Relleno de ternera. Selladas y al vapor. Salsa de soja cítrica.', category: 'Gyozas' },
      { id: 'g-chicken', name: 'Gyozas Chicken Teriyaki', description: 'Relleno de pollo y teriyaki. Selladas y al vapor.', category: 'Gyozas' },
    ],
  },
  {
    name: 'Platos Calientes',
    subtitle: 'Cocina de wok y plancha',
    items: [
      { id: 'h-trucha', name: 'Trucha a la Plancha', description: 'Sellada en manteca especiada. Ensalada de estación tibia.', category: 'Platos Calientes' },
      { id: 'h-pulpo', name: 'Pulpo con Salsa Brava', description: 'Grillado con aceite de pimentón ahumado, papines y salsa brava.', category: 'Platos Calientes', badge: 'Premium' },
    ],
  },
]
