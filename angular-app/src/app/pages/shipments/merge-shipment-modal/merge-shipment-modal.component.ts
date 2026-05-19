import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../core/models/shipment.model';

type CardTab = 'Details' | 'Products' | 'Notes' | 'Shipment Log';

@Component({
  selector: 'app-merge-shipment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merge-shipment-modal.component.html',
})
export class MergeShipmentModalComponent implements OnChanges {
  /** The shipment the user invoked merge from (always included). */
  @Input({ required: true }) primary!: Shipment;
  /** Candidate peers (same destination + customer). Pre-included; user can remove down to a minimum of 2 total cards. */
  @Input({ required: true }) candidates: Shipment[] = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ sourceIds: string[] }>();

  readonly CARRIER_ICON = 'figmaAssets/pngegg--2--1-1.png';
  readonly SOURCE_ICON = 'figmaAssets/integrations-1.png';
  readonly TABS: CardTab[] = ['Details', 'Products', 'Notes', 'Shipment Log'];

  /** Selected source ids (primary always included; candidates toggleable). */
  selectedIds = signal<Set<string>>(new Set());
  /** Active tab per card id. */
  activeTab = signal<Record<string, CardTab>>({});

  readonly sources = computed<Shipment[]>(() => {
    const sel = this.selectedIds();
    const all = [this.primary, ...this.candidates];
    return all.filter((s) => sel.has(s.id));
  });

  readonly canConfirm = computed(() => this.sources().length >= 2);

  ngOnChanges() {
    // Pre-include primary + all candidates by default.
    const next = new Set<string>([this.primary.id, ...this.candidates.map((c) => c.id)]);
    this.selectedIds.set(next);
    // Default each card to Details.
    const tabs: Record<string, CardTab> = {};
    [this.primary, ...this.candidates].forEach((s) => (tabs[s.id] = 'Details'));
    this.activeTab.set(tabs);
  }

  /** True when removing this card would still leave ≥2 selected. Primary can never be removed. */
  canRemove(id: string): boolean {
    if (id === this.primary.id) return false;
    return this.sources().length > 2;
  }

  removeCard(id: string, evt: Event) {
    evt.stopPropagation();
    if (!this.canRemove(id)) return;
    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  setTab(id: string, tab: CardTab, evt: Event) {
    evt.stopPropagation();
    this.activeTab.update((prev) => ({ ...prev, [id]: tab }));
  }

  tabOf(id: string): CardTab {
    return this.activeTab()[id] ?? 'Details';
  }

  productsTotal(s: Shipment): number {
    return (s.products ?? []).reduce((sum, p) => sum + p.qty * p.unitValue, 0);
  }

  onConfirm() {
    if (!this.canConfirm()) return;
    this.confirm.emit({ sourceIds: this.sources().map((s) => s.id) });
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.cancel.emit(); }
}
