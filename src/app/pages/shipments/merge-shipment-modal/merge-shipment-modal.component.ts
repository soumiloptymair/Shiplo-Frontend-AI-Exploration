import { Component, Input, Output, EventEmitter, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../core/models/shipment.model';

export interface MergeConfirmPayload {
  sourceIds: string[];
  keptWarehouse: string;
}

@Component({
  selector: 'app-merge-shipment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merge-shipment-modal.component.html',
})
export class MergeShipmentModalComponent {
  /** The shipment the user invoked merge from (rendered as Order 1). */
  @Input({ required: true }) primary!: Shipment;
  /** Candidate peers (same customer + destinationZip). Rendered as Order 2..N. */
  @Input({ required: true }) candidates: Shipment[] = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<MergeConfirmPayload>();

  /** All shipments rendered as side-by-side cards (primary first, then candidates). */
  readonly orders = computed<Shipment[]>(() => [this.primary, ...this.candidates]);

  /** Convert "Last, First" → "First Last" for display in the Customer block. */
  customerName(s: Shipment): string {
    const parts = s.customer.split(',').map((p) => p.trim()).filter(Boolean);
    return parts.length === 2 ? `${parts[1]} ${parts[0]}` : s.customer;
  }

  /** Per-spec placeholder Shipping Address (Figma uses a single fixed address; ZIP swaps to live value). */
  shippingAddress(s: Shipment): string {
    const zip = s.destinationZip ?? '73928';
    return `3672 Chesterfield Blvd., Nashville, TN ${zip}, US`;
  }

  onConfirm() {
    this.confirm.emit({
      sourceIds: this.orders().map((s) => s.id),
      keptWarehouse: this.primary.warehouse,
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.cancel.emit(); }
}
