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
 * Step-2 form state — Receiver address + contact for the shipment.
 *
 * Required fields (gate the wizard's Continue button): `firstName`,
 * `lastName`, `street1`, `city`, `state`, `postalCode`, `country`.
 * `email`, `phone`, `street2` are optional per Figma 27004-11021.
 */
export interface NewShipmentCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  residential: boolean;
}

// ============================================================
// Step 3 — Carrier & Add Ons
// ============================================================

/** A single carrier service rendered in the rate-shop list. */
export interface CarrierRateOption {
  id: string;
  carrier: string;
  /** Short marketing description shown under the carrier name. */
  service: string;
  /** Human-readable ETA, e.g. "2 business days" — kept for back-compat. */
  eta: string;
  /** Standardized service-type bucket used by the Est Delivery filter. */
  serviceType: 'Next Day' | '2 Day' | '3 Day' | 'Ground' | 'Economy';
  /** Estimated delivery date, e.g. "01/17/2025". */
  etaDate: string;
  /** Estimated delivery cutoff time, e.g. "10:00 AM EST". */
  etaTime: string;
  /** Quoted price in USD. */
  price: number;
}

/** Carriers represented in the rate-shop list — drives the Carrier filter. */
export const CARRIER_OPTIONS = ['UPS', 'FedEx', 'USPS', 'DHL'] as const;
export type CarrierName = (typeof CARRIER_OPTIONS)[number];

/** Service-type buckets — drives the Est Delivery filter. */
export const SERVICE_TYPE_OPTIONS = ['Next Day', '2 Day', '3 Day', 'Ground', 'Economy'] as const;
export type ServiceType = (typeof SERVICE_TYPE_OPTIONS)[number];

export const SAMPLE_CARRIER_RATES: CarrierRateOption[] = [
  { id: 'r-ups-early',     carrier: 'UPS',   service: 'Express Early A.M. to U.S.', serviceType: 'Next Day', etaDate: '01/17/2025', etaTime: '10:00 AM EST', eta: '1 business day',   price: 10.50 },
  { id: 'r-ups-nextday',   carrier: 'UPS',   service: 'Next Day Air',               serviceType: 'Next Day', etaDate: '01/17/2025', etaTime: '3:00 PM EST',  eta: '1 business day',   price: 12.75 },
  { id: 'r-ups-2day',      carrier: 'UPS',   service: '2nd Day Air',                serviceType: '2 Day',    etaDate: '01/20/2025', etaTime: 'End of day',   eta: '2 business days',  price: 14.20 },
  { id: 'r-fedex-priority',carrier: 'FedEx', service: 'Priority Overnight',         serviceType: 'Next Day', etaDate: '01/17/2025', etaTime: '10:30 AM EST', eta: '1 business day',   price: 16.40 },
  { id: 'r-fedex-2day',    carrier: 'FedEx', service: '2Day Air',                   serviceType: '2 Day',    etaDate: '01/20/2025', etaTime: 'End of day',   eta: '2 business days',  price: 13.95 },
  { id: 'r-fedex-ground',  carrier: 'FedEx', service: 'Home Delivery (Ground)',     serviceType: 'Ground',   etaDate: '01/22/2025', etaTime: 'End of day',   eta: '3-5 business days', price: 9.20 },
  { id: 'r-usps-express',  carrier: 'USPS',  service: 'Priority Mail Express',      serviceType: 'Next Day', etaDate: '01/17/2025', etaTime: '6:00 PM',      eta: '1-2 business days', price: 11.10 },
  { id: 'r-usps-priority', carrier: 'USPS',  service: 'Priority Mail',              serviceType: '2 Day',    etaDate: '01/20/2025', etaTime: 'End of day',   eta: '2-3 business days', price: 8.40 },
  { id: 'r-dhl-express',   carrier: 'DHL',   service: 'Express Worldwide',          serviceType: 'Next Day', etaDate: '01/17/2025', etaTime: '12:00 PM EST', eta: '1-2 business days', price: 19.95 },
];

/** Warehouses the shipper can fulfill from — drives the Warehouse select. */
export const WAREHOUSE_OPTIONS = [
  'KS Fulfilment center',
  'CA Distribution hub',
  'NJ Returns center',
  'TX South gateway',
] as const;
export type WarehouseName = (typeof WAREHOUSE_OPTIONS)[number];

/** Saved carrier accounts the user can bill against. */
export const CARRIER_ACCOUNT_OPTIONS: Record<string, string[]> = {
  UPS:   ['UPS — Main (#A1234)', 'UPS — West Coast (#A5571)'],
  FedEx: ['FedEx — Main (#F9981)', 'FedEx — Returns (#F3320)'],
  USPS:  ['USPS — Stamps.com (#S0042)'],
};

/**
 * Add-on key vocabulary. `insurance` is rendered as its own top-level
 * checkbox in Step 3 (Figma 27004-16323); every other key is selectable
 * from the "Select from Add Ons" multi-select dropdown.
 */
