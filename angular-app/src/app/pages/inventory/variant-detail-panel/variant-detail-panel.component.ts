import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';

type VariantTab = 'Inventory' | 'Details' | 'Activity' | 'Notes';

@Component({
  selector: 'app-variant-detail-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './variant-detail-panel.component.html',
})
export class VariantDetailPanelComponent {
  readonly svc = inject(InventoryService);

  readonly TABS: VariantTab[] = ['Inventory', 'Details', 'Activity', 'Notes'];
  readonly activeTab = signal<VariantTab>('Inventory');

  readonly variantSelection = computed(() => {
    const sel = this.svc.selectedItem();
    return sel?.kind === 'variant' ? sel : null;
  });

  constructor() {
    // Reset to Inventory tab whenever the selected variant changes.
    effect(() => {
      this.svc.selectedVariantId();
      this.activeTab.set('Inventory');
    });
  }

  setTab(t: VariantTab) { this.activeTab.set(t); }
  close() { this.svc.closeDetails(); }

  incQty(_w: string) { /* hook for later */ }
  decQty(_w: string) { /* hook for later */ }
}
