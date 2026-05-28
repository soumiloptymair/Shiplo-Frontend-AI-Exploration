/**
 * Carrier packaging configuration model used by Settings → Defaults → Packaging.
 *
 * Backed by the in-memory `PackagingService` — values reset on reload.
 */

export type PackagingType =
  | 'Bag'
  | 'Box'
  | 'Bubble mailer'
  | 'Carton'
  | 'Envelope'
  | 'Foil'
  | 'Tubes'
  | 'Custom';

export const PACKAGING_TYPES: PackagingType[] = [
  'Bag',
  'Box',
  'Bubble mailer',
  'Carton',
  'Envelope',
  'Foil',
  'Tubes',
  'Custom',
];

export interface PackagingConfig {
  id: string;
  name: string;
  type: PackagingType;
  /** Inches */
  length: number;
  /** Inches */
  width: number;
  /** Inches */
  height: number;
  /** Packaging / tare weight, lb */
  tareWeight: number;
  /** Maximum weight allowed, lb */
  maxWeight: number;
  /** Cost in USD */
  cost: number;
  enabled: boolean;
}

export type PackagingConfigInsert = Omit<PackagingConfig, 'id'>;
