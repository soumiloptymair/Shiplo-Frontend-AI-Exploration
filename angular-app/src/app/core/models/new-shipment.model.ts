/**
 * Data model for the "Create New Shipment" wizard (Figma file `unEpC0FcuWKbB5yO1m7OyX`,
 * user story ES-R8). The model covers all four wizard steps so steps 2–4 can be
 * implemented later without reshaping. Only step 1 (Shipment Details) is fully typed;
 * the rest are open structs that will be populated in follow-up tasks.
 */

export type ShipmentTypeChoice = 'order' | 'return';

export const FREIGHT_TYPE_OPTIONS = [
  'Parcel',
  'LTL',
  'Truckload',
  'Partial',
] as const;
export type FreightTypeOption = (typeof FREIGHT_TYPE_OPTIONS)[number];

/** Catalog of pickable products surfaced in the Item rows' Product Name select. */
export interface ProductOption {
  sku: string;
  name: string;
  /** Per-unit value in USD; used to compute the row's Value column. */
  unitValue: number;
}

export const SAMPLE_PRODUCT_OPTIONS: ProductOption[] = [
  { sku: 'ETOBASICKT02', name: 'uBoxes Moving Boxes Value Kit', unitValue: 4.5 },
  { sku: 'WRAPBUBBLE12', name: 'Bubble Wrap Roll 12in × 50ft', unitValue: 9.99 },
  { sku: 'TAPECLEAR03',  name: 'Clear Packing Tape (3-pack)',  unitValue: 6.25 },
  { sku: 'MAILERPAD10',  name: 'Padded Mailer 8.5" × 12"',     unitValue: 1.15 },
  { sku: 'LBLTHERMAL4',  name: 'Thermal Shipping Labels 4×6',  unitValue: 0.08 },
];

export const PACKAGE_TYPE_OPTIONS = [
  'Box',
  'Envelope',
  'Tube',
  'Pallet',
] as const;
export type PackageTypeOption = (typeof PACKAGE_TYPE_OPTIONS)[number];

export interface BoxSizeOption {
  label: string;
  cost: number;
}

export const BOX_SIZE_OPTIONS: BoxSizeOption[] = [
  { label: 'Standard 8" × 12"',  cost: 1.20 },
  { label: 'Standard 10" × 14"', cost: 1.60 },
  { label: 'Standard 12" × 16"', cost: 2.10 },
  { label: 'Large 18" × 18"',    cost: 3.40 },
];

/** A single editable row in the Items table on step 1. */
export interface NewShipmentItem {
  id: string;
  productSku: string;
  quantity: number;
}

/** Step-1 packaging selections. `boxSizeLabel` references `BOX_SIZE_OPTIONS.label`. */
export interface NewShipmentPackaging {
  packageType: PackageTypeOption | '';
  boxSizeLabel: string;
  /** Dimensions in inches; null when the user hasn't entered a value yet. */
  lengthIn: number | null;
  widthIn: number | null;
  heightIn: number | null;
  /** Weight in pounds. */
  weightLbs: number | null;
}

/** Step-1 hazardous-material disclosures. */
export interface NewShipmentMaterials {
  lithium: boolean;
  hazmat: boolean;
  fragile: boolean;
  tempSensitive: boolean;
  perishable: boolean;
}

/** Step-1 form state. */
export interface NewShipmentDetails {
  shipmentType: ShipmentTypeChoice;
  freightType: FreightTypeOption | '';
  items: NewShipmentItem[];
  packaging: NewShipmentPackaging;
  materials: NewShipmentMaterials;
}

/**
 * Top-level draft. Steps 2–4 are intentionally open `Record`s so the foundation
 * task can ship without locking in their shape. Subsequent tasks will replace
 * them with strongly-typed interfaces.
 */
export interface NewShipmentDraft {
  details: NewShipmentDetails;
  customer: Record<string, unknown>;
  carrier: Record<string, unknown>;
  label: Record<string, unknown>;
}

/** Right-rail Summary panel values derived from the draft (all USD). */
export interface NewShipmentSummary {
  orderValue: number;
  shipmentCost: number;
  packagingCost: number;
  /** Sum of the three components above. */
  total: number;
  /** Placeholder positive markup until carrier pricing is wired up. */
  profit: number;
  /** Label printed under the Packaging row, e.g. "Box:  Standard 8" × 12"". */
  packagingDescription: string;
}

export const WIZARD_STEPS = [
  { num: 1, title: 'Shipment Details',     subtitle: 'items, shipment size etc.' },
  { num: 2, title: 'Customer Information', subtitle: 'address, contact etc.' },
  { num: 3, title: 'Carrier & Add Ons',    subtitle: 'warehouse, accounts etc.' },
  { num: 4, title: 'Label & Pickup',       subtitle: 'purchase#, department#, RMA etc.' },
] as const;

export type WizardStepNum = (typeof WIZARD_STEPS)[number]['num'];

export function blankItem(): NewShipmentItem {
  return {
    id: `i-${Math.random().toString(36).slice(2, 10)}`,
    productSku: '',
    quantity: 1,
  };
}

export function blankDraft(): NewShipmentDraft {
  return {
    details: {
      shipmentType: 'order',
      freightType: '',
      items: [blankItem()],
      packaging: {
        packageType: '',
        boxSizeLabel: '',
        lengthIn: null,
        widthIn: null,
        heightIn: null,
        weightLbs: null,
      },
      materials: {
        lithium: false,
        hazmat: false,
        fragile: false,
        tempSensitive: false,
        perishable: false,
      },
    },
    customer: {},
    carrier: {},
    label: {},
  };
}
