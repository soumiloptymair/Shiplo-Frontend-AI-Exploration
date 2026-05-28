export type InventoryTab = 'SKUs' | 'Products';

export interface WarehouseStock {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  quantity: number;
  active: string;
  quarantined: string;
  writtenOff: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  extId: string;
  sku: string;
  value: string;
  tagIds: string[];
  size: string;
  color: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  hasInventory: boolean;
  needsAttention?: boolean;
  warehouses: WarehouseStock[];
}

export type MaterialStatus = 'yes' | 'no';

export interface MaterialFlag {
  label: string;
  status: MaterialStatus;
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
  tagIds: string[];
  needsAttention?: boolean;
  variants: ProductVariant[];
  // Detail-panel fields
  colors: string[];
  sizes: string[];
  dimensions: { length: string; width: string; height: string; weight: string };
  materials: MaterialFlag[];
  shippingRequirements: string[];
  returnPolicy: string;
  canReturn: boolean;
  images: string[];
}

export const DEFAULT_MATERIALS: MaterialFlag[] = [
  { label: 'Contains lithium batteries', status: 'no' },
  { label: 'Contains fragile items',     status: 'yes' },
  { label: 'No hazmat',                  status: 'yes' },
  { label: 'No perishables',             status: 'yes' },
  { label: 'No temperature sensitive items', status: 'yes' },
];

export const DEFAULT_SHIPPING_REQS = ['Furniture dolly', 'Blankets'];

export interface VariantActivityEntry {
  id: string;
  shipmentId: string;
  source: string;
  orderDate: string;
  warehouse: string;
  inventoryChange: number;
  updatedStock: number;
}

export const DEFAULT_VARIANT_ACTIVITY: VariantActivityEntry[] = [
  { id: 'a-1', shipmentId: '220578391662185', source: 'Shopify', orderDate: 'Feb 02, 2026, 10:30 CDT', warehouse: 'Dallas 01', inventoryChange: -18, updatedStock: 18 },
  { id: 'a-2', shipmentId: '220578391662185', source: 'Shopify', orderDate: 'Feb 02, 2026, 10:30 CDT', warehouse: 'Dallas 01', inventoryChange: -18, updatedStock: 18 },
  { id: 'a-3', shipmentId: '220578391662185', source: 'Shopify', orderDate: 'Feb 02, 2026, 10:30 CDT', warehouse: 'Dallas 01', inventoryChange: -18, updatedStock: 18 },
  { id: 'a-4', shipmentId: '220578391662185', source: 'Shopify', orderDate: 'Feb 02, 2026, 10:30 CDT', warehouse: 'Dallas 01', inventoryChange: -18, updatedStock: 18 },
];

export interface VariantNote {
  id: string;
  author: string;
  initials: string;
  timestamp: string;
  body: string;
}

export const DEFAULT_VARIANT_NOTES: VariantNote[] = [
  {
    id: 'n-1',
    author: 'Admin 01',
    initials: 'A1',
    timestamp: '10 min ago',
    body: 'One order has been delivered on 19/07/24 at 4:08 pm. Tracking info is yet to be updated.',
  },
  {
    id: 'n-2',
    author: 'Admin 01',
    initials: 'A1',
    timestamp: '16/07/2024',
    body: 'Have assigned UPS expedited as customer requested for expedited over phone call',
  },
];

export const DEFAULT_IMAGES = [
  'figmaAssets/product-1.png',
  'figmaAssets/product-2.png',
  'figmaAssets/product-3.png',
];

export const DEFAULT_WAREHOUSES: WarehouseStock[] = [
  { id: 'w-1', name: 'Dallas 01', addressLine1: '514 Jefferson Ln, Lake', addressLine2: 'Dallas, Texas(TX), 75065', quantity: 13, active: '--', quarantined: '--', writtenOff: '--' },
  { id: 'w-2', name: 'Dallas 01', addressLine1: '514 Jefferson Ln, Lake', addressLine2: 'Dallas, Texas(TX), 75065', quantity: 13, active: '--', quarantined: '--', writtenOff: '--' },
  { id: 'w-3', name: 'Dallas 01', addressLine1: '514 Jefferson Ln, Lake', addressLine2: 'Dallas, Texas(TX), 75065', quantity: 13, active: '--', quarantined: '--', writtenOff: '--' },
  { id: 'w-4', name: 'Dallas 01', addressLine1: '514 Jefferson Ln, Lake', addressLine2: 'Dallas, Texas(TX), 75065', quantity: 13, active: '--', quarantined: '--', writtenOff: '--' },
  { id: 'w-5', name: 'Dallas 01', addressLine1: '514 Jefferson Ln, Lake', addressLine2: 'Dallas, Texas(TX), 75065', quantity: 13, active: '--', quarantined: '--', writtenOff: '--' },
];

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
      tagIds: ['tag-seed-featured'],
      size: SIZES[i % SIZES.length],
      color: COLORS[Math.floor((i - 1) / 3) % COLORS.length],
      length: hasInventory ? '15' : '-',
      width: hasInventory ? '15' : '-',
      height: hasInventory ? '40' : '-',
      weight: hasInventory ? '15' : '-',
      hasInventory,
      needsAttention,
      warehouses: DEFAULT_WAREHOUSES.map((w) => ({ ...w, id: `${productId}-v-${i}-${w.id}` })),
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
    valueRange: '16.50$ - 20.50$',
    tagIds: [],
    needsAttention: idx !== 0,
    variants: buildVariants(id, variantCount),
    colors: ['black', 'grey', 'white'],
    sizes: ['small', 'medium', 'large'],
    dimensions: { length: '15 in', width: '15 in', height: '40 in', weight: '15 lbs' },
    materials: DEFAULT_MATERIALS,
    shippingRequirements: DEFAULT_SHIPPING_REQS,
    returnPolicy: 'Item cannot be returned',
    canReturn: false,
    images: DEFAULT_IMAGES,
  };
});
