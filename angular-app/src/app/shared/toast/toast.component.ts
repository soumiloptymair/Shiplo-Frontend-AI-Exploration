import { Component, ChangeDetectionStrategy, inject, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../core/services/inventory.service';

const TOAST_DURATION_MS = 4000;

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="svc.toast() as t"
      class="fixed right-6 top-6 z-50 flex w-[368px] items-start overflow-hidden rounded-[4px] bg-[#2e7d32] pt-4 pb-6 px-4 shadow-[0px_1px_5px_0px_rgba(0,0,0,0.12),0px_2px_2px_0px_rgba(0,0,0,0.14),0px_3px_1px_-2px_rgba(0,0,0,0.20)]"
      role="status"
      data-testid="toast-notification">

      <!-- Icon container: 24x24, pr-12 -->
      <div class="flex items-start py-px pr-3 shrink-0">
        <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.6L6.6 12.4l1.4-1.4 2.8 2.8 5.6-5.6 1.4 1.4-7 7Z"/>
        </svg>
      </div>

      <!-- Text -->
      <div class="flex flex-1 min-w-0 flex-col gap-1 pt-1 overflow-hidden">
        <p class="font-['Roboto',sans-serif] text-[14px] leading-[1.43] text-white break-words"
           data-testid="text-toast-title">{{ t.title }}</p>
        <p *ngIf="t.message"
           class="font-['Roboto',sans-serif] text-[13px] leading-[1.43] text-white/85 break-words"
           data-testid="text-toast-message">{{ t.message }}</p>
      </div>

      <!-- Close button: pl-16, 20x20 icon with 3px padding -->
      <div class="flex items-start overflow-hidden pl-4 shrink-0">
        <button type="button"
                class="flex items-center justify-center rounded-full p-[3px] text-white hover:bg-white/15"
                (click)="svc.dismissToast()"
                data-testid="button-toast-dismiss"
                aria-label="Dismiss">
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"/>
          </svg>
        </button>
      </div>

      <!-- Bottom progress accent: 6px tall, animates from full to 0 over toast lifetime -->
      <div class="absolute bottom-0 left-0 h-[6px] bg-[#c2e4c3] toast-progress"
           data-testid="bar-toast-progress"></div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
    @keyframes toast-shrink { from { width: 100%; } to { width: 0%; } }
    .toast-progress {
      width: 100%;
      animation: toast-shrink ${TOAST_DURATION_MS}ms linear forwards;
    }
  `],
})
export class ToastComponent implements OnDestroy {
  readonly svc = inject(InventoryService);

  constructor() {
    effect(() => {
      void this.svc.toast();
    });
  }

  ngOnDestroy(): void {}
}
