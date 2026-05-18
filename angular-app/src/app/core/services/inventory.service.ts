import { Injectable, signal, computed } from '@angular/core';
import { SAMPLE_INVENTORY, InventoryProduct, ProductVariant, InventoryTab } from '../models/inventory.model';

export type SelectedItem =
  | { kind: 'product'; product: InventoryProduct }
  | { kind: 'variant'; product: InventoryProduct; variant: ProductVariant };

@Injectable({ providedIn: 'root' })
export class InventoryService {
  readonly products = signal<InventoryProduct[]>(SAMPLE_INVENTORY);
  readonly activeTab = signal<InventoryTab>('Products');
  readonly searchQuery = signal('');
  readonly expandedId = signal<string | null>('p-1');

  // Selection (for the right-hand details panel)
  readonly selectedProductId = signal<string | null>('p-1');
  readonly selectedVariantId = signal<string | null>(null);

  readonly selectedItem = computed<SelectedItem | null>(() => {
    const pid = this.selectedProductId();
    if (!pid) return null;
    const product = this.products().find((p) => p.id === pid);
    if (!product) return null;
    const vid = this.selectedVariantId();
    if (vid) {
      const variant = product.variants.find((v) => v.id === vid);
      if (variant) return { kind: 'variant', product, variant };
    }
    return { kind: 'product', product };
  });

  selectProduct(id: string) {
    this.selectedProductId.set(id);
    this.selectedVariantId.set(null);
  }

  selectVariant(productId: string, variantId: string) {
    this.selectedProductId.set(productId);
    this.selectedVariantId.set(variantId);
  }

  closeDetails() {
    this.selectedProductId.set(null);
    this.selectedVariantId.set(null);
  }

  isSelectedRow(id: string): boolean {
    return this.selectedProductId() === id && this.selectedVariantId() === null;
  }
  isSelectedVariant(id: string): boolean {
    return this.selectedVariantId() === id;
  }

  readonly syncing = signal(false);
  readonly syncProgress = signal(0);
  readonly toast = signal<{ title: string; message: string } | null>(null);
  readonly lastSyncedLabel = signal('Last Synced 20 min ago');

  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private finishTimer: ReturnType<typeof setTimeout> | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private syncRunId = 0;

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

  readonly warningCount = computed(() => {
    let count = 0;
    for (const p of this.products()) {
      if (p.needsAttention) count++;
      for (const v of p.variants) if (v.needsAttention) count++;
    }
    return count;
  });

  isExpanded(id: string): boolean {
    return this.expandedId() === id;
  }

  toggleExpand(id: string) {
    if (this.syncing()) return;
    this.expandedId.update((current) => (current === id ? null : id));
  }

  startSync() {
    if (this.syncing()) return;
    this.clearSyncTimers();
    const runId = ++this.syncRunId;
    this.syncing.set(true);
    this.syncProgress.set(0);
    this.syncTimer = setInterval(() => {
      if (runId !== this.syncRunId) return;
      const next = this.syncProgress() + Math.floor(Math.random() * 8) + 4;
      if (next >= 100) {
        this.syncProgress.set(100);
        this.finishSync(runId);
      } else {
        this.syncProgress.set(next);
      }
    }, 180);
  }

  cancelSync() {
    this.syncRunId++;
    this.clearSyncTimers();
    this.syncing.set(false);
    this.syncProgress.set(0);
  }

  private finishSync(runId: number) {
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.syncTimer = null;
    this.finishTimer = setTimeout(() => {
      this.finishTimer = null;
      if (runId !== this.syncRunId) return;
      this.syncing.set(false);
      this.lastSyncedLabel.set('Last Synced just now');
      this.showToast('Sync complete', 'Your product catalog is up to date.');
    }, 300);
  }

  private clearSyncTimers() {
    if (this.syncTimer) { clearInterval(this.syncTimer); this.syncTimer = null; }
    if (this.finishTimer) { clearTimeout(this.finishTimer); this.finishTimer = null; }
  }

  showToast(title: string, message: string) {
    this.toast.set({ title, message });
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }

  dismissToast() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = null;
    this.toast.set(null);
  }
}
