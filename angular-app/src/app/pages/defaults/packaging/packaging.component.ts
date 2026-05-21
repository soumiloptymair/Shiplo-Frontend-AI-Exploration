import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackagingService } from '../../../core/services/packaging.service';
import { PackagingConfig, PackagingConfigInsert } from '../../../core/models/packaging.model';
import { ToastService } from '../../../core/services/toast.service';
import { PackagingModalComponent } from './packaging-modal/packaging-modal.component';

/**
 * Settings → Defaults → Packaging.
 *
 * Pixel-faithful to Figma `7d1Ged8LHQYBV9abYhNhxG` node `25739:522` (right pane).
 * Renders: header with "Add Packaging" CTA, "PRE-DEFINED CARRIER PACKAGING"
 * section, and a table of packaging configurations with an enabled toggle and
 * 3-dot row menu (Edit / Delete with inline confirm).
 */
@Component({
  selector: 'app-packaging-defaults',
  standalone: true,
  imports: [CommonModule, PackagingModalComponent],
  templateUrl: './packaging.component.html',
})
export class PackagingDefaultsComponent {
  readonly svc = inject(PackagingService);
  private readonly toast = inject(ToastService);

  modalOpen = signal<boolean>(false);
  editing = signal<PackagingConfig | null>(null);
  openMenuId = signal<string | null>(null);
  pendingDeleteId = signal<string | null>(null);

  @HostListener('document:click')
  onDocClick() {
    this.openMenuId.set(null);
    this.pendingDeleteId.set(null);
  }

  openCreate() {
    this.editing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(row: PackagingConfig, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
    this.editing.set(row);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editing.set(null);
  }

  onSave(payload: PackagingConfigInsert) {
    if (this.editing()) {
      this.svc.update({ ...this.editing()!, ...payload });
      this.toast.show('Packaging updated');
    } else {
      this.svc.add(payload);
      this.toast.show('Packaging added');
    }
    this.closeModal();
  }

  toggle(id: string) {
    this.svc.toggle(id);
  }

  toggleMenu(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.update((cur) => (cur === id ? null : id));
  }

  startDelete(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.pendingDeleteId.set(id);
  }

  cancelDelete() {
    this.pendingDeleteId.set(null);
  }

  confirmDelete() {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.svc.delete(id);
    this.pendingDeleteId.set(null);
    this.toast.show('Packaging deleted');
  }

  pendingDeleteName(): string {
    const id = this.pendingDeleteId();
    return id ? (this.svc.configs().find((r) => r.id === id)?.name ?? '') : '';
  }

  trackById(_i: number, row: PackagingConfig) { return row.id; }

  formatNumber(n: number, digits = 2): string {
    return n.toFixed(digits);
  }

  formatCost(n: number): string {
    return `$${n.toFixed(2)}`;
  }
}
