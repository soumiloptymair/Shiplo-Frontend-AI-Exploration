import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PACKAGING_TYPES,
  PackagingConfig,
  PackagingConfigInsert,
  PackagingType,
} from '../../../../core/models/packaging.model';

/**
 * Add / Edit Packaging modal.
 *
 * Pixel-faithful to Figma `7d1Ged8LHQYBV9abYhNhxG` node `25742:154612`.
 * Centered 480px white card on a dark backdrop. Header: title + close (X).
 * Body: Name + Type (2-col), L/W/H (3-col), Packaging Weight + Maximum
 * Weight (2-col), Cost (full width, $-prefixed). Footer: Cancel + Save
 * (Save disabled until Name and Type are filled).
 */
@Component({
  selector: 'app-packaging-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './packaging-modal.component.html',
})
export class PackagingModalComponent {
  @Input() initialConfig: PackagingConfig | null = null;
  @Output() save = new EventEmitter<PackagingConfigInsert>();
  @Output() cancel = new EventEmitter<void>();

  readonly TYPES = PACKAGING_TYPES;

  name = signal<string>('');
  type = signal<PackagingType | ''>('');
  length = signal<number>(0);
  width = signal<number>(0);
  height = signal<number>(0);
  tareWeight = signal<number>(0);
  maxWeight = signal<number>(0);
  cost = signal<number>(0);
  enabled = signal<boolean>(true);

  typePickerOpen = signal<boolean>(false);

  readonly isEdit = computed(() => !!this.initialConfig);
  readonly canSave = computed(() => this.name().trim().length > 0 && !!this.type());

  ngOnInit() {
    if (this.initialConfig) {
      const c = this.initialConfig;
      this.name.set(c.name);
      this.type.set(c.type);
      this.length.set(c.length);
      this.width.set(c.width);
      this.height.set(c.height);
      this.tareWeight.set(c.tareWeight);
      this.maxWeight.set(c.maxWeight);
      this.cost.set(c.cost);
      this.enabled.set(c.enabled);
    }
  }

  toggleTypePicker(evt: MouseEvent) {
    evt.stopPropagation();
    this.typePickerOpen.update((v) => !v);
  }

  selectType(t: PackagingType, evt: MouseEvent) {
    evt.stopPropagation();
    this.type.set(t);
    this.typePickerOpen.set(false);
  }

  closePicker() {
    this.typePickerOpen.set(false);
  }

  onSave() {
    if (!this.canSave()) return;
    const payload: PackagingConfigInsert = {
      name: this.name().trim(),
      type: this.type() as PackagingType,
      length: Number(this.length()) || 0,
      width: Number(this.width()) || 0,
      height: Number(this.height()) || 0,
      tareWeight: Number(this.tareWeight()) || 0,
      maxWeight: Number(this.maxWeight()) || 0,
      cost: Number(this.cost()) || 0,
      enabled: this.enabled(),
    };
    this.save.emit(payload);
  }

  onCancel() {
    this.cancel.emit();
  }

  setNum(sig: ReturnType<typeof signal<number>>, raw: string) {
    const n = parseFloat(raw);
    sig.set(Number.isFinite(n) ? n : 0);
  }
}
