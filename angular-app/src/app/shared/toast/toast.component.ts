import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="svc.toast() as t"
      class="fixed right-10 top-10 z-50 flex w-[384px] items-start gap-3 rounded-md border border-[#e4eaed] bg-white p-4 shadow-lg"
      role="status"
      data-testid="toast-notification">
      <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#008572]">
        <svg class="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <div class="font-['Roboto',sans-serif] text-[14px] font-medium text-[#0b1516]"
             data-testid="text-toast-title">{{ t.title }}</div>
        <div class="mt-0.5 font-['Roboto',sans-serif] text-[13px] text-[#45565b]"
             data-testid="text-toast-message">{{ t.message }}</div>
      </div>
      <button type="button"
              class="-mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded text-[#45565b] hover:bg-neutral-100"
              (click)="svc.dismissToast()"
              data-testid="button-toast-dismiss"
              aria-label="Dismiss">
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `,
})
export class ToastComponent {
  readonly svc = inject(InventoryService);
}
