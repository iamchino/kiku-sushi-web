// ─── Kiku Sushi – Catálogo de Delivery / Pedidos ──────────────────────────────
// Fuente de datos: Supabase (tabla menu_items, tipo = 'delivery')
// El dueño gestiona los productos desde el dashboard en /menu
// ──────────────────────────────────────────────────────────────────────────────

import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CatalogProduct {
  id: string
  name: string
  description: string
  /** Precio flexible: "$12.500" o "5p: $12.500 / 9p: $23.200" */
  price: string
  image?: string
  category: string
  badge?: string
}

export interface CatalogCategory {
  name: string
  subtitle?: string
  products: CatalogProduct[]
}

// ─── Fetch desde Supabase ─────────────────────────────────────────────────────

export async function fetchCatalogFromSheet(): Promise<CatalogCategory[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, categoria, subtitulo, nombre, descripcion, precio, imagen_url, etiqueta')
      .eq('tipo', 'delivery')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) throw error
    if (!data?.length) return fallbackData

    return groupToCategories(data)
  } catch (err) {
    console.error('Error cargando catálogo desde Supabase:', err)
    return fallbackData
  }
}

// ─── Agrupador de filas por categoría ────────────────────────────────────────

function groupToCategories(rows: any[]): CatalogCategory[] {
  const map = new Map<string, CatalogCategory>()

  rows.forEach((row) => {
    if (!map.has(row.categoria)) {
      map.set(row.categoria, {
        name: row.categoria,
        subtitle: row.subtitulo || undefined,
        products: [],
      })
    }
    map.get(row.categoria)!.products.push({
      id: row.id,
      name: row.nombre,
      description: row.descripcion || '',
      price: row.precio || '',
      image: row.imagen_url || undefined,
      category: row.categoria,
      badge: row.etiqueta || undefined,
    })
  })

  return Array.from(map.values())
}

// ─── Datos de respaldo (si Supabase no responde) ──────────────────────────────

