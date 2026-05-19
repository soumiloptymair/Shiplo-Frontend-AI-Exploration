import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentProduct } from '../../../core/models/shipment.model';

interface BucketItem {
  /** Stable per-source-row id so rows can move between buckets without losing identity. */
  rowKey: string;
  sku: string;
  name: string;
  qty: number;
}

interface ShipmentBucket {
  id: string;
  warehouse: string;
  items: BucketItem[];
}

type DistributionFn = (products: ShipmentProduct[]) => ShipmentBucket[];

interface Recommendation {
  id: string;
  title: string;
  parts: number;
  shippingCost: number;
  /** Returns a fresh set of buckets for this recommendation. */
  distribute: DistributionFn;
}

const BASE_WAREHOUSES: readonly string[] = ['KS Fulfillment Center', 'TX Fulfillment Center', 'CA Fulfillment Center'];
const DEFAULT_WAREHOUSE = BASE_WAREHOUSES[0];

function makeItem(p: ShipmentProduct, idx: number, qty: number): BucketItem {
  return { rowKey: `r${idx}`, sku: p.sku, name: p.name, qty };
}

/** Two-shipment split: each product line split roughly in half (favoring shipment 1). */
const splitHalves: DistributionFn = (products) => [
  {
    id: 's1', warehouse: DEFAULT_WAREHOUSE,
    items: products.map((p, i) => makeItem(p, i, Math.ceil(p.qty / 2))),
  },
  {
    id: 's2', warehouse: DEFAULT_WAREHOUSE,
    items: products.map((p, i) => makeItem(p, i, Math.floor(p.qty / 2))).filter(it => it.qty > 0),
  },
];

/** Two-shipment split: first line in shipment 1, the rest in shipment 2. */
const splitFirstVsRest: DistributionFn = (products) => [
  {
    id: 's1', warehouse: DEFAULT_WAREHOUSE,
    items: products.slice(0, 1).map((p, i) => makeItem(p, i, p.qty)),
  },
  {
    id: 's2', warehouse: DEFAULT_WAREHOUSE,
    items: products.slice(1).map((p, i) => makeItem(p, i + 1, p.qty)),
  },
];

/** Three-shipment split: one line item per shipment. */
const splitEachLine: DistributionFn = (products) => {
  const n = Math.max(products.length, 1);
  return Array.from({ length: Math.min(n, 3) }).map((_, sIdx) => ({
    id: `s${sIdx + 1}`,
    warehouse: DEFAULT_WAREHOUSE,
    items: products.filter((_p, i) => i % 3 === sIdx).map((p, _i) => {
      const origIdx = products.indexOf(p);
      return makeItem(p, origIdx, p.qty);
    }),
  }));
};

/** Manual: everything starts in shipment 1, shipment 2 empty. */
const splitManual: DistributionFn = (products) => [
  {
    id: 's1', warehouse: DEFAULT_WAREHOUSE,
    items: products.map((p, i) => makeItem(p, i, p.qty)),
  },
  { id: 's2', warehouse: DEFAULT_WAREHOUSE, items: [] },
];

@Component({
  selector: 'app-split-shipment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './split-shipment-modal.component.html',
})
export class SplitShipmentModalComponent implements OnChanges {
  @Input({ required: true }) products: ShipmentProduct[] = [];
  @Input({ required: true }) shipmentId = '';
  @Input() warehouse = DEFAULT_WAREHOUSE;
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  /** Per-instance, immutable list including the shipment's current warehouse if it isn't already in the base list. */
  warehouseOptions: readonly string[] = BASE_WAREHOUSES;

  recommendations: Recommendation[] = [];
  selectedRecId = signal<string>('rec-1');
  shipments = signal<ShipmentBucket[]>([]);
  /** Keys of checked rows, stored as `${shipmentIdx}|${rowKey}`. */
  selectedKeys = signal<Set<string>>(new Set());
  /** Tracks which warehouse dropdown is currently open (-1 = none). */
  openWarehouseIdx = signal<number>(-1);
  private nextShipmentNum = 3;

  readonly selectedCountTotal = computed(() => this.selectedKeys().size);
  readonly canConfirm = computed(() => this.shipments().every(s => s.items.length > 0) && this.shipments().length >= 2);

  ngOnChanges() {
    const normWarehouse = this.normalizeWarehouseName(this.warehouse);
    this.warehouseOptions = BASE_WAREHOUSES.includes(normWarehouse)
      ? BASE_WAREHOUSES
      : [normWarehouse, ...BASE_WAREHOUSES];
    this.recommendations = [
      { id: 'rec-1', title: 'Recommendation 1', parts: 2, shippingCost: 13.50, distribute: splitHalves },
      { id: 'rec-2', title: 'Recommendation 2', parts: 2, shippingCost: 15.50, distribute: splitFirstVsRest },
      { id: 'rec-3', title: 'Recommendation 3', parts: 3, shippingCost: 15.50, distribute: splitEachLine },
      { id: 'rec-manual', title: 'Manual split',  parts: 0, shippingCost: 0,    distribute: splitManual },
    ];
    this.applyRecommendation(this.selectedRecId());
  }

  /** "KS Fulfilment center" → "KS Fulfillment Center" so the dropdown label matches Figma. */
  private normalizeWarehouseName(w: string): string {
    if (!w) return DEFAULT_WAREHOUSE;
    return w
      .replace(/Fulfilment/i, 'Fulfillment')
      .replace(/\bcenter\b/i, 'Center');
  }

