import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShipmentProduct } from '../../../core/models/shipment.model';

interface BucketItem {
  /** Stable per-source-row id so rows can move between buckets without losing identity. */
  rowKey: string;
  sku: string;
  name: string;
  qty: number;
  /** Maximum qty allowed for this row in this bucket (initialised from source qty when the row first lands). */
  maxQty: number;
}

interface ShipmentBucket {
  id: string;
  warehouse: string;
  items: BucketItem[];
}

type DistributionFn = (products: ShipmentProduct[], originalWarehouse: string) => ShipmentBucket[];

interface Recommendation {
  id: string;
  title: string;
  parts: number;
  shippingCost: number;
  /** Returns a fresh set of buckets for this recommendation. */
  distribute: DistributionFn;
}

/** Payload emitted on confirm — consumed by the panel to actually mutate the grid. */
export interface SplitConfirmPayload {
  buckets: { warehouse: string; items: { sku: string; name: string; qty: number; unitValue: number }[] }[];
}

const BASE_WAREHOUSES: readonly string[] = ['KS Fulfillment Center', 'PA Fulfillment Center', 'TX Fulfillment Center', 'CA Fulfillment Center'];
const DEFAULT_WAREHOUSE = BASE_WAREHOUSES[0];

function makeItem(p: ShipmentProduct, idx: number, qty: number): BucketItem {
  return { rowKey: `r${idx}`, sku: p.sku, name: p.name, qty, maxQty: qty };
}

/** Two-shipment split: each product line split roughly in half (favoring shipment 1). S2 ships from PA per Figma. */
const splitHalves: DistributionFn = (products, orig) => [
  {
    id: 's1', warehouse: orig,
    items: products.map((p, i) => makeItem(p, i, Math.ceil(p.qty / 2))),
  },
  {
    id: 's2', warehouse: 'PA Fulfillment Center',
    items: products.map((p, i) => makeItem(p, i, Math.floor(p.qty / 2))).filter(it => it.qty > 0),
  },
];

/** Two-shipment split: first line in shipment 1, the rest in shipment 2. */
const splitFirstVsRest: DistributionFn = (products, orig) => [
  {
    id: 's1', warehouse: orig,
    items: products.slice(0, 1).map((p, i) => makeItem(p, i, p.qty)),
  },
  {
    id: 's2', warehouse: 'PA Fulfillment Center',
    items: products.slice(1).map((p, i) => makeItem(p, i + 1, p.qty)),
  },
];

/** Three-shipment split: one line item per shipment. */
const splitEachLine: DistributionFn = (products, orig) => {
  const n = Math.max(products.length, 1);
  return Array.from({ length: Math.min(n, 3) }).map((_, sIdx) => ({
    id: `s${sIdx + 1}`,
    warehouse: sIdx === 0 ? orig : (sIdx === 1 ? 'PA Fulfillment Center' : 'TX Fulfillment Center'),
    items: products.filter((_p, i) => i % 3 === sIdx).map((p) => {
      const origIdx = products.indexOf(p);
      return makeItem(p, origIdx, p.qty);
    }),
  }));
};

/** Manual: everything starts in shipment 1, shipment 2 empty (user moves items themselves). */
const splitManual: DistributionFn = (products, orig) => [
  {
    id: 's1', warehouse: orig,
    items: products.map((p, i) => makeItem(p, i, p.qty)),
  },
  { id: 's2', warehouse: orig, items: [] },
];

@Component({
  selector: 'app-split-shipment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './split-shipment-modal.component.html',
})
export class SplitShipmentModalComponent implements OnChanges {
  @Input({ required: true }) products: ShipmentProduct[] = [];
  @Input({ required: true }) shipmentId = '';
  @Input() warehouse = DEFAULT_WAREHOUSE;
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<SplitConfirmPayload>();

  /** Per-instance, immutable list including the shipment's current warehouse if it isn't already in the base list. */
  warehouseOptions: readonly string[] = BASE_WAREHOUSES;
  /** Normalized warehouse name for the original shipment — used to detect offsite buckets for the warning banner. */
  private originalWarehouse = DEFAULT_WAREHOUSE;

