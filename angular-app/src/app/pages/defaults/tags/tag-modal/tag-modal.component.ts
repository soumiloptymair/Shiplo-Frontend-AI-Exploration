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

/**
 * Add / Edit Tag modal.
 *
 * Pixel-faithful to Figma `7d1Ged8LHQYBV9abYhNhxG` node `27686-185147` /
 * `27686-185178` / `27686-185210` / `27686-185242`. Centered ~520px card on a
 * dark backdrop. Body: Name + Category (2-col, top row), Color + Preview
 * (2-col, second row). Footer: Cancel + Add/Save (disabled until Name,
 * Category and Color are all set).
 */
@Component({
  selector: 'app-tag-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-modal.component.html',
})
export class TagModalComponent {
  @Input() initialTag: Tag | null = null;
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