export type CarrierAddOnKey =
  | 'insurance'
  | 'signature'
  | 'adultSignature'
  | 'saturday'
  | 'holdAtLocation'
  | 'deliveryConfirm'
  | 'returnReceipt'
  | 'fragileHandling'
  | 'verbalConfirm'
  | 'tempControl'
  | 'whiteGlove'
  | 'specialHandling'
  | 'photoProof';

export interface CarrierAddOn {
  key: CarrierAddOnKey;
  label: string;
  /** Flat cost added to shipmentCost when checked. */
  cost: number;
}

export const CARRIER_ADDONS: CarrierAddOn[] = [
  { key: 'insurance',       label: 'Insurance (declared value)', cost: 3.00 },
  { key: 'signature',       label: 'Signature Required',         cost: 4.50 },
  { key: 'adultSignature',  label: 'Adult Signature (21+)',      cost: 6.25 },
  { key: 'saturday',        label: 'Saturday Delivery',          cost: 16.00 },
  { key: 'holdAtLocation',  label: 'Hold at Location',           cost: 2.50 },
  { key: 'deliveryConfirm', label: 'Delivery Confirmation',      cost: 1.25 },
  { key: 'returnReceipt',   label: 'Return Receipt',             cost: 3.75 },
  { key: 'fragileHandling', label: 'Fragile Handling',           cost: 5.00 },
  { key: 'verbalConfirm',   label: 'Verbal Confirmation',        cost: 1.50 },
  { key: 'tempControl',     label: 'Temperature Control',        cost: 12.00 },
  { key: 'whiteGlove',      label: 'White-Glove Delivery',       cost: 25.00 },
  { key: 'specialHandling', label: 'Special Handling',           cost: 7.50 },
  { key: 'photoProof',      label: 'Photo Proof of Delivery',    cost: 1.00 },
];

/** Hard cap on the number of add-ons a single shipment can carry. */
export const MAX_ADD_ONS = 20;

export interface NewShipmentCarrier {
  /** `id` of the selected `CarrierRateOption`. */
  rateId: string;
  /** Carrier account label selected from `CARRIER_ACCOUNT_OPTIONS`. */
  account: string;
  /** Origin warehouse for the shipment — selected from `WAREHOUSE_OPTIONS`. */
  warehouse: WarehouseName | '';
  /** Checked add-on keys. Sparse: only `true` flags are meaningful. */
  addOns: Partial<Record<CarrierAddOnKey, boolean>>;
}

// ============================================================
// Step 4 — Label & Pickup
// ============================================================

export const LABEL_FORMAT_OPTIONS = [
  { value: 'pdf-4x6',    label: 'PDF 4" × 6" (thermal)' },
  { value: 'pdf-letter', label: 'PDF 8.5" × 11" (laser)' },
  { value: 'zpl',        label: 'ZPL (Zebra)' },
  { value: 'png',        label: 'PNG image' },
] as const;
export type LabelFormat = (typeof LABEL_FORMAT_OPTIONS)[number]['value'];

export const PICKUP_WINDOW_OPTIONS = [
  '8:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
] as const;
export type PickupWindow = (typeof PICKUP_WINDOW_OPTIONS)[number];

export interface NewShipmentLabel {
  format: LabelFormat;
  schedulePickup: boolean;
  pickupDate: string;
  pickupWindow: PickupWindow | '';
  pickupInstructions: string;
  poNumber: string;
  departmentNumber: string;
  rmaNumber: string;
}

/** Top-level draft. */
export interface NewShipmentDraft {
  details: NewShipmentDetails;
  customer: NewShipmentCustomer;
  carrier: NewShipmentCarrier;
  label: NewShipmentLabel;
}

export function blankCustomer(): NewShipmentCustomer {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    residential: false,
  };
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

/**
 * A draft persisted via "Save as Quote". Quotes live in-memory on the
 * `ShipmentService` and can be reopened back into the wizard.
 */
export interface SavedQuote {
  id: string;
  /** Human-readable label rendered in the Saved Quotes dropdown. */
  label: string;
  /** ISO timestamp captured at save time. */
  savedAt: string;
  /** Item count snapshot — used to build the label without re-walking the draft. */
  itemCount: number;
  /** Order-value subtotal at save time, in USD. */
  totalValue: number;
  /** Deep-cloned draft state to restore. */
  draft: NewShipmentDraft;
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
    customer: blankCustomer(),
    carrier: {
      rateId: '',
      account: '',
      warehouse: '',
      addOns: {},
    },
    label: {
      format: 'pdf-4x6',
      schedulePickup: false,
      pickupDate: '',
      pickupWindow: '',
      pickupInstructions: '',
      poNumber: '',
      departmentNumber: '',
      rmaNumber: '',
    },
  };
}