  recommendations: Recommendation[] = [];
  selectedRecId = signal<string>('rec-1');
  shipments = signal<ShipmentBucket[]>([]);
  /** Keys of checked rows, stored as `${shipmentIdx}|${rowKey}`. */
  selectedKeys = signal<Set<string>>(new Set());
  /** Tracks which warehouse dropdown is currently open (-1 = none). */
  openWarehouseIdx = signal<number>(-1);
  /** Tracks which move-to dropdown is currently open (-1 = none). Only used when N>=3. */
  openMoveIdx = signal<number>(-1);
  /** Tracks which shipment's delete-confirmation popover is open (-1 = none). */
  openDeleteConfirmIdx = signal<number>(-1);
  private nextShipmentNum = 3;

  readonly selectedRec = computed<Recommendation | undefined>(() =>
    this.recommendations.find(r => r.id === this.selectedRecId())
  );

  readonly selectedCountTotal = computed(() => this.selectedKeys().size);
  readonly canConfirm = computed(() => {
    const buckets = this.shipments();
    return buckets.length >= 2 && buckets.every(s => s.items.length > 0);
  });
  /** Shows the orange "could increase delivery time / cost" banner when any bucket ships from a different warehouse than the original. */
  readonly showWarning = computed(() => {
    const orig = this.originalWarehouse;
    return this.shipments().some(b => b.items.length > 0 && b.warehouse !== orig);
  });
  readonly warningBucket = computed(() => {
    const orig = this.originalWarehouse;
    const idx = this.shipments().findIndex(b => b.items.length > 0 && b.warehouse !== orig);
    if (idx < 0) return null;
    const b = this.shipments()[idx];
    const sku = b.items[0]?.sku ?? '';
    return { num: idx + 1, warehouse: b.warehouse, sku };
  });

