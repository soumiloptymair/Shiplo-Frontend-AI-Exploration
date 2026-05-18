import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-sync-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="svc.syncing()"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      data-testid="dialog-sync-overlay">
      <div
        class="w-[489px] rounded-lg bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        data-testid="dialog-sync">
        <h2 class="font-['Montserrat',sans-serif] text-[18px] font-semibold text-[#0b1516]">
          Syncing Products
        </h2>

        <div class="mt-5">
          <div class="font-['Roboto',sans-serif] text-[12px] font-medium text-[#45565b]"
               data-testid="text-sync-percent">
            {{ svc.syncProgress() }}%
          </div>
          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#e4eaed]">
            <div
              class="h-full rounded-full bg-[#008572] transition-[width] duration-150 ease-linear"
              [style.width.%]="svc.syncProgress()"
              data-testid="progress-sync-bar"></div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            type="button"
            class="flex h-9 items-center justify-center rounded-[4px] bg-[#008572] px-4 font-['Roboto',sans-serif] text-[14px] font-medium text-white hover:bg-[#006d5e]"
            (click)="svc.cancelSync()"
            data-testid="button-cancel-sync">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SyncDialogComponent {
  readonly svc = inject(InventoryService);
}
