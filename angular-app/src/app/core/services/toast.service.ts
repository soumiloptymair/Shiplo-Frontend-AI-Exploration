import { Injectable, signal } from '@angular/core';

export interface ToastPayload {
  /** Single-line message shown to the user. */
  message: string;
  /** Optional subtitle / supporting line. */
  detail?: string;
  /** Monotonically-increasing id so the progress bar restarts on re-fires. */
  id: number;
}

export const TOAST_DURATION_MS = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toast = signal<ToastPayload | null>(null);

  private timer: ReturnType<typeof setTimeout> | null = null;
  private nextId = 1;

  show(message: string, detail?: string): void {
    if (this.timer) clearTimeout(this.timer);
    this.toast.set({ message, detail, id: this.nextId++ });
    this.timer = setTimeout(() => {
      this.toast.set(null);
      this.timer = null;
    }, TOAST_DURATION_MS);
  }

  dismiss(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.toast.set(null);
  }
}
