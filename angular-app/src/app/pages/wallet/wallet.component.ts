import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppShellComponent } from '../../layout/app-shell/app-shell.component';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';
import { WalletService } from '../../core/services/wallet.service';
import { DateRangePreset, WalletTransaction } from '../../core/models/wallet.model';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, AppShellComponent, StatusPillComponent],
  templateUrl: './wallet.component.html',
})
export class WalletComponent {
  private readonly wallet = inject(WalletService);

  // Reactive state from service
  readonly balance        = this.wallet.currentBalance;
  readonly autoTopup      = this.wallet.autoTopup;
  readonly fundingMethods = this.wallet.fundingMethods;
  readonly transactions   = this.wallet.transactions;

  // Local UI state
  readonly search        = signal<string>('');
  readonly dateRange     = signal<DateRangePreset>('Last 30 days');
  readonly dateMenuOpen  = signal<boolean>(false);
  readonly toast         = signal<string | null>(null);

  /** Filtered transactions for the table (search across IDs + type). */
  readonly filteredTxns = computed<WalletTransaction[]>(() => {
    const q = this.search().trim().toLowerCase();
    const rows = this.transactions();
    if (!q) return rows;
    return rows.filter((t) =>
      [t.type, t.status, t.txnId, t.shipmentId, t.labelId, t.carrier]
        .filter((v): v is string => !!v)
        .some((v) => v.toLowerCase().includes(q)),
    );
  });

  // --- Toast helpers ---
  private showToast(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(null), 4000);
  }
  dismissToast(): void { this.toast.set(null); }

  // --- Filter bar handlers ---
  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }
  toggleDateMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.dateMenuOpen.update((v) => !v);
  }
  pickDateRange(range: DateRangePreset): void {
    this.dateRange.set(range);
    this.dateMenuOpen.set(false);
  }
  closeMenus(): void {
    if (this.dateMenuOpen()) this.dateMenuOpen.set(false);
  }

  // --- Card actions ---
  onWithdraw(): void {
    if (this.balance() <= 0) return;
    this.showToast('Withdrawal initiated');
  }
  onDeposit(): void {
    this.showToast('Deposit initiated');
  }
  toggleAutoTopup(): void { this.wallet.toggleAutoTopup(); }

  // --- Row actions ---
  cancelWithdrawal(id: string): void {
    this.wallet.cancelWithdrawal(id);
    this.showToast('Withdrawal cancelled');
  }

  // --- Pure formatters / mappers ---
  toneFor = StatusPillComponent.toneFor;

  formatAmount(amount: number): string {
    const sign = amount < 0 ? '- ' : amount > 0 ? '+ ' : '';
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  }
  amountClass(amount: number): string {
    if (amount > 0) return 'text-fg-positive';
    if (amount < 0) return 'text-fg-negative';
    return 'text-fg-primary';
  }

  /** Delegates to the service so UI and data layer share the same rule. */
  canCancel = (t: WalletTransaction): boolean => this.wallet.canCancel(t);
}
