import { Injectable, computed, signal } from '@angular/core';
import {
  AutoTopupConfig,
  DateRangePreset,
  FundingMethod,
  WalletTransaction,
} from '../models/wallet.model';

/**
 * Wallet state for the prototype.
 *
 * The data shape and values mirror the Figma reference frame (24950:231029).
 * `balance` is derived from the running balance of the most recent transaction
 * so it stays a single source of truth — see `currentBalance()`.
 */
@Injectable({ providedIn: 'root' })
export class WalletService {
  /** Funding methods card content (Figma rows). */
  readonly fundingMethods = signal<FundingMethod[]>([
    { id: 'fm-1', kind: 'card', label: 'Credit Card',  mask: '**** **** **** 4878' },
    { id: 'fm-2', kind: 'card', label: 'Credit Card',  mask: '**** **** **** 4878' },
    { id: 'fm-3', kind: 'bank', label: 'Bank Account', mask: '**** **** **** 4878' },
  ]);

  /** Auto-topup card configuration (Figma defaults). */
  readonly autoTopup = signal<AutoTopupConfig>({
    enabled: true,
    threshold: 10,
    topup: 200,
    fundingMaskShort: '**** 4878',
    maxPerDay: 3,
  });

  /**
   * Transaction history. Sorted by date (most recent first); the first
   * transaction's `balance` is the wallet's current balance.
   *
   * Mock data mirrors the Figma frame's visible rows.
   */
  readonly transactions = signal<WalletTransaction[]>([
    { id: 't-1',  type: 'Withdrawal', status: 'Completed', date: '02/02/26, 10:00 AM', txnId: '#20230101180003',                                                              amount: -110.00, balance: 5.00 },
    { id: 't-2',  type: 'Label Debit', status: 'Initiated', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:  -36.12, balance: 35.32 },
    { id: 't-3',  type: 'Label Debit', status: 'Initiated', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:  -36.12, balance: 35.32 },
    { id: 't-4',  type: 'Label Debit', status: 'Initiated', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:  -36.12, balance: 35.32 },
    { id: 't-5',  type: 'Deposit',    status: 'Completed', date: '01/15/25, 10:00 AM', txnId: '#20230101180003',                                                              amount:  140.00, balance: 176.32 },
    { id: 't-6',  type: 'Refund',     status: 'Initiated', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:   36.12, balance: 35.32 },
    { id: 't-7',  type: 'Adjustment', status: 'Completed', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:   -5.32, balance: 35.32 },
    { id: 't-8',  type: 'Label Debit', status: 'Initiated', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:  -36.12, balance: 35.32 },
    { id: 't-9',  type: 'Label Debit', status: 'Initiated', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:  -36.12, balance: 35.32 },
    { id: 't-10', type: 'Label Debit', status: 'Initiated', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:  -36.12, balance: 35.32 },
    { id: 't-11', type: 'Label Debit', status: 'Initiated', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:  -36.12, balance: 35.32 },
    { id: 't-12', type: 'Label Debit', status: 'Initiated', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:  -36.12, balance: 35.32 },
    { id: 't-13', type: 'Label Debit', status: 'Initiated', date: '01/15/25, 10:00 AM', txnId: '#20230101180003', shipmentId: '#20230101180003', labelId: '#20230101180003', carrier: 'UPS', amount:  -36.12, balance: 35.32 },
  ]);

  /** Current balance is the running balance of the most recent transaction. */
  readonly currentBalance = computed<number>(() => {
    const txns = this.transactions();
    return txns.length ? txns[0].balance : 0;
  });

  toggleAutoTopup(): void {
    this.autoTopup.update((c) => ({ ...c, enabled: !c.enabled }));
  }

  /** Statuses for which a withdrawal may still be cancelled. */
  static readonly CANCELLABLE_WITHDRAWAL_STATUSES: ReadonlyArray<string> = [
    'Initiated',
    'Processing',
    'Scheduled',
  ];

  /**
   * Cancel a withdrawal. No-op if the row is not a Withdrawal or has already
   * settled (Completed / Failed / Voided / Cancelled / Declined). Returns
   * `true` when the cancellation was applied so callers can decide whether to
   * surface a confirmation.
   */
  cancelWithdrawal(id: string): boolean {
    const row = this.transactions().find((r) => r.id === id);
    if (
      !row ||
      row.type !== 'Withdrawal' ||
      !WalletService.CANCELLABLE_WITHDRAWAL_STATUSES.includes(row.status)
    ) {
      return false;
    }
    this.transactions.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, status: 'Cancelled' as const } : r)),
    );
    return true;
  }

  /** Whether a transaction is eligible for cancellation in the UI. */
  canCancel(t: WalletTransaction): boolean {
    return (
      t.type === 'Withdrawal' &&
      WalletService.CANCELLABLE_WITHDRAWAL_STATUSES.includes(t.status)
    );
  }
}
