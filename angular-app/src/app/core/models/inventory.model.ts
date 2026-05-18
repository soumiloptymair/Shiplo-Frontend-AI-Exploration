export type InventoryTab = 'SKUs' | 'Products';

export interface ProductVariant {
  id: string;
  name: string;
  extId: string;
  sku: string;
  value: string;
  tags: string[];
  extraTagCount: number;
  size: string;
  color: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  hasInventory: boolean;
  needsAttention?: boolean;
}

export interface InventoryProduct {
  id: string;
  name: string;
  extId: string;
  type: string;
  attributes: string;
  hsCode: string;
  origin: string;
  variantCount: number;
  valueRange: string;
  needsAttention?: boolean;
  variants: ProductVariant[];
}

const SIZES = ['small', 'medium', 'large'];
const COLORS = ['grey', 'black', 'blue', 'white', 'red', 'green'];
const VALUES = ['$16.50', '$18.50', '$20.50'];

function buildVariants(productId: string, count: number): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (let i = 1; i <= count; i++) {
    const hasInventory = i % 3 === 1;
    const needsAttention = i % 4 === 0;
    variants.push({
      id: `${productId}-v-${i}`,
      name: `Variant ${i}`,
      extId: '12345A234',
      sku: `PBM${productId.replace('p-', '49514')}${String(i).padStart(3, '0')}`,
      value: VALUES[i % VALUES.length],
      tags: ['Tag 1'],
      extraTagCount: i === count ? 0 : 2,
      size: SIZES[i % SIZES.length],
      color: COLORS[Math.floor((i - 1) / 3) % COLORS.length],
      length: hasInventory ? '15' : '-',
      width: hasInventory ? '15' : '-',
      height: hasInventory ? '40' : '-',
      weight: hasInventory ? '15' : '-',
      hasInventory,
      needsAttention,
    });
  }
  return variants;
}

const PRODUCT_NAMES = [
  'Basic Moving Chairs Kit',
  'Compact Office Desk Set',
  'Modular Bookshelf Unit',
  'Outdoor Patio Lounger',
  'Adjustable Standing Desk',
  'Ergonomic Task Chair',
  'Storage Cabinet Bundle',
  'Folding Dining Table',
  'Velvet Accent Sofa',
  'Studio Floor Lamp',
  'Memory Foam Mattress',
  'Wall-Mounted Shelving',
];

export const SAMPLE_INVENTORY: InventoryProduct[] = PRODUCT_NAMES.map((name, idx) => {
  const id = `p-${idx + 1}`;
  const variantCount = 6 + ((idx * 2) % 5);
  return {
    id,
    name,
    extId: '2345A2345',
    type: 'Furniture',
    attributes: 'Size, Color',
    hsCode: '9401.39.00',
    origin: 'Canada',
    variantCount,
    valueRange: '$16.50 - $20.50',
    needsAttention: idx !== 0,
    variants: buildVariants(id, variantCount),
  };
});
