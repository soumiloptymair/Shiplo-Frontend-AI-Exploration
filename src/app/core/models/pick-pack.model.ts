export type PickListStatus = 'Picking' | 'Complete';

export interface PickListRow {
  id: string;
  pickListId: string;
  createdOn: string;
  warehouse: string;
  totalOrders: string;
  picker: string;
  status: PickListStatus;
}

export interface Product {
  extId: string;
  name: string;
  qty: number;
  lowInventory?: boolean;
}

export interface ShipmentRow {
  id: string;
  shipmentId: string;
  pickListId: string;
  store: string;
  storeIcon: string;
  totalValue: string;
  weight: string;
  customer: string;
  carrier: string;
  carrierIcon: string;
  products: Product[];
}

const SMB = 'Small Moving Boxes';
const MMB = 'Medium Moving Boxes';
const LMB = 'Large Moving Boxes';
const TAPE = 'Packing Tape';
const WRAP = 'Bubble Wrap Roll';

export const PICKERS = ['Jane Smith', 'John Doe', 'Maria Garcia', 'Sam Patel'];

export const INITIAL_PICK_PACK_ROWS: PickListRow[] = Array.from({ length: 8 }, (_, i) => ({
  id: `pick-pack-${i + 1}`,
  pickListId: `PL-${100000 + i}`,
  createdOn: '01/15/2025',
  warehouse: i % 2 === 0 ? 'KS Fulfilment Center' : 'PA Fulfilment Facility',
  totalOrders: String(10 + i * 2),
  picker: i % 3 === 0 ? 'Jane Smith' : 'John Doe',
  status: 'Picking',
}));

export const INITIAL_SHIPMENT_ROWS: ShipmentRow[] = [
  { id: 'shipment-1',  shipmentId: 'SH-001', pickListId: 'PL-100000', store: 'Walmart Marketplace', storeIcon: 'figmaAssets/integrations.png',   totalValue: '$1,234.50', weight: '210', customer: 'Alice Johnson', carrier: 'UPS Express', carrierIcon: 'figmaAssets/pngegg--2--1.png',   products: [{ extId: 'P-10001', name: SMB, qty: 2, lowInventory: true }, { extId: 'P-10002', name: TAPE, qty: 4 }] },
  { id: 'shipment-2',  shipmentId: 'SH-002', pickListId: 'PL-100000', store: 'Walmart Marketplace', storeIcon: 'figmaAssets/integrations-1.png',  totalValue: '$890.00',   weight: '145', customer: 'Bob Martinez',  carrier: 'UPS Express', carrierIcon: 'figmaAssets/pngegg--2--1-1.png', products: [{ extId: 'P-10003', name: MMB, qty: 1 }, { extId: 'P-10001', name: SMB, qty: 2, lowInventory: true }] },
  { id: 'shipment-3',  shipmentId: 'SH-003', pickListId: 'PL-100001', store: 'Walmart Marketplace', storeIcon: 'figmaAssets/integrations-2.png',  totalValue: '$2,100.75', weight: '380', customer: 'Carol White',   carrier: 'UPS Express', carrierIcon: 'figmaAssets/pngegg--2--1-2.png', products: [{ extId: 'P-10004', name: LMB, qty: 3 }, { extId: 'P-10005', name: WRAP, qty: 2 }] },
  { id: 'shipment-4',  shipmentId: 'SH-004', pickListId: 'PL-100001', store: 'Walmart Marketplace', storeIcon: 'figmaAssets/integrations-3.png',  totalValue: '$560.20',   weight: '95',  customer: 'David Lee',     carrier: 'UPS Express', carrierIcon: 'figmaAssets/pngegg--2--1-3.png', products: [{ extId: 'P-10003', name: MMB, qty: 2 }] },
  { id: 'shipment-5',  shipmentId: 'SH-005', pickListId: 'PL-100002', store: 'Walmart Marketplace', storeIcon: 'figmaAssets/integrations-4.png',  totalValue: '$3,400.00', weight: '510', customer: 'Eva Brown',     carrier: 'UPS Express', carrierIcon: 'figmaAssets/pngegg--2--1-4.png', products: [{ extId: 'P-10004', name: LMB, qty: 5 }, { extId: 'P-10002', name: TAPE, qty: 6 }] },
  { id: 'shipment-6',  shipmentId: 'SH-006', pickListId: 'PL-100002', store: 'Walmart Marketplace', storeIcon: 'figmaAssets/integrations-5.png',  totalValue: '$780.50',   weight: '120', customer: 'Frank Davis',   carrier: 'UPS Express', carrierIcon: 'figmaAssets/pngegg--2--1-5.png', products: [{ extId: 'P-10001', name: SMB, qty: 3, lowInventory: true }] },
  { id: 'shipment-7',  shipmentId: 'SH-007', pickListId: 'PL-100003', store: 'Walmart Marketplace', storeIcon: 'figmaAssets/integrations-6.png',  totalValue: '$1,900.00', weight: '290', customer: 'Grace Kim',     carrier: 'UPS Express', carrierIcon: 'figmaAssets/pngegg--2--1-6.png', products: [{ extId: 'P-10003', name: MMB, qty: 2 }, { extId: 'P-10005', name: WRAP, qty: 1 }] },
  { id: 'shipment-8',  shipmentId: 'SH-008', pickListId: 'PL-100003', store: 'Walmart Marketplace', storeIcon: 'figmaAssets/integrations-7.png',  totalValue: '$640.00',   weight: '110', customer: 'Henry Wilson',  carrier: 'UPS Express', carrierIcon: 'figmaAssets/pngegg--2--1-7.png', products: [{ extId: 'P-10002', name: TAPE, qty: 3 }] },
  { id: 'shipment-9',  shipmentId: 'SH-009', pickListId: 'PL-100004', store: 'Walmart Marketplace', storeIcon: 'figmaAssets/integrations-8.png',  totalValue: '$1,050.00', weight: '180', customer: 'Ivy Chen',      carrier: 'UPS Express', carrierIcon: 'figmaAssets/pngegg--2--1-8.png', products: [{ extId: 'P-10004', name: LMB, qty: 2 }] },
  { id: 'shipment-10', shipmentId: 'SH-010', pickListId: 'PL-100004', store: 'Walmart Marketplace', storeIcon: 'figmaAssets/integrations-9.png',  totalValue: '$2,750.30', weight: '430', customer: 'James Park',    carrier: 'UPS Express', carrierIcon: 'figmaAssets/pngegg--2--1-9.png', products: [{ extId: 'P-10004', name: LMB, qty: 4 }, { extId: 'P-10005', name: WRAP, qty: 3 }] },
];
