import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';
import { InventoryService } from '../../core/services/inventory.service';
import { InventoryTab } from '../../core/models/inventory.model';
import { SyncDialogComponent } from '../../shared/sync-dialog/sync-dialog.component';
import { ToastComponent } from '../../shared/toast/toast.component';
import { ProductDetailPanelComponent } from './product-detail-panel/product-detail-panel.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, AppShellComponent, SyncDialogComponent, ToastComponent, ProductDetailPanelComponent],
  templateUrl: './inventory.component.html',
})
export class InventoryComponent {
  svc = inject(InventoryService);

  readonly TABS: InventoryTab[] = ['SKUs', 'Products'];

  setTab(tab: InventoryTab) { this.svc.activeTab.set(tab); }
  isExpanded(id: string): boolean { return this.svc.isExpanded(id); }
  toggleExpand(event: Event, id: string) {
    event.stopPropagation();
    this.svc.toggleExpand(id);
  }
  selectProduct(id: string) { this.svc.selectProduct(id); }
  selectVariant(productId: string, variantId: string) { this.svc.selectVariant(productId, variantId); }
}
