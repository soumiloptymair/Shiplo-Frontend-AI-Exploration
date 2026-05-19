export const SHIPMENT_STATUSES = [
  'Shipped',
  'Pending',
  'Label Created',
  'Delayed',
  'Delivered',
  'On Hold',
  'Needs Review',
  'Cancelled',
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const FREIGHT_TYPES = ['Parcel', 'LTL', 'Truckload', 'Partial'] as const;
export type FreightType = (typeof FREIGHT_TYPES)[number];

export const SHIPMENT_KIND = ['order', 'return', 'combined'] as const;
export type ShipmentKind = (typeof SHIPMENT_KIND)[number];

export interface ShipmentProduct {
  sku: string;
  name: string;
  qty: number;
  unitValue: number;
  /** When set, renders the red "only N left ●" badge in the Products table. */
  lowInventoryRemaining?: number;
}

export interface MaterialFlags {
  /** true → red dot + "Contain Lithium Batteries", false → green dot + "No lithium batteries". */
  lithium: boolean;
  hazmat: boolean;
  fragile: boolean;
  tempSensitive: boolean;
  perishable: boolean;
}

export type SplitRecommendation =
  | { reason: 'low-inventory'; sku: string; warehouse: string }
  | { reason: 'faster-delivery' }
  | { reason: 'lower-cost'; savings: number };

export interface ShipmentLogEntry {
  at: string;
  label: string;
}

export interface Shipment {
  id: string;
  shipmentId: string;
  freightType: FreightType | '';
  orderRefId: string;
  orderRefKind: ShipmentKind;
  combinedCount?: number;
  status: ShipmentStatus | '';
  needsAttention?: boolean;
  createdOn: string;
  value: string;
  source: string;
  warehouse: string;
  shipping: string;
  method: string;
  customer: string;
  tags: string[];
  products?: ShipmentProduct[];
  materials?: MaterialFlags;
  splitRecommendation?: SplitRecommendation;
  log?: ShipmentLogEntry[];
}

export const STATUS_PILL_CLASS: Record<ShipmentStatus, string> = {
  Shipped: 'bg-status-shipped',
  Pending: 'bg-status-picking',
  'Label Created': 'bg-status-label-created',
  Delayed: 'bg-status-delayed',
  Delivered: 'bg-status-delivered',
  'On Hold': 'bg-status-on-hold',
  'Needs Review': 'bg-status-needs-review',
  Cancelled: 'bg-status-cancelled',
};

const DEFAULT_PRODUCTS: ShipmentProduct[] = [
  { sku: 'ETOBASICKT02', name: 'uBoxes Moving Boxes Value E…', qty: 4, unitValue: 4.50, lowInventoryRemaining: 5 },
  { sku: 'ETOBASICKT02', name: 'uBoxes Moving Boxes Value E…', qty: 4, unitValue: 5.50 },
  { sku: 'ETOBASICKT02', name: 'uBoxes Moving Boxes Value E…', qty: 1, unitValue: 9.50 },
];

const DEFAULT_MATERIALS: MaterialFlags = {
  lithium: true,
  hazmat: false,
  fragile: false,
  tempSensitive: false,
  perishable: false,
};

const DEFAULT_LOG: ShipmentLogEntry[] = [
  { at: 'January 8, 2023, 2:32pm EST', label: 'Order created' },
  { at: 'January 8, 2023, 2:33pm EST', label: 'Status set to Pending' },
];

export const SAMPLE_SHIPMENTS: Shipment[] = [
  { id: 's-1',  shipmentId: '#20230101180003', freightType: 'Parcel',    orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Shipped',       createdOn: '01/15/2025', value: '$35.32', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Abrams, Abe',   tags: ['Tag'] },
  { id: 's-2',  shipmentId: '#20230101180003', freightType: 'LTL',       orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Shipped',       createdOn: '12/02/2024', value: '$35.32', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'Express 2 day',   method: 'Standard', customer: 'Blount, Bobby', tags: ['Tag'] },
  { id: 's-3',  shipmentId: '#20230101180003', freightType: 'Truckload',  orderRefId: '3 combined',     orderRefKind: 'combined', combinedCount: 3, status: 'Shipped', createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS', method: 'Standard', customer: 'Carter, Mike', tags: ['Tag'] },
  { id: 's-4',  shipmentId: '#20230101180003', freightType: '',           orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Pending',       createdOn: '12/02/2024', value: '$49.50', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'To be assigned', method: 'Standard', customer: 'Carter, Mike',  tags: [],
    products: DEFAULT_PRODUCTS, materials: DEFAULT_MATERIALS, log: DEFAULT_LOG,
    splitRecommendation: { reason: 'low-inventory', sku: 'ABC12345SBL', warehouse: 'KS Fulfillment center' } },
  { id: 's-5',  shipmentId: '#20230101180003', freightType: 'Partial',    orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Label Created', createdOn: '12/02/2024', value: '$49.50', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'],
    products: DEFAULT_PRODUCTS, materials: DEFAULT_MATERIALS, log: DEFAULT_LOG,
    splitRecommendation: { reason: 'faster-delivery' } },
  { id: 's-6',  shipmentId: '#20230101180003', freightType: 'Parcel',     orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Shipped',       createdOn: '12/02/2024', value: '$49.50', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'],
    products: DEFAULT_PRODUCTS, materials: DEFAULT_MATERIALS, log: DEFAULT_LOG,
    splitRecommendation: { reason: 'lower-cost', savings: 4.50 } },
  { id: 's-7',  shipmentId: '#20230101180003', freightType: 'LTL',        orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Delayed',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag', '+2'] },
  { id: 's-8',  shipmentId: '#20230101180003', freightType: 'LTL',        orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Delivered',     createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
  { id: 's-9',  shipmentId: '#20230101180003', freightType: 'LTL',        orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'On Hold',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
  { id: 's-10', shipmentId: '#20230101180003', freightType: 'Truckload',  orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Needs Review',  createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
  { id: 's-11', shipmentId: '#20230101180003', freightType: 'Truckload',  orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Cancelled',     createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
  { id: 's-12', shipmentId: '#20230101180003', freightType: '',           orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Pending', needsAttention: true, createdOn: '12/02/2024', value: '$41.99', source: 'Express - 1 day', warehouse: 'KS Fulfilment center', shipping: 'UPS', method: 'Standard', customer: 'Carter, Mike', tags: [] },
  { id: 's-13', shipmentId: '#20230101180003', freightType: 'Parcel',     orderRefId: '#20230101180003', orderRefKind: 'combined', combinedCount: 2, status: 'Shipped', createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS', method: 'Standard', customer: 'Carter, Mike', tags: ['Tag'] },
  { id: 's-14', shipmentId: '#20230101180003', freightType: 'LTL',        orderRefId: '#20230101180003', orderRefKind: 'return',   status: 'Shipped',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
  { id: 's-15', shipmentId: '#20230101180003', freightType: 'Parcel',     orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Shipped',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
  { id: 's-16', shipmentId: '#20230101180003', freightType: '',           orderRefId: '#20230101180003', orderRefKind: 'return',   status: 'Pending',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: [] },
  { id: 's-17', shipmentId: '#20230101180003', freightType: 'Parcel',     orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Shipped',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
  { id: 's-18', shipmentId: '#20230101180003', freightType: 'Parcel',     orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Shipped',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
  { id: 's-19', shipmentId: '#20230101180003', freightType: 'Parcel',     orderRefId: '#20230101180003', orderRefKind: 'return',   status: 'Shipped',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
  { id: 's-20', shipmentId: '#20230101180003', freightType: 'Parcel',     orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Shipped',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
];
