import { Injectable, signal, computed } from '@angular/core';
import { SAMPLE_SHIPMENTS, Shipment, ShipmentStatus, ShipmentProduct } from '../models/shipment.model';

export type ShipmentTab = 'All' | 'Orders' | 'Returns';

export interface SplitBucketInput {
  warehouse: string;
  items: ShipmentProduct[];
}

export interface SplitShipmentResult {
  /** The resulting shipment ids (e.g. ["s-4-1", "s-4-2"]) — these are flagged as selected so the grid highlights them. */
  newIds: string[];
  /** The original shipment's display id (e.g. "#20230101180003") for toast messaging. */
  originalLabel: string;
}

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  readonly allShipments = signal<Shipment[]>(SAMPLE_SHIPMENTS);
  readonly activeTab = signal<ShipmentTab>('All');
  readonly statusFilter = signal<'All' | ShipmentStatus>('All');
  readonly searchQuery = signal('');
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly panelShipmentId = signal<string | null>(null);

  readonly filtered = computed(() => {
    const tab = this.activeTab();
    const status = this.statusFilter();
    const q = this.searchQuery().toLowerCase().trim();
    return this.allShipments().filter((s) => {
      if (tab === 'Orders' && s.orderRefKind === 'return') return false;
      if (tab === 'Returns' && s.orderRefKind !== 'return') return false;
      if (status !== 'All' && s.status !== status) return false;
      if (q) {
        const hay = `${s.shipmentId} ${s.orderRefId} ${s.source} ${s.warehouse} ${s.customer}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  });

  readonly panelShipment = computed(() => {
    const id = this.panelShipmentId();
    return id ? this.allShipments().find((s) => s.id === id) ?? null : null;
  });

  toggleSelection(id: string) {
    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleAll() {
    const rows = this.filtered();
    const sel = this.selectedIds();
    const allSel = rows.length > 0 && rows.every((s) => sel.has(s.id));
    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      if (allSel) rows.forEach((s) => next.delete(s.id));
      else rows.forEach((s) => next.add(s.id));
      return next;
    });
  }

  openPanel(id: string) {
    this.panelShipmentId.set(this.panelShipmentId() === id ? null : id);
  }

  closePanel() {
    this.panelShipmentId.set(null);
  }

  /**
   * Replace the original shipment row with N new "Pending" rows (one per bucket).
   * - New ids: `${originalId}-${i+1}`; new shipmentId labels: `${original.shipmentId} - ${i+1}`.
   * - Empty buckets are skipped.
   * - The new rows are inserted at the original's index and added to `selectedIds` so the
   *   grid highlights them and the side panel is closed.
   */
  splitShipment(originalId: string, buckets: SplitBucketInput[]): SplitShipmentResult | null {
    const all = this.allShipments();
    const idx = all.findIndex((s) => s.id === originalId);
    if (idx < 0) return null;
    const original = all[idx];
    const nonEmpty = buckets.filter((b) => b.items.length > 0);
    if (nonEmpty.length < 2) return null;

    const newRows: Shipment[] = nonEmpty.map((bucket, i) => {
      const totalValue = bucket.items.reduce((sum, it) => sum + it.qty * it.unitValue, 0);
      return {
        ...original,
        id: `${original.id}-${i + 1}`,
        shipmentId: `${original.shipmentId} - ${i + 1}`,
        status: 'Pending' as ShipmentStatus,
        warehouse: bucket.warehouse,
        value: `$${totalValue.toFixed(2)}`,
        products: bucket.items.map((it) => ({ ...it })),
        // Reset per-shipment-only annotations so the split children start clean.
        splitRecommendation: undefined,
        mergeRecommendation: undefined,
        needsAttention: false,
        tags: [],
        isSplit: true,
        // Splitting a previously-merged row must clear merge state so the grid badges stay mutually exclusive.
        isMerged: false,
        originalIds: undefined,
      };
    });

    const next = [...all.slice(0, idx), ...newRows, ...all.slice(idx + 1)];
    this.allShipments.set(next);

    // Highlight the new rows in the grid and close the side panel.
    this.selectedIds.update((prev) => {
      const sel = new Set(prev);
      sel.delete(originalId);
      newRows.forEach((r) => sel.add(r.id));
      return sel;
    });
    this.panelShipmentId.set(null);

    return { newIds: newRows.map((r) => r.id), originalLabel: original.shipmentId };
  }

  /**
   * Find merge-eligible peers for `id`: same customer (used as the destination proxy — the model
   * has no explicit destination address field), compatible status, and not already split/merged.
   * Statuses incompatible with merging: Cancelled, Delivered, Delayed.
   */
  mergeCandidatesFor(id: string): Shipment[] {
    const all = this.allShipments();
    const me = all.find((s) => s.id === id);
    if (!me) return [];
    const blockedStatuses = new Set<ShipmentStatus | ''>(['Cancelled', 'Delivered', 'Delayed', '']);
    if (blockedStatuses.has(me.status)) return [];
    return all.filter((s) =>
      s.id !== id &&
      !s.isSplit &&
      !s.isMerged &&
      !blockedStatuses.has(s.status) &&
      s.customer === me.customer
    );
  }

  /**
   * Combine the given source shipments into a single new row inserted at the first source's grid index.
   * - Products are de-duplicated by SKU (qty summed; unit value preserved from the first occurrence).
   * - Status reset to "Pending"; the merged row's `isMerged` + `originalIds` are set so the grid can render the merge badge.
   * - The new id is added to `selectedIds` so the grid highlights it; the side panel is closed.
   */
  mergeShipments(sourceIds: string[]): { newId: string; originalLabels: string[] } | null {
    if (sourceIds.length < 2) return null;
    const all = this.allShipments();
    const sources = sourceIds.map((sid) => all.find((s) => s.id === sid)).filter(Boolean) as Shipment[];
    if (sources.length < 2) return null;
    const firstIdx = all.findIndex((s) => s.id === sources[0].id);
    if (firstIdx < 0) return null;

    // De-dupe products by SKU, summing qty; keep first occurrence's unitValue + name.
    const productMap = new Map<string, ShipmentProduct>();
    for (const src of sources) {
      for (const p of src.products ?? []) {
        const existing = productMap.get(p.sku);
        if (existing) existing.qty += p.qty;
        else productMap.set(p.sku, { ...p });
      }
    }
    const mergedProducts = [...productMap.values()];
    const totalValue = mergedProducts.reduce((sum, p) => sum + p.qty * p.unitValue, 0);

    const base = sources[0];
    const newId = `${base.id}-merged-${Date.now()}`;
    const newRow: Shipment = {
      ...base,
      id: newId,
      shipmentId: `${base.shipmentId} (merged)`,
      orderRefKind: 'combined',
      combinedCount: sources.length,
      status: 'Pending' as ShipmentStatus,
      value: `$${totalValue.toFixed(2)}`,
      products: mergedProducts,
      splitRecommendation: undefined,
      mergeRecommendation: undefined,
      needsAttention: false,
      tags: [],
      isSplit: false,
      isMerged: true,
      originalIds: sources.map((s) => s.id),
    };

    // Insert the merged row in place of the first-occurring source row (in grid order),
    // and drop every other source row.
    const removeIds = new Set(sources.map((s) => s.id));
    const next: Shipment[] = [];
    let inserted = false;
    for (const s of all) {
      if (removeIds.has(s.id)) {
        if (!inserted) { next.push(newRow); inserted = true; }
      } else {
        next.push(s);
      }
    }
    this.allShipments.set(next);

    this.selectedIds.update((prev) => {
      const sel = new Set(prev);
      removeIds.forEach((rid) => sel.delete(rid));
      sel.add(newId);
      return sel;
    });
    this.panelShipmentId.set(null);

    return { newId, originalLabels: sources.map((s) => s.shipmentId) };
  }
}