  selectRecommendation(id: string) {
    if (this.selectedRecId() === id) return;
    this.selectedRecId.set(id);
    this.applyRecommendation(id);
  }

  applyRecommendation(id: string) {
    const rec = this.recommendations.find(r => r.id === id);
    if (!rec) return;
    const fresh = rec.distribute(this.products).map((b, i) => ({
      ...b,
      id: `s${i + 1}`,
      warehouse: this.normalizeWarehouseName(this.warehouse) || DEFAULT_WAREHOUSE,
    }));
    while (fresh.length < 2) fresh.push({ id: `s${fresh.length + 1}`, warehouse: DEFAULT_WAREHOUSE, items: [] });
    this.shipments.set(fresh);
    this.selectedKeys.set(new Set());
    this.nextShipmentNum = fresh.length + 1;
  }

  resetCurrent() { this.applyRecommendation(this.selectedRecId()); }

  // ---- Selection ----
  rowKey(sIdx: number, rowKey: string): string { return `${sIdx}|${rowKey}`; }
  isRowSelected(sIdx: number, rowKey: string): boolean { return this.selectedKeys().has(this.rowKey(sIdx, rowKey)); }
  toggleRow(sIdx: number, rowKey: string) {
    const k = this.rowKey(sIdx, rowKey);
    this.selectedKeys.update(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }
  selectedCountFor(sIdx: number): number {
    let n = 0;
    for (const k of this.selectedKeys()) if (k.startsWith(`${sIdx}|`)) n++;
    return n;
  }
  isAllSelected(sIdx: number): boolean {
    const items = this.shipments()[sIdx]?.items ?? [];
    if (items.length === 0) return false;
    return items.every(it => this.isRowSelected(sIdx, it.rowKey));
  }
  toggleAll(sIdx: number) {
    const items = this.shipments()[sIdx]?.items ?? [];
    const all = this.isAllSelected(sIdx);
    this.selectedKeys.update(prev => {
      const next = new Set(prev);
      for (const it of items) {
        const k = this.rowKey(sIdx, it.rowKey);
        if (all) next.delete(k); else next.add(k);
      }
      return next;
    });
  }

  // ---- Move ----
  /** Returns the index of the "other" shipment for the Move button (2-shipment case). */
  otherShipmentIdx(sIdx: number): number {
    const all = this.shipments();
    if (all.length === 2) return sIdx === 0 ? 1 : 0;
    // For 3+ shipments, default to the next one wrapping around.
    return (sIdx + 1) % all.length;
  }
  moveButtonLabel(sIdx: number): string {
    const target = this.otherShipmentIdx(sIdx);
    return `Move to Shipment ${target + 1}`;
  }
  moveSelected(fromIdx: number) {
    const toIdx = this.otherShipmentIdx(fromIdx);
    if (this.selectedCountFor(fromIdx) === 0) return;
    this.shipments.update(prev => {
      const next = prev.map(b => ({ ...b, items: [...b.items] }));
      const fromItems = next[fromIdx].items;
      const toItems = next[toIdx].items;
      const stay: BucketItem[] = [];
      for (const it of fromItems) {
        if (this.isRowSelected(fromIdx, it.rowKey)) {
          // Merge with an existing matching row in the destination, else push.
          const existing = toItems.find(t => t.rowKey === it.rowKey);
          if (existing) existing.qty += it.qty; else toItems.push({ ...it });
        } else {
          stay.push(it);
        }
      }
      next[fromIdx].items = stay;
      return next;
    });
    // Clear selection for the source shipment only.
    this.selectedKeys.update(prev => {
      const next = new Set<string>();
      for (const k of prev) if (!k.startsWith(`${fromIdx}|`)) next.add(k);
      return next;
    });
  }

  addShipment() {
    this.shipments.update(prev => [
      ...prev,
      { id: `s${this.nextShipmentNum}`, warehouse: DEFAULT_WAREHOUSE, items: [] },
    ]);
    this.nextShipmentNum++;
  }

  removeShipment(sIdx: number) {
    if (this.shipments().length <= 2) return;
    this.shipments.update(prev => {
      const next = prev.map(b => ({ ...b, items: [...b.items] }));
      // Re-home items to a sibling bucket (the first bucket that isn't being removed).
      const rehomeIdx = sIdx === 0 ? 1 : 0;
      next[rehomeIdx].items.push(...next[sIdx].items);
      next.splice(sIdx, 1);
      return next;
    });
    this.selectedKeys.set(new Set());
  }

  // ---- Warehouse picker ----
  toggleWarehouseMenu(sIdx: number, evt: Event) {
    evt.stopPropagation();
    this.openWarehouseIdx.update(curr => curr === sIdx ? -1 : sIdx);
  }
  pickWarehouse(sIdx: number, w: string, evt: Event) {
    evt.stopPropagation();
    this.shipments.update(prev => prev.map((b, i) => i === sIdx ? { ...b, warehouse: w } : b));
    this.openWarehouseIdx.set(-1);
  }
  closeWarehouseMenus() { this.openWarehouseIdx.set(-1); }

  onConfirm() { if (this.canConfirm()) this.confirm.emit(); }

  @HostListener('document:keydown.escape')
  onEscape() { this.cancel.emit(); }
}
