import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagsService } from '../../../core/services/tags.service';
import { Tag, TagInsert, tagColorSpec } from '../../../core/models/tag.model';
import { ToastService } from '../../../core/services/toast.service';
import { TagModalComponent } from './tag-modal/tag-modal.component';

/**
 * Settings → Defaults → Tags.
 *
 * MT-01 create / edit / delete tags; MT-02 view tags by category.
 * Pixel-faithful to Figma `7d1Ged8LHQYBV9abYhNhxG` node `27686:184888`.
 */
@Component({
  selector: 'app-tags-defaults',
  standalone: true,
  imports: [CommonModule, TagModalComponent],
  templateUrl: './tags.component.html',
  host: { class: 'flex h-full min-h-0 flex-col overflow-hidden' },
})
export class TagsDefaultsComponent {
  readonly svc = inject(TagsService);
  private readonly toast = inject(ToastService);

  modalOpen = signal<boolean>(false);
  editing = signal<Tag | null>(null);
  openMenuId = signal<string | null>(null);
  menuPosition = signal<{ top: number; left: number } | null>(null);
  pendingDeleteId = signal<string | null>(null);

  readonly openMenuRow = computed(() => {
    const id = this.openMenuId();
    if (!id) return null;
    return this.svc.filtered().find((t) => t.id === id) ?? null;
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

  openEdit(row: Tag, evt: MouseEvent) {
    evt.stopPropagation();
    this.closeMenu();
    this.editing.set(row);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editing.set(null);
  }

  onSave(payload: TagInsert) {
    if (this.editing()) {
      this.svc.update({ ...this.editing()!, ...payload });
      this.toast.show('Tag updated');
    } else {
      this.svc.add(payload);
      this.toast.show('Tag added');
    }
    this.closeModal();
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
    this.toast.show('Tag deleted');
  }

  onSearch(value: string) {
    this.svc.setQuery(value);
  }

  colorSpec = tagColorSpec;

  trackById(_i: number, row: Tag) {
    return row.id;
  }
}
