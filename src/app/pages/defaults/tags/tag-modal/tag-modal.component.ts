import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TAG_CATEGORIES,
  TAG_COLORS,
  Tag,
  TagCategory,
  TagColor,
  TagColorSpec,
  TagInsert,
} from '../../../../core/models/tag.model';
import { TagPillComponent } from '../../../../shared/components/tag-pill/tag-pill.component';
/**
 * Add / Edit Tag modal — Figma `27686:185147`.
 */
@Component({
  selector: 'app-tag-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TagPillComponent],
  templateUrl: './tag-modal.component.html',
})
export class TagModalComponent {
  @Input() initialTag: Tag | null = null;
  /** Pre-select category when creating a tag from an entity context. */
  @Input() presetCategory: TagCategory | null = null;
  @Output() save = new EventEmitter<TagInsert>();
  @Output() cancel = new EventEmitter<void>();

  readonly CATEGORIES = TAG_CATEGORIES;
  readonly COLORS = TAG_COLORS;

  name = signal<string>('');
  category = signal<TagCategory | ''>('');
  color = signal<TagColor | ''>('');

  categoryOpen = signal<boolean>(false);
  colorOpen = signal<boolean>(false);

  readonly isEdit = computed(() => !!this.initialTag);
  readonly canSave = computed(
    () => this.name().trim().length > 0 && !!this.category() && !!this.color(),
  );
  readonly selectedColorSpec = computed<TagColorSpec | null>(() => {
    const c = this.color();
    return c ? TAG_COLORS.find((s) => s.name === c) ?? null : null;
  });
  readonly previewLabel = computed(() => (this.name().trim() ? this.name().trim() : 'Text'));

  ngOnInit() {
    if (this.initialTag) {
      this.name.set(this.initialTag.name);
      this.category.set(this.initialTag.category);
      this.color.set(this.initialTag.color);
    } else if (this.presetCategory) {
      this.category.set(this.presetCategory);
    }
  }

  toggleCategory(evt: MouseEvent) {
    evt.stopPropagation();
    this.colorOpen.set(false);
    this.categoryOpen.update((v) => !v);
  }

  toggleColor(evt: MouseEvent) {
    evt.stopPropagation();
    this.categoryOpen.set(false);
    this.colorOpen.update((v) => !v);
  }

  pickCategory(c: TagCategory, evt: MouseEvent) {
    evt.stopPropagation();
    this.category.set(c);
    this.categoryOpen.set(false);
  }

  pickColor(c: TagColor, evt: MouseEvent) {
    evt.stopPropagation();
    this.color.set(c);
    this.colorOpen.set(false);
  }

  closePickers() {
    this.categoryOpen.set(false);
    this.colorOpen.set(false);
  }

  onSave() {
    if (!this.canSave()) return;
    this.save.emit({
      name: this.name().trim(),
      category: this.category() as TagCategory,
      color: this.color() as TagColor,
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
