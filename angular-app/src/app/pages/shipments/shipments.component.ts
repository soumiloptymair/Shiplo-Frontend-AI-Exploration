import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';
import { ShipmentDetailPanelComponent } from './shipment-detail-panel/shipment-detail-panel.component';
import { ShipmentService, ShipmentTab } from '../../core/services/shipment.service';
import { SHIPMENT_STATUSES, ShipmentStatus, STATUS_PILL_CLASS } from '../../core/models/shipment.model';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule, AppShellComponent, ShipmentDetailPanelComponent],
  templateUrl: './shipments.component.html',
})
export class ShipmentsComponent {
  svc = inject(ShipmentService);

  readonly TABS: ShipmentTab[] = ['All', 'Orders', 'Returns'];
  readonly SHIPMENT_STATUSES = SHIPMENT_STATUSES;
  readonly STATUS_PILL_CLASS = STATUS_PILL_CLASS;

  statusFilterOpen = signal(false);
  /** Id of the row whose 3-dot action menu is open; null when no menu is open. */
  openMenuId = signal<string | null>(null);

  @HostListener('document:click')
  closeStatusDropdown() {
    this.statusFilterOpen.set(false);
    this.openMenuId.set(null);
  }

  toggleRowMenu(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuId.update((cur) => (cur === id ? null : id));
  }

  onUnmerge(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuId.set(null);
    this.svc.unmergeShipment(id);
  }

  onUnsplit(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuId.set(null);
    this.svc.unsplitShipment(id);
  }

  readonly allSelected = computed(() => {
    const rows = this.svc.filtered();
    const sel = this.svc.selectedIds();
    return rows.length > 0 && rows.every((s) => sel.has(s.id));
  });

  statusPillClass(status: ShipmentStatus | ''): string {
    return status ? (STATUS_PILL_CLASS[status as ShipmentStatus] ?? '') : '';
  }

  kindIcon(kind: string): 'order' | 'return' | 'combined' {
    return kind as 'order' | 'return' | 'combined';
  }

  /** True when a row has at least one live merge candidate — drives the alert triangle. */
  hasMergeOpportunity(id: string): boolean {
    // Read the signal so the computation tracks grid mutations.
    void this.svc.allShipments();
    return this.svc.mergeCandidatesFor(id).length > 0;
  }
}
