import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';
import { PickPackService } from '../../core/services/pick-pack.service';
import { PICKERS } from '../../core/models/pick-pack.model';

@Component({
  selector: 'app-pick-and-pack',
  standalone: true,
  imports: [CommonModule, FormsModule, AppShellComponent],
  templateUrl: './pick-and-pack.component.html',
})
export class PickAndPackComponent {
  svc = inject(PickPackService);
  readonly PICKERS = PICKERS;

  readonly allShipmentsSelected = computed(() => {
    const tog = this.svc.togglableShipments();
    const sel = this.svc.selectedShipmentIds();
    return tog.length > 0 && tog.every((s) => sel.has(s.id));
  });

  readonly someShipmentsSelected = computed(() => {
    const tog = this.svc.togglableShipments();
    const sel = this.svc.selectedShipmentIds();
    return tog.some((s) => sel.has(s.id)) && !this.allShipmentsSelected();
  });

  readonly totalShipmentsCount = computed(() => this.svc.relatedShipments().length);
  readonly shippedCount = computed(() => Math.max(0, this.totalShipmentsCount() - 2));
  readonly remainingCount = computed(() => Math.max(0, this.totalShipmentsCount() - this.shippedCount()));
  readonly totalQty = computed(() => this.svc.aggregatedProducts().reduce((s, p) => s + p.qty, 0));

  formatMoney(v: number): string {
    return `$${v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}
