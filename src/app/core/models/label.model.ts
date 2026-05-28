/**
 * Label reference fields shown on Settings → Defaults → Label.
 *
 * System references are seeded from Figma `27302:169958`; merchants can add
 * custom references that map order/shipment data to label print fields.
 */

export interface LabelReference {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  /** Built-in Shiplo fields cannot be deleted. */
  isSystem: boolean;
}

export type LabelReferenceInsert = Pick<LabelReference, 'name' | 'description'>;
