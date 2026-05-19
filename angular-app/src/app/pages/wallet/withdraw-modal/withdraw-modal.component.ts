import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FundingMethod } from '../wallet.component';

export interface WithdrawResult {
  amount: number;
  methodId: string;
  methodLabel: string;
  methodMask: string;
}

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-withdraw-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './withdraw-modal.component.html',
})
export class WithdrawModalComponent implements AfterViewInit {
  @Input({ required: true }) balance!: number;
  @Input({ required: true }) methods!: FundingMethod[];
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<WithdrawResult>();

  @ViewChild('dialogRoot', { static: true }) dialogRoot!: ElementRef<HTMLElement>;
  private previouslyFocused: HTMLElement | null = null;

  ngAfterViewInit() {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    queueMicrotask(() => {
      const first = this.dialogRoot.nativeElement.querySelector<HTMLElement>(
        'input,button:not([disabled]),[tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    });
  }

  emitCancel() {
    this.previouslyFocused?.focus?.();
    this.cancel.emit();
  }

  readonly step = signal<Step>(1);
  readonly amount = signal<string>('');
  readonly methodId = signal<string>('');
  readonly methodMenuOpen = signal(false);
  readonly otp = signal<string[]>(['', '', '', '', '', '']);

  readonly amountNumber = computed(() => {
    const n = parseFloat(this.amount());
    return isFinite(n) ? n : 0;
  });

  readonly minWithdraw = 10;

  readonly canContinue = computed(() => {
    if (this.step() === 1) {
      const n = this.amountNumber();
      return n >= this.minWithdraw && n <= this.balance && !!this.methodId();
    }
    if (this.step() === 2) return true;
    if (this.step() === 3) return this.otp().every(d => /\d/.test(d));
    return false;
  });

  ngOnInit() {
    if (this.methods.length) this.methodId.set(this.methods[0].id);
  }

  get quickPicks(): number[] {
    return [10, 50, 100, +this.balance.toFixed(2)];
  }

  get selectedMethod(): FundingMethod | null {
    return this.methods.find(m => m.id === this.methodId()) ?? null;
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.emitCancel(); }

  pickAmount(v: number) { this.amount.set(v.toFixed(2)); }
  onAmountInput(e: Event) { this.amount.set((e.target as HTMLInputElement).value); }

  toggleMethodMenu(ev: Event) {
    ev.stopPropagation();
    this.methodMenuOpen.update(v => !v);
  }
  pickMethod(id: string) {
    this.methodId.set(id);
    this.methodMenuOpen.set(false);
  }
  @HostListener('document:click')
  closeMenu() { this.methodMenuOpen.set(false); }

  next() {
    if (!this.canContinue()) return;
    if (this.step() === 3) {
      const m = this.selectedMethod;
      if (!m) return;
      this.confirm.emit({
        amount: this.amountNumber(),
        methodId: m.id,
        methodLabel: m.label,
        methodMask: m.mask,
      });
      return;
    }
    this.step.update(s => (s + 1) as Step);
  }
  back() {
    if (this.step() > 1) this.step.update(s => (s - 1) as Step);
  }

  onOtpInput(i: number, e: Event) {
    const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 1);
    this.otp.update(arr => arr.map((d, idx) => (idx === i ? v : d)));
    if (v) {
      const next = (e.target as HTMLInputElement).parentElement?.children[i + 1] as HTMLInputElement | undefined;
      next?.focus();
    }
  }

  get isInstant(): boolean { return this.selectedMethod?.kind === 'card'; }
  get fee(): number { return this.isInstant ? 0 : 1.5; }
  get totalPayout(): number { return Math.max(0, this.amountNumber() - this.fee); }
}
