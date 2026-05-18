import { Injectable, signal, computed } from '@angular/core';
import { SAMPLE_INVENTORY, InventoryProduct, InventoryTab } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  readonly products = signal<InventoryProduct[]>(SAMPLE_INVENTORY);
  readonly activeTab = signal<InventoryTab>('Products');
  readonly searchQuery = signal('');
  readonly expandedIds = signal<Set<string>>(new Set(['p-1']));

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.products();
    return this.products().filter((p) =>
      `${p.name} ${p.extId} ${p.type} ${p.hsCode}`.toLowerCase().includes(q)
    );
  });

  readonly totalVariants = computed(() =>
    this.products().reduce((sum, p) => sum + p.variantCount, 0)
  );

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  toggleExpand(id: string) {
    this.expandedIds.update((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
}
