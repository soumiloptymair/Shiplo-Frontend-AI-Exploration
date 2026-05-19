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
        needsAttention: false,
        tags: [],
        isSplit: true,
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
}
