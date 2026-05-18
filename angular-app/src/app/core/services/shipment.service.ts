import { Injectable, signal, computed } from '@angular/core';
import { SAMPLE_SHIPMENTS, Shipment, ShipmentStatus } from '../models/shipment.model';

export type ShipmentTab = 'All' | 'Orders' | 'Returns';

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
}
