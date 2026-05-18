import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { DEFAULT_VARIANT_ACTIVITY, VariantActivityEntry } from '../../../core/models/inventory.model';

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
    // Reset tab and activity search whenever the selected variant changes.
    effect(() => {
      this.svc.selectedVariantId();
      this.activeTab.set('Inventory');
      this.activityQuery.set('');
    });
  }

  readonly activity: VariantActivityEntry[] = DEFAULT_VARIANT_ACTIVITY;
  readonly activityQuery = signal('');

  readonly filteredActivity = computed(() => {
    const q = this.activityQuery().trim().toLowerCase();
    if (!q) return this.activity;
    return this.activity.filter(a =>
      a.shipmentId.toLowerCase().includes(q) ||
      a.warehouse.toLowerCase().includes(q) ||
      a.source.toLowerCase().includes(q)
    );
  });

  onActivityQuery(e: Event) {
    this.activityQuery.set((e.target as HTMLInputElement).value);
  }

  setTab(t: VariantTab) { this.activeTab.set(t); }
  close() { this.svc.closeDetails(); }

  incQty(_w: string) { /* hook for later */ }
  decQty(_w: string) { /* hook for later */ }
}
