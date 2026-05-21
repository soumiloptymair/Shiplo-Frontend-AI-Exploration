/**
 * Tag configuration model used by Settings → Defaults → Tags.
 *
 * Backed by the in-memory `TagsService` — values reset on reload.
 * Pixel-faithful to Figma `7d1Ged8LHQYBV9abYhNhxG`, frame "Tag Configuration"
 * (node `27686-184864`).
 */

export type TagCategory =
  | 'Order'
  | 'Shipment'
  | 'Transaction'
  | 'Customers'
  | 'Pickups'
  | 'Products'
  | 'Returns'
  | 'Manifests'
  | 'Warehouse';

export const TAG_CATEGORIES: TagCategory[] = [
  'Order',
  'Shipment',
  'Transaction',
  'Customers',
  'Pickups',
  'Products',
  'Returns',
  'Manifests',
  'Warehouse',
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
  /** Background fill for the pill / swatch. */
  bg: string;
  /** Foreground text used on top of the pill background. */
  fg: string;
}

/** Soft pastel palette taken from the Figma color picker in the Add Tag modal. */
export const TAG_COLORS: TagColorSpec[] = [
  { name: 'Yellow', bg: '#FFEAC0', fg: '#5C4517' },
  { name: 'Green',  bg: '#D6EFD6', fg: '#1F4D1F' },
  { name: 'Purple', bg: '#DECEF0', fg: '#3A2A5C' },
  { name: 'Orange', bg: '#FAD9C0', fg: '#7A3F11' },
  { name: 'Red',    bg: '#FAD2D2', fg: '#7A1F1F' },
  { name: 'Pink',   bg: '#F7D5DE', fg: '#7A2A45' },
  { name: 'Blue',   bg: '#C2E3F2', fg: '#0F3E5C' },
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
