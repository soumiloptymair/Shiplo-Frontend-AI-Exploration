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

  @HostListener('document:click')
  closeStatusDropdown() { this.statusFilterOpen.set(false); }

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
}
