import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';
import { WithdrawModalComponent, WithdrawResult } from './withdraw-modal/withdraw-modal.component';

export type TxType =
  | 'Withdrawal'
  | 'Label Debit'
  | 'Deposit'
  | 'Refund'
  | 'Adjustment';

export type TxStatus =
  | 'Initiated'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Voided'
  | 'Declined'
  | 'Scheduled'
  | 'Refunded'
  | 'Cancelled'
  | 'Needs Review'
  | 'Approved'
  | 'Denied';

export interface WalletTx {
  id: string;
  type: TxType;
  status: TxStatus;
  date: string;
  txnId: string;
  shipmentId?: string;
  labelId?: string;
  carrier?: string;
  amount: number;
  balance: number;
}

export interface FundingMethod {
  id: string;
  kind: 'card' | 'bank';
  label: string;
  mask: string;
}

const STATUS_CLASS: Record<TxStatus, string> = {
  Initiated:    'bg-[#cee8f4]',
  Processing:   'bg-[#cee8f4]',
  Scheduled:    'bg-[#cee8f4]',
  Completed:    'bg-[#daeec4]',
  Refunded:     'bg-[#daeec4]',
  Approved:     'bg-[#daeec4]',
  Failed:       'bg-[#fde2d4]',
  Voided:       'bg-[#fde2d4]',
  Declined:     'bg-[#fde2d4]',
  Denied:       'bg-[#fde2d4]',
  Cancelled:    'bg-[#fde2d4]',
  'Needs Review': 'bg-[#ffeac0]',
};

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, AppShellComponent, WithdrawModalComponent],
  templateUrl: './wallet.component.html',
})
export class WalletComponent {
  readonly transactions = signal<WalletTx[]>(SEED_TXNS);

  // Single source of truth: most recent (top) row's running balance.
  readonly balance = computed(() => this.transactions()[0]?.balance ?? 0);

  readonly fundingMethods = signal<FundingMethod[]>([
    { id: 'm1', kind: 'card', label: 'Credit Card', mask: '**** **** **** 4878' },
    { id: 'm2', kind: 'card', label: 'Credit Card', mask: '**** **** **** 1234' },
    { id: 'm3', kind: 'bank', label: 'Bank Account', mask: '**** **** **** 6786' },
  ]);

  readonly autoTopup = signal({
    enabled: true,
    threshold: 10,
    topup: 200,
    fundingMaskShort: '**** 4878',
    maxPerDay: 3,
  });

  readonly dateRange = signal<'Last 30 days' | 'Last 7 days' | 'This year'>('Last 30 days');
  readonly search = signal('');

  readonly withdrawOpen = signal(false);
  readonly toast = signal<string | null>(null);
  readonly dateMenuOpen = signal(false);

  readonly filteredTxns = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.transactions();
    return this.transactions().filter(t =>
      t.txnId.toLowerCase().includes(q) ||
      (t.shipmentId ?? '').toLowerCase().includes(q) ||
      (t.labelId ?? '').toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q));
  });

  statusClass(s: TxStatus): string { return STATUS_CLASS[s]; }

  formatMoney(n: number): string {
    const sign = n < 0 ? '- ' : n > 0 ? '+ ' : '';
    const abs = Math.abs(n).toFixed(2);
    return `${sign}$${abs}`;
  }

  amountColor(n: number): string {
    if (n > 0) return 'text-[#198754]';
    if (n < 0) return 'text-[#0b1516]';
    return 'text-[#0b1516]';
  }

  onSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }

  openWithdraw() { if (this.balance() > 0) this.withdrawOpen.set(true); }
  closeWithdraw() { this.withdrawOpen.set(false); }

  toggleDateMenu(ev: Event) {
    ev.stopPropagation();
    this.dateMenuOpen.update(v => !v);
  }
  pickDateRange(r: 'Last 30 days' | 'Last 7 days' | 'This year') {
    this.dateRange.set(r);
    this.dateMenuOpen.set(false);
  }
  closeMenus() { this.dateMenuOpen.set(false); }

  confirmWithdraw(result: WithdrawResult) {
    const newBalance = +(this.balance() - result.amount).toFixed(2);
    const row: WalletTx = {
      id: `w-${Date.now()}`,
      type: 'Withdrawal',
      status: 'Initiated',
      date: new Date().toLocaleString('en-US', {
        month: '2-digit', day: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).replace(',', ''),
      txnId: '#' + Math.floor(20230000000000 + Math.random() * 9_999_999_999).toString(),
      amount: -result.amount,
      balance: newBalance,
    };
    this.transactions.update(list => [row, ...list]);
    this.withdrawOpen.set(false);
    this.toast.set('Withdrawal initiated');
    setTimeout(() => this.toast.set(null), 4000);
  }

  dismissToast() { this.toast.set(null); }
  toggleAutoTopup() {
    const v = this.autoTopup();
    this.autoTopup.set({ ...v, enabled: !v.enabled });
  }
  cancelWithdrawal(id: string) {
    this.transactions.update(list => list.map(t =>
      t.id === id && t.type === 'Withdrawal' && t.status === 'Initiated'
        ? { ...t, status: 'Cancelled' as TxStatus }
        : t));
  }
}

function seedDate(i: number): string {
  const d = new Date(2026, 0, 15 - (i % 5));
  const hh = (10 + (i % 6)).toString().padStart(2, '0');
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${(d.getFullYear() % 100).toString().padStart(2, '0')}, ${hh}:00 AM`;
}

const SEED_TXNS: WalletTx[] = (() => {
  const list: WalletTx[] = [];
  let balance = 300.00;
  const push = (t: Omit<WalletTx, 'id' | 'balance'>) => {
    balance = +(balance + t.amount).toFixed(2);
    list.push({ ...t, id: `t-${list.length + 1}`, balance });
  };
  push({ type: 'Label Debit', status: 'Initiated', date: seedDate(1), txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount: -36.12 });
  push({ type: 'Label Debit', status: 'Initiated', date: seedDate(2), txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount: -36.12 });
  push({ type: 'Label Debit', status: 'Initiated', date: seedDate(2), txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount: -36.12 });
  push({ type: 'Deposit', status: 'Completed', date: seedDate(2), txnId: '#20230101180003', amount: 140.00 });
  push({ type: 'Refund', status: 'Initiated', date: seedDate(2), txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount: 36.12 });
  push({ type: 'Adjustment', status: 'Completed', date: seedDate(2), txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount: -5.32 });
  push({ type: 'Label Debit', status: 'Initiated', date: seedDate(2), txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount: -36.12 });
  push({ type: 'Label Debit', status: 'Initiated', date: seedDate(2), txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount: -36.12 });
  push({ type: 'Label Debit', status: 'Initiated', date: seedDate(2), txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount: -36.12 });
  push({ type: 'Label Debit', status: 'Initiated', date: seedDate(2), txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount: -36.12 });
  push({ type: 'Label Debit', status: 'Initiated', date: seedDate(2), txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount: -36.12 });
  return list.reverse();
})();
