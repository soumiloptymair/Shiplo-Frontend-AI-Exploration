/**
 * Tag configuration model — Settings → Defaults → Tags.
 *
 * Categories align with the Tags BRD (Order, Shipment, Transaction, etc.).
 * UI: Figma `7d1Ged8LHQYBV9abYhNhxG` node `27686:184888`.
 */

export type TagCategory =
  | 'Order'
  | 'Shipment'
  | 'Transaction'
  | 'Warehouse'
  | 'Pickups'
  | 'Products'
  | 'Manifests'
  | 'Customers';

/** BRD category groups — display order. */
export const TAG_CATEGORIES: TagCategory[] = [
  'Order',
  'Shipment',
  'Transaction',
  'Warehouse',
  'Pickups',
  'Products',
  'Manifests',
  'Customers',
];

export type TagColor =
  | 'Yellow'
  | 'Green'
  | 'Purple'
  | 'Orange'
  | 'Red'
  | 'Pink'
  | 'Blue'
  | 'Teal'
  | 'Gray';

export interface TagColorSpec {
  name: TagColor;
  /** Swatch / pill background. */
  bg: string;
  /** Pill text (preview defaults to high-emphasis #0b1516 in the grid). */
  fg: string;
}

/** Pastel palette from Figma tag color picker + grid swatches. */
export const TAG_COLORS: TagColorSpec[] = [
  { name: 'Yellow', bg: '#FFEAC0', fg: '#5C4517' },
  { name: 'Green',  bg: '#D4E0CB', fg: '#0B1516' },
  { name: 'Purple', bg: '#DECEF0', fg: '#3A2A5C' },
  { name: 'Orange', bg: '#FAC3AC', fg: '#0B1516' },
  { name: 'Red',    bg: '#FAD2D2', fg: '#7A1F1F' },
  { name: 'Pink',   bg: '#F7D5DE', fg: '#7A2A45' },
  { name: 'Blue',   bg: '#C2E3F2', fg: '#0B1516' },
  { name: 'Teal',   bg: '#C4EEE6', fg: '#0E4A41' },
  { name: 'Gray',   bg: '#E4EAED', fg: '#3D484C' },
];

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color: TagColor;
}

export type TagInsert = Omit<Tag, 'id'>;

export function tagColorSpec(color: TagColor): TagColorSpec {
  return TAG_COLORS.find((c) => c.name === color) ?? TAG_COLORS[0];
}
