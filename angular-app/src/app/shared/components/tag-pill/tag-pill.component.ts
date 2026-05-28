import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Figma library pill for configurable tags (frame `27686:187591` / `1424:7124`).
 * Supports optional dismiss with optional confirmation.
 */
@Component({
  selector: 'app-tag-pill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag-pill.component.html',
  host: { class: 'inline-flex max-w-full' },
})
export class TagPillComponent {
  @Input({ required: true }) label!: string;
  @Input() backgroundColor = '#E4EAED';
  @Input() textColor = '#0B1516';
  @Input() dismissible = false;
  /** When true, dismiss requires an explicit confirm step. */
  @Input() confirmDismiss = false;
  /** Show a non-interactive X (e.g. tag modal preview). */
  @Input() showDismissIcon = false;
  @Input() testId: string | null = null;
  @Output() dismiss = new EventEmitter<void>();

  confirming = signal(false);
  confirmPosition = signal<{ top: number; left: number } | null>(null);

  @HostListener('document:click')
  onDocumentClick() {
    this.cancelConfirm();
  }

  onDismissClick(evt: MouseEvent) {
    evt.stopPropagation();
    if (!this.dismissible) return;

    if (this.confirmDismiss) {
      const rect = (evt.currentTarget as HTMLElement).getBoundingClientRect();
      this.confirmPosition.set({
        top: rect.bottom + 4,
        left: Math.max(8, rect.right - 176),
      });
      this.confirming.set(true);
      return;
    }

    this.dismiss.emit();
  }

  confirmRemove(evt: MouseEvent) {
    evt.stopPropagation();
    this.confirming.set(false);
    this.confirmPosition.set(null);
    this.dismiss.emit();
  }

  cancelConfirm(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.confirming.set(false);
    this.confirmPosition.set(null);
  }
}
