import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabelReference, LabelReferenceInsert } from '../../../../core/models/label.model';

/**
 * Add / Edit custom label reference — Figma Label title bar “Add Reference”.
 */
@Component({
  selector: 'app-reference-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reference-modal.component.html',
})
export class ReferenceModalComponent {
  @Input() initialReference: LabelReference | null = null;
  @Output() save = new EventEmitter<LabelReferenceInsert>();
  @Output() cancel = new EventEmitter<void>();

  name = signal<string>('');
  description = signal<string>('');

  readonly isEdit = computed(() => !!this.initialReference);
  readonly canSave = computed(() => this.name().trim().length > 0);

  ngOnInit() {
    if (this.initialReference) {
      this.name.set(this.initialReference.name);
      this.description.set(this.initialReference.description);
    }
  }

  onSave() {
    if (!this.canSave()) return;
    this.save.emit({
      name: this.name().trim(),
      description: this.description().trim(),
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
