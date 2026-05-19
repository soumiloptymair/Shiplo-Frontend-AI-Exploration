import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusTone = 'blue' | 'green' | 'red' | 'yellow';

/**
 * Wallet/data-grid status pill.
 *
 * Maps a textual status (e.g. "Initiated", "Completed") to a Figma `chip.*`
 * background token via the `tone` input. Use the static `toneFor()` helper
 * to keep status → tone mappings centralised.
 */
@Component({
  selector: 'app-status-pill',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex h-6 items-center rounded-token px-2 text-body-md text-fg-primary"
      [ngClass]="bgClass"
      [attr.data-testid]="testId">
      <ng-content></ng-content>
    </span>
  `,
})
export class StatusPillComponent {
  @Input({ required: true }) tone: StatusTone = 'blue';
  @Input() testId: string | null = null;

  get bgClass(): string {
    switch (this.tone) {
      case 'green':  return 'bg-chip-green';
      case 'red':    return 'bg-chip-red';
      case 'yellow': return 'bg-chip-yellow';
      case 'blue':
      default:       return 'bg-chip-blue';
    }
  }

  /** Centralised mapping of status text → chip tone. */
  static toneFor(status: string): StatusTone {
    switch (status) {
      case 'Completed':
      case 'Refunded':
      case 'Approved':
        return 'green';
      case 'Failed':
      case 'Voided':
      case 'Cancelled':
      case 'Declined':
        return 'red';
      case 'Needs Review':
        return 'yellow';
      case 'Initiated':
      case 'Processing':
      case 'Scheduled':
      default:
        return 'blue';
    }
  }
}
