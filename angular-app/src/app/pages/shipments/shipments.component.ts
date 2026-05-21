import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';
import { ShipmentDetailPanelComponent } from './shipment-detail-panel/shipment-detail-panel.component';
import { NewShipmentModalComponent } from './new-shipment-modal/new-shipment-modal.component';
import { ShipmentService, ShipmentTab } from '../../core/services/shipment.service';
import { ToastService } from '../../core/services/toast.service';
import { SHIPMENT_STATUSES, ShipmentStatus, STATUS_PILL_CLASS } from '../../core/models/shipment.model';
import { NewShipmentDraft } from '../../core/models/new-shipment.model';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule, AppShellComponent, ShipmentDetailPanelComponent, NewShipmentModalComponent],
  templateUrl: './shipments.component.html',
})
export class ShipmentsComponent {
  svc = inject(ShipmentService);
  private toast = inject(ToastService);

  readonly TABS: ShipmentTab[] = ['All', 'Orders', 'Returns'];
  readonly SHIPMENT_STATUSES = SHIPMENT_STATUSES;
  readonly STATUS_PILL_CLASS = STATUS_PILL_CLASS;

  statusFilterOpen = signal(false);
  /** Id of the row whose 3-dot action menu is open; null when no menu is open. */
  openMenuId = signal<string | null>(null);
  /** Drives the Create New Shipment modal. */
  newShipmentOpen = signal<boolean>(false);
  /** Drives the Saved Quotes dropdown. */
  quotesMenuOpen = signal<boolean>(false);
  /**
   * Optional draft passed into the modal on its next open. Set when the user
   * resumes a saved quote so the wizard restores its prior state; cleared on close.
   */
  pendingQuoteDraft = signal<NewShipmentDraft | null>(null);

  openNewShipment() {
    this.pendingQuoteDraft.set(null);
    this.newShipmentOpen.set(true);
  }
  closeNewShipment() {
    this.newShipmentOpen.set(false);
    this.pendingQuoteDraft.set(null);
  }

  toggleQuotesMenu(event: MouseEvent) {
    event.stopPropagation();
    this.quotesMenuOpen.update((v) => !v);
  }

  onSaveAsQuote(draft: NewShipmentDraft) {
    const quote = this.svc.saveQuote(draft);
    this.toast.show('Quote saved', quote.label);
    this.newShipmentOpen.set(false);
    this.pendingQuoteDraft.set(null);
  }

  resumeQuote(id: string, event: MouseEvent) {
    event.stopPropagation();
    const draft = this.svc.getQuoteDraft(id);
    this.quotesMenuOpen.set(false);
    if (!draft) return;
    // Closing first guarantees the modal re-mounts and ngOnInit picks up the new initialDraft.
    this.newShipmentOpen.set(false);
    this.pendingQuoteDraft.set(draft);
    queueMicrotask(() => this.newShipmentOpen.set(true));
  }

  deleteQuote(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.svc.deleteQuote(id);
  }

  @HostListener('document:click')
  closeStatusDropdown() {
    this.statusFilterOpen.set(false);
    this.openMenuId.set(null);
    this.quotesMenuOpen.set(false);
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
