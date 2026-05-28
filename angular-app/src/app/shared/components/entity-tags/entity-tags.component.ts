import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Tag,
  TagCategory,
  TagInsert,
  tagColorSpec,
} from '../../../core/models/tag.model';
import { TagsService } from '../../../core/services/tags.service';
import { TagModalComponent } from '../../../pages/defaults/tags/tag-modal/tag-modal.component';
import { TagPillComponent } from '../tag-pill/tag-pill.component';

/**
 * Assign tags to an entity from tables and detail panels.
 * Figma workflow `27902:216408` — picker, pills, sync with Defaults → Tags.
 */
@Component({
  selector: 'app-entity-tags',
  standalone: true,
  imports: [CommonModule, FormsModule, TagModalComponent, TagPillComponent],
  templateUrl: './entity-tags.component.html',
})
export class EntityTagsComponent {
  @Input({ required: true }) tagIds: string[] = [];
  @Input({ required: true }) category!: TagCategory;
  @Input() variant: 'compact' | 'panel' = 'compact';
  @Input() testIdPrefix = 'entity-tags';
  @Input() maxVisible = 1;
  @Output() tagIdsChange = new EventEmitter<string[]>();

  readonly tagsSvc = inject(TagsService);
  readonly colorSpec = tagColorSpec;

  pickerOpen = signal(false);
  pickerPosition = signal<{ top: number; left: number } | null>(null);
  search = signal('');
  modalOpen = signal(false);
  editingTag = signal<Tag | null>(null);

  readonly assignedTags = computed(() => this.tagsSvc.resolveMany(this.tagIds));

  readonly visibleTags = computed(() => {
    const tags = this.assignedTags();
    if (this.variant === 'panel') return tags;
    return tags.slice(0, this.maxVisible);
  });

  readonly overflowCount = computed(() => {
    if (this.variant === 'panel') return 0;
    return Math.max(0, this.assignedTags().length - this.maxVisible);
  });

  private readonly categoryTags = computed(() => {
    const q = this.search().trim().toLowerCase();
    let rows = this.tagsSvc.tagsForCategory(this.category);
    if (q) {
      rows = rows.filter((t) => t.name.toLowerCase().includes(q));
    }
    return rows;
  });

  readonly selectedPickerTags = computed(() =>
    this.categoryTags().filter((t) => this.tagIds.includes(t.id)),
  );

  readonly unselectedPickerTags = computed(() =>
    this.categoryTags().filter((t) => !this.tagIds.includes(t.id)),
  );

  @HostListener('document:click')
  onDocumentClick() {
    this.closePicker();
  }

  openPicker(evt: MouseEvent) {
    evt.stopPropagation();
    if (this.pickerOpen()) {
      this.closePicker();
      return;
    }
    const rect = (evt.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 162;
    this.pickerPosition.set({
      top: rect.bottom + 4,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8)),
    });
    this.search.set('');
    this.pickerOpen.set(true);
  }

  closePicker() {
    this.pickerOpen.set(false);
    this.pickerPosition.set(null);
  }

  emitTagIds(ids: string[]) {
    this.tagIdsChange.emit(ids);
  }

  addTag(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    if (this.tagIds.includes(id)) return;
    this.emitTagIds([...this.tagIds, id]);
  }

  removeTag(id: string, evt?: MouseEvent) {
    evt?.stopPropagation();
    this.emitTagIds(this.tagIds.filter((t) => t !== id));
  }

  confirmDismissRequired(): boolean {
    return this.variant === 'compact';
  }

  openCreateModal(evt: MouseEvent) {
    evt.stopPropagation();
    this.editingTag.set(null);
    this.modalOpen.set(true);
    this.closePicker();
  }

  openEditModal(tag: Tag, evt: MouseEvent) {
    evt.stopPropagation();
    this.editingTag.set(tag);
    this.modalOpen.set(true);
    this.closePicker();
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editingTag.set(null);
  }

  onModalSave(payload: TagInsert) {
    const editing = this.editingTag();
    if (editing) {
      this.tagsSvc.update({ ...editing, ...payload });
    } else {
      const created = this.tagsSvc.add(payload);
      if (!this.tagIds.includes(created.id)) {
        this.emitTagIds([...this.tagIds, created.id]);
      }
    }
    this.closeModal();
  }
}
