import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MergeRecommendation } from '../../../core/models/shipment.model';

@Component({
  selector: 'app-merge-recommendation-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      data-testid="banner-merge-recommendation"
      class="relative mx-4 mb-3 rounded-md bg-[#FDE2D4] px-3 py-3"
    >
      <button
        type="button"
        aria-label="Dismiss recommendation"
        data-testid="button-dismiss-merge-banner"
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
            data-testid="text-merge-banner-title"
          >
            Merge opportunity
          </p>
          <p
            class="font-body text-xs leading-snug text-[#45565b]"
            data-testid="text-merge-banner-body"
          >
            {{ body }}
          </p>
        </div>
      </div>

      <button
        type="button"
        data-testid="button-merge-from-banner"
        (click)="merge.emit()"
        class="ml-4 mt-2 inline-flex h-7 items-center rounded-full bg-white px-3 font-body text-xs font-medium text-[#0b1516] shadow-sm hover:bg-neutral-50"
      >
        Merge Shipments
      </button>
    </div>
  `,
})
export class MergeRecommendationBannerComponent {
  /** Optional explicitly-seeded copy. If absent the banner generates copy from `peerCount` + `destination`. */
  @Input() recommendation?: MergeRecommendation;
  /** Number of live merge candidates (the panel computes this off the service). Used when no `recommendation` is provided. */
  @Input() peerCount = 0;
  /** Live destination string (e.g. the ZIP). Used when no `recommendation` is provided. */
  @Input() destination = '';
  @Output() merge = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  get body(): string {
    const r = this.recommendation;
    const n = r?.peerCount ?? this.peerCount;
    const dest = r?.destination ?? this.destination;
    const peers = `${n} shipment${n === 1 ? '' : 's'}`;
    if (r?.savings != null) {
      return `Found ${peers} going to ${dest}. Merging could save you $${r.savings.toFixed(2)}.`;
    }
    return `Found ${peers} going to ${dest}. Merge them into a single shipment.`;
  }
}
