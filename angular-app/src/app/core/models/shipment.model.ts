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

export const SAMPLE_SHIPMENTS: Shipment[] = [
  { id: 's-1',  shipmentId: '#20230101180003', freightType: 'Parcel',    orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Shipped',       createdOn: '01/15/2025', value: '$35.32', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Abrams, Abe',   tags: ['Tag'] },
  { id: 's-2',  shipmentId: '#20230101180003', freightType: 'LTL',       orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Shipped',       createdOn: '12/02/2024', value: '$35.32', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'Express 2 day',   method: 'Standard', customer: 'Blount, Bobby', tags: ['Tag'] },
  { id: 's-3',  shipmentId: '#20230101180003', freightType: 'Truckload',  orderRefId: '3 combined',     orderRefKind: 'combined', combinedCount: 3, status: 'Shipped', createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS', method: 'Standard', customer: 'Carter, Mike', tags: ['Tag'] },
  { id: 's-4',  shipmentId: '#20230101180003', freightType: '',           orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Pending',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'To be assigned', method: 'Standard', customer: 'Carter, Mike',  tags: [] },
  { id: 's-5',  shipmentId: '#20230101180003', freightType: 'Partial',    orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Label Created', createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
  { id: 's-6',  shipmentId: '#20230101180003', freightType: 'Parcel',     orderRefId: '#20230101180003', orderRefKind: 'order',    status: 'Shipped',       createdOn: '12/02/2024', value: '$41.99', source: 'Walmart Marketplace', warehouse: 'KS Fulfilment center', shipping: 'UPS',             method: 'Standard', customer: 'Carter, Mike',  tags: ['Tag'] },
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
