export type TxnType =
  | 'Withdrawal'
  | 'Deposit'
  | 'Refund'
  | 'Adjustment'
  | 'Label Debit';

export type TxnStatus =
  | 'Initiated'
  | 'Processing'
  | 'Scheduled'
  | 'Completed'
  | 'Refunded'
  | 'Approved'
  | 'Failed'
  | 'Voided'
  | 'Cancelled'
  | 'Declined'
  | 'Needs Review';

export interface WalletTransaction {
  id: string;
  type: TxnType;
  status: TxnStatus;
  /** ISO-ish display string from Figma (e.g. "01/15/25, 10:00 AM"). */
  date: string;
  txnId: string;
  shipmentId?: string;
  labelId?: string;
  carrier?: string;
  /** Signed amount in USD. Negative = debit, positive = credit. */
  amount: number;
  /** Running balance AFTER this transaction applied. */
  balance: number;
}

export type FundingMethodKind = 'card' | 'bank';

export interface FundingMethod {
  id: string;
  kind: FundingMethodKind;
  label: string;
  mask: string;
}

export interface AutoTopupConfig {
  enabled: boolean;
  /** Threshold in USD — top up when balance dips at or below this. */
  threshold: number;
  /** Amount to add when triggered. */
  topup: number;
  /** Funding method short label (e.g. "**** 4878"). */
  fundingMaskShort: string;
  maxPerDay: number;
}

export type DateRangePreset = 'Last 7 days' | 'Last 30 days' | 'This year';
