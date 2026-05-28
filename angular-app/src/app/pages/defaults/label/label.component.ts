import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelService } from '../../../core/services/label.service';
import { LabelReference, LabelReferenceInsert } from '../../../core/models/label.model';
import { ToastService } from '../../../core/services/toast.service';
import { ReferenceModalComponent } from './reference-modal/reference-modal.component';

/**
 * Settings → Defaults → Label.
 *
 * Pixel-faithful to Figma `7d1Ged8LHQYBV9abYhNhxG` nodes `25750:53548`, `27302:169958`.
 */
@Component({
  selector: 'app-label-defaults',
  standalone: true,
  imports: [CommonModule, ReferenceModalComponent],
  templateUrl: './label.component.html',
  host: { class: 'flex h-full min-h-0 flex-col overflow-hidden' },
})
export class LabelDefaultsComponent {
  readonly svc = inject(LabelService);
  private readonly toast = inject(ToastService);

  modalOpen = signal<boolean>(false);
  editing = signal<LabelReference | null>(null);
  openMenuId = signal<string | null>(null);
  menuPosition = signal<{ top: number; left: number } | null>(null);
  pendingDeleteId = signal<string | null>(null);

  readonly openMenuRow = computed(() => {
    const id = this.openMenuId();
    if (!id) return null;
    return this.svc.filtered().find((r) => r.id === id) ?? null;
  });

  @HostListener('document:click')
  onDocClick() {
    this.closeMenu();
    this.pendingDeleteId.set(null);
  }

  private closeMenu() {
    this.openMenuId.set(null);
    this.menuPosition.set(null);
  }

  openCreate() {
    this.editing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(row: LabelReference, evt: MouseEvent) {
    evt.stopPropagation();
    this.closeMenu();
    this.editing.set(row);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editing.set(null);
  }

  onSave(payload: LabelReferenceInsert) {
    if (this.editing()) {
      this.svc.update({ ...this.editing()!, ...payload });
      this.toast.show('Reference updated');
    } else {
      this.svc.add(payload);
      this.toast.show('Reference added');
    }
    this.closeModal();
  }

  toggleEnabled(id: string) {
    this.svc.toggleEnabled(id);
  }

  toggleMenu(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    if (this.openMenuId() === id) {
      this.closeMenu();
      return;
    }

    const rect = (evt.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 192;
    this.menuPosition.set({
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - menuWidth),
    });
    this.openMenuId.set(id);
    this.pendingDeleteId.set(null);
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
    this.closeMenu();
    this.toast.show('Reference deleted');
  }

  onSearch(value: string) {
    this.svc.setQuery(value);
  }

  trackById(_i: number, row: LabelReference) {
    return row.id;
  }
}
