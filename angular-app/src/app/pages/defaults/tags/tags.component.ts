import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagsService } from '../../../core/services/tags.service';
import { TAG_COLORS, Tag, TagColor, TagInsert } from '../../../core/models/tag.model';
import { ToastService } from '../../../core/services/toast.service';
import { TagModalComponent } from './tag-modal/tag-modal.component';

/**
 * Settings → Defaults → Tags.
 *
 * Pixel-faithful to Figma `7d1Ged8LHQYBV9abYhNhxG` node `27686-184888`.
 * Header: tag icon + "Tags" title, search input, "+ Add" CTA.
 * Sub-title: "TAG CONFIGURATION" small-caps + description line.
 * Table: Name / Category / Color (swatch + label) / Preview pill / row menu.
 * Footer: "Total Tags: N".
 */
@Component({
  selector: 'app-tags-defaults',
  standalone: true,
  imports: [CommonModule, TagModalComponent],
  templateUrl: './tags.component.html',
})
export class TagsDefaultsComponent {
  readonly svc = inject(TagsService);
  private readonly toast = inject(ToastService);

  modalOpen = signal<boolean>(false);
  editing = signal<Tag | null>(null);
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

  openEdit(row: Tag, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
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
    this.toast.show('Tag deleted');
  }

  onSearch(value: string) {
    this.svc.setQuery(value);
  }

  colorSpec(name: TagColor) {
    return TAG_COLORS.find((c) => c.name === name) ?? TAG_COLORS[0];
  }

  trackById(_i: number, row: Tag) { return row.id; }
}