export const fallbackData: CatalogCategory[] = [
  {
    name: 'Entradas - Rebozados',
    subtitle: 'Apanados en panco y fritos',
    products: [
      { id: 'spicy-4', name: '4 Spicy Roll', description: 'Relleno de salmón rosado, palta y queso. Coronado de mayonesa spicy.', price: '$12.100', category: 'Entradas - Rebozados' },
      { id: 'spicy-8', name: '8 Spicy Roll', description: 'Relleno de salmón rosado, palta y queso. Coronado de mayonesa spicy.', price: '$17.000', category: 'Entradas - Rebozados' },
      { id: 'maki-furai-2', name: '2 Maki Furai', description: 'Maki de salmón apanado y frito. Top de guacamole y vieiras rancheras.', price: '$11.200', category: 'Entradas - Rebozados' },
      { id: 'maki-furai-4', name: '4 Maki Furai', description: 'Maki de salmón apanado y frito. Top de guacamole y vieiras rancheras.', price: '$17.000', category: 'Entradas - Rebozados' },
      { id: 'ranchero-2', name: '2 Ranchero Roll', description: 'Relleno de salmón rosado, palta y queso. Coronado de langostinos picantes sobre guacamole.', price: '$12.200', category: 'Entradas - Rebozados' },
      { id: 'ranchero-4', name: '4 Ranchero Roll', description: 'Relleno de salmón rosado, palta y queso. Coronado de langostinos picantes sobre guacamole.', price: '$16.700', category: 'Entradas - Rebozados' },
      { id: 'langostinos-furai-2', name: '2 Langostinos Furai', description: 'Rebozados en panco. Con salsa agridulce de mostaza y miel.', price: '$9.000', category: 'Entradas - Rebozados' },
      { id: 'langostinos-furai-4', name: '4 Langostinos Furai', description: 'Rebozados en panco. Con salsa agridulce de mostaza y miel.', price: '$14.000', category: 'Entradas - Rebozados' },
      { id: 'langostinos-furai-6', name: '6 Langostinos Furai', description: 'Rebozados en panco. Con salsa agridulce de mostaza y miel.', price: '$22.000', category: 'Entradas - Rebozados' },
      { id: 'oniguiri-furai', name: 'Oniguiri Furai', description: 'Triángulos de shari rellenos de salmón cocido. Coronado de mayo japo y salsa brava.', price: '$16.000', category: 'Entradas - Rebozados' },
      { id: 'dupla-furai', name: 'Dupla Furai', description: 'Ceviche de vieiras y tartar de salmón sobre shari furai.', price: '$17.000', category: 'Entradas - Rebozados' },
    ],
  },
  {
    name: 'Gyozas',
    subtitle: 'Empanadillas japonesas · 4 unidades',
    products: [
      { id: 'gyoza-chicken', name: 'Gyozas Chicken Teriyaki', description: 'Relleno de pollo y teriyaki. Al vapor.', price: '$13.900', category: 'Gyozas' },
      { id: 'gyoza-acevichadas', name: 'Gyozas Acevichadas', description: 'Fritas, rellenas de pesca blanca, cebolla y cilantro.', price: '$12.900', category: 'Gyozas' },
      { id: 'gyoza-langostinos', name: 'Gyozas de Langostinos', description: 'Relleno de langostinos al curry. Al vapor.', price: '$12.900', category: 'Gyozas' },
      { id: 'gyoza-tako', name: 'Gyozas Tako', description: 'Relleno de vegetales y pulpo. Al vapor.', price: '$12.000', category: 'Gyozas' },
      { id: 'gyoza-ternera', name: 'Gyozas de Ternera', description: 'Relleno de ternera. Con salsa de soja cítrica.', price: '$12.500', category: 'Gyozas' },
      { id: 'gyoza-veggie', name: 'Gyozas Veggie', description: 'Relleno de vegetales. Al vapor.', price: '$11.000', category: 'Gyozas' },
      { id: 'gyoza-cerdo', name: 'Gyozas de Cerdo', description: 'Relleno de carne de cerdo. Al vapor.', price: '$12.000', category: 'Gyozas' },
    ],
  },
  {
    name: 'Rollos de Sushi',
    subtitle: 'Presentaciones de 5, 8 y 9 piezas',
    products: [
      { id: 'ebi-roll', name: 'Ebi Roll', description: 'Salmón, queso, palta y langostinos. Salsa acevichada y huevas.', price: '5p: $12.500 / 9p: $23.200', category: 'Rollos de Sushi', badge: 'Popular' },
      { id: 'philadelphia-roll', name: 'Philadelphia Roll', description: 'Salmón y queso. Cubierto de sésamo blanco.', price: '5p: $12.800 / 9p: $22.200', category: 'Rollos de Sushi' },
      { id: 'ahumado-roll', name: 'Ahumado Roll', description: 'Salmón ahumado, palta y queso. Salsa de sésamo.', price: '5p: $13.200 / 9p: $22.900', category: 'Rollos de Sushi' },
      { id: 'new-york-roll', name: 'New York Roll', description: 'Salmón y palta. Cubierto de sésamo negro.', price: '5p: $13.300 / 9p: $23.300', category: 'Rollos de Sushi' },
      { id: 'nikkei-roll', name: 'Nikkei Roll', description: 'Langostinos furai y palta. Coronado de tartar de pulpo.', price: '5p: $14.900 / 9p: $27.800', category: 'Rollos de Sushi', badge: 'Premium' },
    ],
  },
  {
    name: 'Combinados',
    subtitle: 'Surtidos de 12 y 15 piezas',
    products: [
      { id: 'combinado-kiku', name: 'Kiku', description: 'Combinado clásico con Ebi, Phila, Ahumado y NY rolls.', price: '12p: $31.900 / 15p: $34.600', category: 'Combinados', badge: 'Popular' },
      { id: 'combinado-fusion', name: 'Fusión', description: 'Sake, Tartar, Guacamole y Spicy rolls.', price: '12p: $30.200 / 15p: $33.000', category: 'Combinados' },
    ],
  },
]
