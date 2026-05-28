import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitRecommendation } from '../../../core/models/shipment.model';

@Component({
  selector: 'app-split-recommendation-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      data-testid="banner-split-recommendation"
      class="relative mx-4 mb-3 rounded-md bg-[#FDE2D4] px-3 py-3"
    >
      <button
        type="button"
        aria-label="Dismiss recommendation"
        data-testid="button-dismiss-split-banner"
        (click)="dismiss.emit()"
        class="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded text-[#45565b] hover:bg-black/5"
      >
        <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div class="flex items-start gap-2 pr-6">
        <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E07B00]"></span>
        <div class="flex flex-col gap-1">
          <p
            class="font-body text-sm font-bold leading-tight text-[#0b1516]"
            data-testid="text-split-banner-title"
          >
            {{ title }}
          </p>
          <p
            class="font-body text-xs leading-snug text-[#45565b]"
            data-testid="text-split-banner-body"
          >
            {{ body }}
          </p>
        </div>
      </div>

      <button
        type="button"
        data-testid="button-split-from-banner"
        (click)="split.emit()"
        class="ml-4 mt-2 inline-flex h-7 items-center rounded-full bg-white px-3 font-body text-xs font-medium text-[#0b1516] shadow-sm hover:bg-neutral-50"
      >
        Split Shipment
      </button>
    </div>
  `,
})
export class SplitRecommendationBannerComponent {
  @Input({ required: true }) recommendation!: SplitRecommendation;
  @Output() split = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  get title(): string {
    const r = this.recommendation;
    switch (r.reason) {
      case 'low-inventory':    return `Low inventory for Product: ${r.sku}`;
      case 'faster-delivery':  return 'Faster Delivery';
      case 'lower-cost':       return 'Lower Cost';
    }
  }

  get body(): string {
    const r = this.recommendation;
    switch (r.reason) {
      case 'low-inventory':
        return `Inventory is low at ${r.warehouse}. Consider splitting this shipment for on time delivery`;
      case 'faster-delivery':
        return 'Splitting this shipment could result in a faster delivery time';
      case 'lower-cost':
        return `Splitting this shipment could save you $${r.savings.toFixed(2)}`;
    }
  }
}
