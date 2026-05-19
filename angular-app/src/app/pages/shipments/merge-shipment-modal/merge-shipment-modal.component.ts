import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment, ShipmentProduct } from '../../../core/models/shipment.model';

export interface MergeConfirmPayload {
  sourceIds: string[];
  keptWarehouse: string;
}

@Component({
  selector: 'app-merge-shipment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merge-shipment-modal.component.html',
})
export class MergeShipmentModalComponent implements OnChanges {
  /** The shipment the user invoked merge from (always included; cannot be unchecked). */
  @Input({ required: true }) primary!: Shipment;
  /** Candidate peers (same customer + destination ZIP). Pre-checked; user can uncheck. */
  @Input({ required: true }) candidates: Shipment[] = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<MergeConfirmPayload>();

  /** Currently selected source ids (primary is always included). */
  selectedIds = signal<Set<string>>(new Set());
  /** Warehouse chosen to be kept for the merged shipment (must be one of the source warehouses). */
  keptWarehouse = signal<string>('');

  /** All shipments rendered as right-side source cards (primary first, then candidates). */
  readonly allShipments = computed<Shipment[]>(() => [this.primary, ...this.candidates]);

  readonly selectedShipments = computed<Shipment[]>(() => {
    const sel = this.selectedIds();
    return this.allShipments().filter((s) => sel.has(s.id));
  });

  /** Union of warehouses across the *currently selected* sources — drives the warehouse radio group. */
  readonly warehouseOptions = computed<string[]>(() => {
    const seen = new Set<string>();
    for (const s of this.selectedShipments()) seen.add(s.warehouse);
    return [...seen];
  });

  /** Live-recomputed merged product list (de-duped by SKU, qty summed). */
  readonly mergedProducts = computed<ShipmentProduct[]>(() => {
    const map = new Map<string, ShipmentProduct>();
    for (const s of this.selectedShipments()) {
      for (const p of s.products ?? []) {
        const existing = map.get(p.sku);
        if (existing) existing.qty += p.qty;
        else map.set(p.sku, { ...p });
      }
    }
    return [...map.values()];
  });

  readonly totalQty = computed(() => this.mergedProducts().reduce((sum, p) => sum + p.qty, 0));
  readonly totalValue = computed(() => this.mergedProducts().reduce((sum, p) => sum + p.qty * p.unitValue, 0));

  readonly canConfirm = computed(() => this.selectedShipments().length >= 2 && !!this.keptWarehouse());
  readonly destinationZip = computed(() => this.primary.destinationZip ?? '');

  ngOnChanges() {
    const next = new Set<string>([this.primary.id, ...this.candidates.map((c) => c.id)]);
    this.selectedIds.set(next);
    // Default kept warehouse to the primary shipment's warehouse.
    this.keptWarehouse.set(this.primary.warehouse);
  }

  isSelected(id: string): boolean { return this.selectedIds().has(id); }
  isPrimary(id: string): boolean { return id === this.primary.id; }

  toggle(id: string, evt: Event) {
    evt.stopPropagation();
    if (this.isPrimary(id)) return;
    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Don't allow dropping below 2 total selected.
        if (next.size <= 2) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    // If the previously kept warehouse is no longer present, fall back to the primary's.
    if (!this.warehouseOptions().includes(this.keptWarehouse())) {
      this.keptWarehouse.set(this.primary.warehouse);
    }
  }

  setWarehouse(w: string) { this.keptWarehouse.set(w); }

  productsTotal(s: Shipment): number {
    return (s.products ?? []).reduce((sum, p) => sum + p.qty * p.unitValue, 0);
  }

  productsQty(s: Shipment): number {
    return (s.products ?? []).reduce((sum, p) => sum + p.qty, 0);
  }

  onConfirm() {
    if (!this.canConfirm()) return;
    this.confirm.emit({
      sourceIds: this.selectedShipments().map((s) => s.id),
      keptWarehouse: this.keptWarehouse(),
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.cancel.emit(); }
}
