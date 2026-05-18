import { Injectable, signal, computed } from '@angular/core';
import {
  INITIAL_PICK_PACK_ROWS,
  INITIAL_SHIPMENT_ROWS,
  PickListRow,
  PickListStatus,
  Product,
  ShipmentRow,
} from '../models/pick-pack.model';

@Injectable({ providedIn: 'root' })
export class PickPackService {
  readonly pickListRows = signal<PickListRow[]>(INITIAL_PICK_PACK_ROWS);
  readonly shipmentRows = signal<ShipmentRow[]>(INITIAL_SHIPMENT_ROWS);
  readonly selectedPickListId = signal<string | null>(null);
  readonly selectedShipmentIds = signal<Set<string>>(new Set());
  readonly expandedShipmentIds = signal<Set<string>>(new Set());
  readonly warehouse = signal('PA Fulfilment Facility');
  readonly newPicker = signal('');
  readonly lowInventoryDismissed = signal(false);

  readonly existingPickListShipmentIds = computed(() => {
    const id = this.selectedPickListId();
    if (!id) return new Set<string>();
    return new Set(
      this.shipmentRows()
        .filter((s) => s.pickListId === id)
        .map((s) => s.id),
    );
  });

  readonly displayShipments = computed(() => {
    const id = this.selectedPickListId();
    if (!id) return this.shipmentRows();
    const inList = this.shipmentRows().filter((s) => s.pickListId === id);
    const rest = this.shipmentRows().filter((s) => s.pickListId !== id);
    return [...inList, ...rest];
  });

  readonly togglableShipments = computed(() =>
    this.displayShipments().filter((s) => !this.existingPickListShipmentIds().has(s.id)),
  );

  readonly selectedShipments = computed(() =>
    this.shipmentRows().filter((s) => this.selectedShipmentIds().has(s.id)),
  );

  readonly selectedPickList = computed(() =>
    this.pickListRows().find((p) => p.pickListId === this.selectedPickListId()) ?? null,
  );

  readonly panelMode = computed((): 'pickList' | 'shipments' | 'addShipments' | null => {
    const pl = this.selectedPickList();
    const selCount = this.selectedShipmentIds().size;
    if (pl && selCount > 0) return 'addShipments';
    if (selCount > 0) return 'shipments';
    if (pl) return 'pickList';
    return null;
  });

  readonly totalValue = computed(() =>
    this.selectedShipments().reduce(
      (sum, s) => sum + (Number(s.totalValue.replace(/[^0-9.]/g, '')) || 0),
      0,
    ),
  );

  readonly totalWeight = computed(() =>
    this.selectedShipments().reduce((sum, s) => sum + Number(s.weight), 0),
  );

  readonly aggregatedProducts = computed((): Product[] => {
    const map = new Map<string, Product>();
    for (const s of this.selectedShipments()) {
      for (const p of s.products) {
        const ex = map.get(p.extId);
        if (ex) {
          ex.qty += p.qty;
          ex.lowInventory = ex.lowInventory || p.lowInventory;
        } else {
          map.set(p.extId, { ...p });
        }
      }
    }
    return Array.from(map.values());
  });

  readonly relatedShipments = computed(() => {
    const pl = this.selectedPickList();
    if (!pl) return [];
    return this.shipmentRows().filter((s) => s.pickListId === pl.pickListId);
  });

  readonly relatedLowInventoryNames = computed(() => {
    const names = new Set<string>();
    for (const s of this.relatedShipments()) {
      for (const p of s.products) {
        if (p.lowInventory) names.add(p.name);
      }
    }
    return Array.from(names);
  });

  readonly relatedItems = computed((): Product[] => {
    const map = new Map<string, Product>();
    for (const s of this.relatedShipments()) {
      for (const p of s.products) {
        const ex = map.get(p.extId);
        if (ex) {
          ex.qty += p.qty;
          ex.lowInventory = ex.lowInventory || p.lowInventory;
        } else {
          map.set(p.extId, { ...p });
        }
      }
    }
    return Array.from(map.values());
  });

  togglePickList(pickListId: string) {
    if (this.selectedPickListId() === pickListId) {
      this.selectedPickListId.set(null);
      this.selectedShipmentIds.set(new Set());
    } else {
      this.selectedPickListId.set(pickListId);
      this.selectedShipmentIds.set(new Set());
    }
    this.lowInventoryDismissed.set(false);
  }

  toggleShipment(id: string, checked: boolean) {
    if (this.existingPickListShipmentIds().has(id)) return;
    this.selectedShipmentIds.update((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
    this.lowInventoryDismissed.set(false);
  }

  selectAllShipments(checked: boolean) {
    if (checked) {
      this.selectedShipmentIds.set(new Set(this.togglableShipments().map((s) => s.id)));
    } else {
      this.selectedShipmentIds.set(new Set());
    }
    this.lowInventoryDismissed.set(false);
  }

  toggleExpand(id: string) {
    this.expandedShipmentIds.update((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  setPickListStatus(pickListId: string, status: PickListStatus) {
    this.pickListRows.update((prev) =>
      prev.map((p) => (p.pickListId === pickListId ? { ...p, status } : p)),
    );
  }

  createPickList() {
    const picker = this.newPicker();
    const selected = this.selectedShipments();
    if (!picker || selected.length === 0) return;

    const generatedId = this._nextPickListId();
    const selectedIds = new Set(this.selectedShipmentIds());
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const newRow: PickListRow = {
      id: `pick-pack-${Date.now()}`,
      pickListId: generatedId,
      createdOn: `${mm}/${dd}/${today.getFullYear()}`,
      warehouse: this.warehouse(),
      totalOrders: String(selected.length),
      picker,
      status: 'Picking',
    };

    this.pickListRows.update((prev) => [newRow, ...prev]);
    this.shipmentRows.update((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, pickListId: generatedId } : s)),
    );
    this.selectedShipmentIds.set(new Set());
    this.newPicker.set('');
    this.selectedPickListId.set(generatedId);
  }

  addToPickList() {
    const targetId = this.selectedPickListId();
    const selected = this.selectedShipments();
    if (!targetId || selected.length === 0) return;

    const selectedIds = new Set(this.selectedShipmentIds());
    this.shipmentRows.update((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, pickListId: targetId } : s)),
    );
    this.pickListRows.update((prev) =>
      prev.map((p) =>
        p.pickListId === targetId
          ? { ...p, totalOrders: String(Number(p.totalOrders || '0') + selected.length) }
          : p,
      ),
    );
    this.selectedShipmentIds.set(new Set());
  }

  clearPanel() {
    this.selectedPickListId.set(null);
    this.selectedShipmentIds.set(new Set());
  }

  private _nextPickListId(): string {
    let max = 99999;
    for (const row of this.pickListRows()) {
      const m = /^PL-(\d+)$/i.exec(row.pickListId);
      if (m) {
        const n = parseInt(m[1], 10);
        if (Number.isFinite(n) && n > max) max = n;
      }
    }
    return `PL-${max + 1}`;
  }
}