  ngOnChanges() {
    this.originalWarehouse = this.normalizeWarehouseName(this.warehouse);
    this.warehouseOptions = BASE_WAREHOUSES.includes(this.originalWarehouse)
      ? BASE_WAREHOUSES
      : [this.originalWarehouse, ...BASE_WAREHOUSES];
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
    const fresh = rec.distribute(this.products, this.originalWarehouse).map((b, i) => ({
      ...b,
      id: `s${i + 1}`,
    }));
    while (fresh.length < 2) fresh.push({ id: `s${fresh.length + 1}`, warehouse: this.originalWarehouse, items: [] });
    this.shipments.set(fresh);
    this.selectedKeys.set(new Set());
    this.openMoveIdx.set(-1);
    this.openDeleteConfirmIdx.set(-1);
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
  /** "1 product, 2 items selected" — counts rows + sum of qtys for the source shipment. */
  selectedSummaryFor(sIdx: number): string {
    const items = this.shipments()[sIdx]?.items ?? [];
    let rows = 0, units = 0;
    for (const it of items) {
      if (this.isRowSelected(sIdx, it.rowKey)) { rows++; units += it.qty; }
    }
    if (rows === 0) return '0 products selected';
    return `${rows} product${rows === 1 ? '' : 's'}, ${units} item${units === 1 ? '' : 's'} selected`;
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

  // ---- Qty editing (only meaningful when the row is checked) ----
  setItemQty(sIdx: number, rowKey: string, value: number | string) {
    const raw = typeof value === 'string' ? parseInt(value, 10) : value;
    this.shipments.update(prev => prev.map((b, i) => {
      if (i !== sIdx) return b;
      return {
        ...b,
        items: b.items.map(it => {
          if (it.rowKey !== rowKey) return it;
          const clamped = Math.max(1, Math.min(it.maxQty, isNaN(raw) ? 1 : raw));
          return { ...it, qty: clamped };
        }),
      };
    }));
  }
  bumpItemQty(sIdx: number, rowKey: string, delta: number) {
    const item = this.shipments()[sIdx]?.items.find(it => it.rowKey === rowKey);
    if (!item) return;
    this.setItemQty(sIdx, rowKey, item.qty + delta);
  }

  // ---- Move ----
  /** Targets a selected source bucket can move into (everything that isn't itself). */
  targetsFor(sIdx: number): { idx: number; label: string }[] {
    return this.shipments()
      .map((_, i) => ({ idx: i, label: `Shipment ${i + 1}` }))
      .filter(t => t.idx !== sIdx);
  }
  /** Default target when only one other bucket exists (the 2-shipment case). */
  defaultTargetIdx(sIdx: number): number {
    const t = this.targetsFor(sIdx);
    return t.length > 0 ? t[0].idx : sIdx;
  }
  moveButtonLabel(sIdx: number): string {
    const all = this.shipments();
    if (all.length === 2) return `Move to Shipment ${this.defaultTargetIdx(sIdx) + 1}`;
    return 'Move to';
  }
  /** When N>=3, clicking the button toggles the picker; when N=2, it moves directly. */
  onMoveButton(sIdx: number, evt: Event) {
    evt.stopPropagation();
    if (this.selectedCountFor(sIdx) === 0) return;
    if (this.shipments().length >= 3) {
      this.openMoveIdx.update(curr => curr === sIdx ? -1 : sIdx);
    } else {
      this.moveSelected(sIdx, this.defaultTargetIdx(sIdx));
    }
  }
  moveSelected(fromIdx: number, toIdx: number) {
    if (this.selectedCountFor(fromIdx) === 0) return;
    if (fromIdx === toIdx) return;
    this.shipments.update(prev => {
      const next = prev.map(b => ({ ...b, items: b.items.map(it => ({ ...it })) }));
      const fromItems = next[fromIdx].items;
      const toItems = next[toIdx].items;
      const stay: BucketItem[] = [];
      for (const it of fromItems) {
        if (this.isRowSelected(fromIdx, it.rowKey)) {
          // Merge into an existing destination row (same rowKey) by adding qty (capped by combined maxQty).
          const existing = toItems.find(t => t.rowKey === it.rowKey);
          if (existing) {
            existing.qty += it.qty;
            existing.maxQty += it.maxQty;
          } else {
            toItems.push({ ...it });
          }
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
    this.openMoveIdx.set(-1);
  }
  pickMoveTarget(fromIdx: number, toIdx: number, evt: Event) {
    evt.stopPropagation();
    this.moveSelected(fromIdx, toIdx);
  }

  // ---- Add / remove shipment ----
  addShipment() {
    this.shipments.update(prev => [
      ...prev,
      { id: `s${this.nextShipmentNum}`, warehouse: this.originalWarehouse, items: [] },
    ]);
    this.nextShipmentNum++;
  }
  requestRemoveShipment(sIdx: number, evt: Event) {
    evt.stopPropagation();
    if (this.shipments().length <= 2) return;
    this.openDeleteConfirmIdx.set(sIdx);
  }
  cancelRemoveShipment(evt: Event) { evt.stopPropagation(); this.openDeleteConfirmIdx.set(-1); }
  confirmRemoveShipment(sIdx: number, evt: Event) {
    evt.stopPropagation();
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
    this.openDeleteConfirmIdx.set(-1);
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
  closeAllMenus() {
    this.openWarehouseIdx.set(-1);
    this.openMoveIdx.set(-1);
    this.openDeleteConfirmIdx.set(-1);
  }

  onConfirm() {
    if (!this.canConfirm()) return;
    // Build the payload using product metadata (unitValue) preserved from the original shipment products.
    const buckets = this.shipments().map(b => ({
      warehouse: b.warehouse,
      items: b.items.map(it => {
        const src = this.products.find(p => p.sku === it.sku && p.name === it.name);
        const unitValue = src?.unitValue ?? 0;
        return { sku: it.sku, name: it.name, qty: it.qty, unitValue };
      }),
    }));
    this.confirm.emit({ buckets });
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.cancel.emit(); }
}
