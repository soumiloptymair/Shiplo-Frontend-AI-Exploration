import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, TOAST_DURATION_MS, ToastPayload } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (t of toasts(); track t.id) {
      <div
        role="status"
        aria-live="polite"
        data-testid="toast-notification"
        class="fixed right-8 top-8 z-[100] flex min-h-[84px] w-[384px] items-start overflow-hidden rounded-[4px] bg-[#2e7d32] pl-4 pr-2 pt-[14px] pb-[18px] shadow-[0px_3px_5px_-1px_rgba(0,0,0,0.20),0px_6px_10px_0px_rgba(0,0,0,0.14),0px_1px_18px_0px_rgba(0,0,0,0.12)]">

        <!-- Check icon (24x24) -->
        <div class="flex shrink-0 items-start py-px pr-3">
          <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.6L6.6 12.4l1.4-1.4 2.8 2.8 5.6-5.6 1.4 1.4-7 7Z"/>
          </svg>
        </div>

        <!-- Text -->
        <div class="flex min-w-0 flex-1 flex-col gap-1 pt-[2px] pr-2">
          <p class="font-['Roboto',sans-serif] text-[14px] leading-[1.43] text-white break-words"
             data-testid="text-toast-message">{{ t.message }}</p>
          @if (t.detail) {
            <p class="font-['Roboto',sans-serif] text-[13px] leading-[1.43] text-white/85 break-words"
               data-testid="text-toast-detail">{{ t.detail }}</p>
          }
        </div>

        <!-- Close button -->
        <button type="button"
                aria-label="Dismiss notification"
                (click)="svc.dismiss()"
                data-testid="button-toast-dismiss"
                class="flex shrink-0 items-center justify-center rounded-full p-[3px] text-white transition-colors hover:bg-white/15">
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"/>
          </svg>
        </button>

        <!-- Auto-dismiss progress: re-keyed by id so each new toast restarts the animation -->
        <div class="absolute bottom-0 left-0 h-[4px] bg-[#c2e4c3] toast-progress"
             [attr.data-toast-id]="t.id"
             [attr.key]="t.id"
             data-testid="bar-toast-progress"></div>
      </div>
    }
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
export class ToastComponent {
  readonly svc = inject(ToastService);
  readonly toasts = computed<ToastPayload[]>(() => {
    const t = this.svc.toast();
    return t ? [t] : [];
  });
}
