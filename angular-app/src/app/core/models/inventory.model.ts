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

export const SAMPLE_INVENTORY: InventoryProduct[] = [
  {
    id: 'p-1', name: 'Basic Moving Chairs Kit', extId: '2345A2345',
    type: 'Furniture', attributes: 'Size, Color',
    hsCode: '9401.39.00', origin: 'Canada',
    variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: false,
    variants: [
      { id: 'v-1-1', name: 'Variant 1', extId: '12345A234', sku: 'PBM495145051', value: '$16.50', tags: ['Tag 1'], extraTagCount: 2, size: 'small',  color: 'grey',  length: '15', width: '15', height: '40', weight: '15', hasInventory: true },
      { id: 'v-1-2', name: 'Variant 2', extId: '12345A234', sku: 'PBM495145052', value: '$18.50', tags: ['Tag 1'], extraTagCount: 2, size: 'medium', color: 'grey',  length: '-',  width: '-',  height: '-',  weight: '-',  hasInventory: false },
      { id: 'v-1-3', name: 'Variant 3', extId: '12345A234', sku: 'PBM495145053', value: '$20.50', tags: ['Tag 1'], extraTagCount: 2, size: 'large',  color: 'grey',  length: '-',  width: '-',  height: '-',  weight: '-',  hasInventory: false },
      { id: 'v-1-4', name: 'Variant 4', extId: '12345A234', sku: 'PBM495145054', value: '$16.50', tags: ['Tag 1'], extraTagCount: 2, size: 'small',  color: 'black', length: '15', width: '15', height: '40', weight: '15', hasInventory: true },
      { id: 'v-1-5', name: 'Variant 5', extId: '12345A234', sku: 'PBM495145055', value: '$18.50', tags: ['Tag 1'], extraTagCount: 2, size: 'large',  color: 'black', length: '-',  width: '-',  height: '-',  weight: '-',  hasInventory: false },
      { id: 'v-1-6', name: 'Variant 6', extId: '12345A234', sku: 'PBM495145056', value: '$20.50', tags: ['Tag 1'], extraTagCount: 2, size: 'medium', color: 'black', length: '-',  width: '-',  height: '-',  weight: '-',  hasInventory: false, needsAttention: true },
      { id: 'v-1-7', name: 'Variant 7', extId: '12345A234', sku: 'PBM495145057', value: '$16.50', tags: ['Tag 1'], extraTagCount: 2, size: 'small',  color: 'blue',  length: '15', width: '15', height: '40', weight: '15', hasInventory: true },
      { id: 'v-1-8', name: 'Variant 8', extId: '12345A234', sku: 'PBM495145058', value: '$18.50', tags: ['Tag 1'], extraTagCount: 2, size: 'medium', color: 'blue',  length: '-',  width: '-',  height: '-',  weight: '-',  hasInventory: false, needsAttention: true },
      { id: 'v-1-9', name: 'Variant 9', extId: '12345A234', sku: 'PBM495145059', value: '$20.50', tags: ['Tag 1'], extraTagCount: 0, size: 'large',  color: 'blue',  length: '-',  width: '-',  height: '-',  weight: '-',  hasInventory: false },
    ],
  },
  { id: 'p-2',  name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
  { id: 'p-3',  name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
  { id: 'p-4',  name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
  { id: 'p-5',  name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
  { id: 'p-6',  name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
  { id: 'p-7',  name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
  { id: 'p-8',  name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
  { id: 'p-9',  name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
  { id: 'p-10', name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
  { id: 'p-11', name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
  { id: 'p-12', name: 'Product Name 1', extId: '2345A2345', type: 'Furniture', attributes: 'Size, Color', hsCode: '9401.39.00', origin: 'Canada', variantCount: 9, valueRange: '$16.50 - $20.50', needsAttention: true,  variants: [] },
];
