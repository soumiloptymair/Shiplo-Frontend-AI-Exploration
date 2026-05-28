import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { NotesTabComponent } from '../../../shared/notes-tab/notes-tab.component';
import { EntityTagsComponent } from '../../../shared/components/entity-tags/entity-tags.component';

type DetailTab = 'Inventory' | 'Details' | 'Activity' | 'Notes';

@Component({
  selector: 'app-product-detail-panel',
  standalone: true,
  imports: [CommonModule, NotesTabComponent, EntityTagsComponent],
  templateUrl: './product-detail-panel.component.html',
})
export class ProductDetailPanelComponent {
  readonly svc = inject(InventoryService);

  readonly TABS: DetailTab[] = ['Inventory', 'Details', 'Activity', 'Notes'];
  readonly activeTab = signal<DetailTab>('Details');

  readonly headerLabel = computed(() =>
    this.svc.selectedItem()?.kind === 'variant' ? 'VARIANT' : 'PRODUCT'
  );

  readonly title = computed(() => {
    const sel = this.svc.selectedItem();
    if (!sel) return '';
    return sel.kind === 'variant' ? sel.variant.name : sel.product.name;
  });

  readonly metaLines = computed(() => {
    const sel = this.svc.selectedItem();
    if (!sel) return [] as { label: string; value: string }[];
    if (sel.kind === 'variant') {
      const v = sel.variant;
      return [
        { label: 'Parent', value: sel.product.name },
        { label: 'SKU',    value: v.sku },
        { label: 'Ext. ID',value: v.extId },
        { label: 'Size',   value: v.size },
        { label: 'Color',  value: v.color },
        { label: 'Price',  value: v.value },
      ];
    }
    const p = sel.product;
    return [
      { label: 'Type',    value: p.type },
      { label: 'Origin',  value: p.origin },
      { label: 'HS Code', value: p.hsCode },
      { label: 'Price',   value: p.valueRange },
    ];
  });

  setTab(t: DetailTab) { this.activeTab.set(t); }

  close() { this.svc.closeDetails(); }

  onProductTagIdsChange(tagIds: string[]) {
    const sel = this.svc.selectedItem();
    if (!sel || sel.kind !== 'product') return;
    this.svc.setProductTagIds(sel.product.id, tagIds);
  }
}
