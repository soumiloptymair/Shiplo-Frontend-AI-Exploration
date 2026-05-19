import { Component, Input, Output, EventEmitter, signal, computed, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentProduct } from '../../../core/models/shipment.model';

type Side = 'A' | 'B';
interface AssignedProduct extends ShipmentProduct { side: Side; key: number; }

@Component({
  selector: 'app-split-shipment-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="modal-split-shipment"
      (click)="cancel.emit()"
    >
      <div
        class="flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <header class="flex items-center justify-between border-b border-[#e4eaed] px-5 py-4">
          <div class="flex flex-col gap-0.5">
            <h2 class="font-heading text-lg font-semibold text-[#0b1516]" data-testid="text-split-modal-title">
              Split Shipment
            </h2>
            <p class="font-body text-xs text-[#45565b]">
              Move items between <span class="font-medium text-[#0b1516]">{{ idA }}</span> and
              <span class="font-medium text-[#0b1516]">{{ idB }}</span>. Items move as whole quantities.
            </p>
          </div>
          <button type="button" aria-label="Close split modal" data-testid="button-close-split-modal"
            (click)="cancel.emit()"
            class="flex h-7 w-7 items-center justify-center rounded text-[#45565b] hover:bg-neutral-100">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <!-- Two columns -->
        <div class="grid flex-1 grid-cols-2 gap-4 overflow-y-auto px-5 py-5">
          <ng-container *ngFor="let side of SIDES">
            <section
              class="flex flex-col rounded-lg border border-[#e4eaed] bg-[#f6f9fb]"
              [attr.data-testid]="'column-shipment-' + side.toLowerCase()"
            >
              <header class="border-b border-[#e4eaed] px-3 py-2">
                <p class="font-body text-xs font-medium uppercase tracking-wide text-[#45565b]">
                  Shipment {{ side }}
                </p>
                <p class="font-body text-sm font-medium text-[#0b1516]">{{ side === 'A' ? idA : idB }}</p>
              </header>

              <ul class="flex flex-1 flex-col">
                <li
                  *ngFor="let p of bySide(side); let i = index"
                  [attr.data-testid]="'row-split-product-' + p.key"
                  class="flex items-center gap-2 border-b border-[#e4eaed] bg-white px-3 py-2 last:border-0"
                >
                  <button
                    *ngIf="side === 'B'"
                    type="button"
                    [attr.data-testid]="'button-move-left-' + p.key"
                    (click)="move(p, 'A')"
                    aria-label="Move to Shipment A"
                    class="flex h-6 w-6 items-center justify-center rounded text-[#45565b] hover:bg-neutral-100"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>

                  <div class="flex min-w-0 flex-1 flex-col">
                    <p class="font-body text-sm font-medium text-[#2da1cb] truncate">{{ p.sku }}</p>
                    <p class="font-body text-xs text-[#45565b] truncate">{{ p.name }}</p>
                  </div>

                  <span class="font-body text-xs text-[#45565b] whitespace-nowrap">
                    qty {{ p.qty }} · \${{ (p.qty * p.unitValue).toFixed(2) }}
                  </span>

                  <button
                    *ngIf="side === 'A'"
                    type="button"
                    [attr.data-testid]="'button-move-right-' + p.key"
                    (click)="move(p, 'B')"
                    aria-label="Move to Shipment B"
                    class="flex h-6 w-6 items-center justify-center rounded text-[#45565b] hover:bg-neutral-100"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </li>
                <li
                  *ngIf="bySide(side).length === 0"
                  class="flex flex-1 items-center justify-center px-3 py-8 text-center"
                  [attr.data-testid]="'empty-column-' + side.toLowerCase()"
                >
                  <p class="font-body text-xs italic text-[#7e97a0]">No items assigned yet</p>
                </li>
              </ul>
            </section>
          </ng-container>
        </div>

        <!-- Footer -->
        <footer class="flex items-center justify-end gap-2 border-t border-[#e4eaed] bg-white px-5 py-3">
          <button type="button" data-testid="button-cancel-split"
            (click)="cancel.emit()"
            class="h-9 rounded px-4 font-body text-sm font-medium text-[#45565b] hover:bg-neutral-100">
            Cancel
          </button>
          <button type="button" data-testid="button-confirm-split"
            (click)="onConfirm()"
            [disabled]="!canConfirm()"
            class="h-9 rounded bg-[#008572] px-4 font-body text-sm font-medium text-white transition-colors hover:bg-[#006A5A] disabled:cursor-not-allowed disabled:bg-[#b8c6cc]">
            Confirm Split
          </button>
        </footer>
      </div>
    </div>
  `,
})
export class SplitShipmentModalComponent implements OnChanges {
  @Input({ required: true }) products: ShipmentProduct[] = [];
  @Input({ required: true }) shipmentId = '';
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  readonly SIDES: Side[] = ['A', 'B'];
  assigned = signal<AssignedProduct[]>([]);

  readonly canConfirm = computed(() => {
    const items = this.assigned();
    return items.some(p => p.side === 'A') && items.some(p => p.side === 'B');
  });

  get idA(): string { return `${this.shipmentId} - 1`; }
  get idB(): string { return `${this.shipmentId} - 2`; }

  ngOnChanges() {
    this.assigned.set(this.products.map((p, i) => ({ ...p, side: 'A' as Side, key: i })));
  }

  bySide(side: Side): AssignedProduct[] {
    return this.assigned().filter(p => p.side === side);
  }

  move(p: AssignedProduct, to: Side): void {
    this.assigned.update(prev => prev.map(x => x.key === p.key ? { ...x, side: to } : x));
  }

  onConfirm(): void {
    if (this.canConfirm()) this.confirm.emit();
  }
}
