/**
 * LTL Automation Rules — domain types.
 *
 * Statement-based rules with `IF (conditions) THEN (actions)`. Rule order is the
 * evaluation order (first-match-wins). Backed entirely by the in-memory
 * `AutomationService` — no server.
 */

export type ConditionMatch = 'all' | 'any';

export type OperatorKey =
  | 'is'
  | 'is_not'
  | 'gte'
  | 'lte'
  | 'gt'
  | 'lt'
  | 'eq'
  | 'between'
  | 'contains'
  | 'one_of';

export interface OperatorDef {
  key: OperatorKey;
  /** Human label shown in the dropdown ("Is", "Is not"). */
  label: string;
  /** Compact glyph shown inside row chips (">/=", "is", "is not"). */
  chipLabel: string;
}

export const OPERATORS: Record<OperatorKey, OperatorDef> = {
  is:       { key: 'is',       label: 'Is',       chipLabel: 'is' },
  is_not:   { key: 'is_not',   label: 'Is not',   chipLabel: 'is not' },
  gte:      { key: 'gte',      label: 'Greater than or equal to', chipLabel: '>/=' },
  lte:      { key: 'lte',      label: 'Less than or equal to',    chipLabel: '</=' },
  gt:       { key: 'gt',       label: 'Greater than', chipLabel: '>' },
  lt:       { key: 'lt',       label: 'Less than',    chipLabel: '<' },
  eq:       { key: 'eq',       label: 'Equals',       chipLabel: '=' },
  between:  { key: 'between',  label: 'Between',      chipLabel: 'between' },
  contains: { key: 'contains', label: 'Contains',     chipLabel: 'contains' },
  one_of:   { key: 'one_of',   label: 'One of',       chipLabel: 'one of' },
};

export type FieldGroup = 'shipment' | 'ltl' | 'location' | 'carrier' | 'inventory';

export type ValueKind = 'number' | 'select' | 'multi' | 'boolean' | 'region' | 'text';

export interface FieldDef {
  key: string;
  label: string;
  group: FieldGroup;
  valueKind: ValueKind;
  /** Unit shown after numeric values ("lbs", "$", "lb/cuft", "pallets"). */
  unit?: string;
  /** Options for select/multi/region kinds. */
  options?: string[];
  /** Operators a user can pick for this field. */
  operators: OperatorKey[];
}

/**
 * Condition operands available in the rule builder.
 * Matches the parameter dropdown in Figma node 23008-79768 (Assignment Rules_03)
 * AND the LTL-aware operands required by the business spec (AUT-LTL-01).
 */
export const CONDITION_FIELDS: FieldDef[] = [
  // Parcel / general (visible in Figma dropdown)
  { key: 'shipment_size',       label: 'Shipment Size',       group: 'shipment',  valueKind: 'select', options: ['Small', 'Medium', 'Large', 'XL'], operators: ['is', 'is_not', 'one_of'] },
  { key: 'shipment_weight',     label: 'Shipment Weight',     group: 'shipment',  valueKind: 'number', unit: 'lbs', operators: ['gte', 'lte', 'gt', 'lt', 'eq'] },
  { key: 'shipment_value',      label: 'Shipment Value',      group: 'shipment',  valueKind: 'number', unit: '$',   operators: ['gte', 'lte', 'gt', 'lt', 'eq'] },
  { key: 'shipment_materials',  label: 'Shipment Materials',  group: 'shipment',  valueKind: 'multi',  options: ['Lithium batteries', 'Hazmat', 'Fragile', 'Temp Sensitive', 'Perishable'], operators: ['is', 'is_not', 'one_of', 'contains'] },
  { key: 'delivery_location',   label: 'Delivery Location',   group: 'location',  valueKind: 'region', options: ['United States', 'Canada', 'Mexico', 'Europe'], operators: ['is', 'is_not', 'one_of'] },
  { key: 'ship_from_warehouse', label: 'Ship from Warehouse', group: 'location',  valueKind: 'select', options: ['KS Fulfilment center', 'TX Fulfilment center'], operators: ['is', 'is_not', 'one_of'] },
  { key: 'carriers',            label: 'Carriers',            group: 'carrier',   valueKind: 'select', options: ['UPS', 'FedEx', 'USPS', 'DHL'], operators: ['is', 'is_not', 'one_of'] },
  { key: 'inventory',           label: 'Inventory',           group: 'inventory', valueKind: 'text',   operators: ['contains', 'is', 'is_not'] },
  { key: 'status',              label: 'Status',              group: 'shipment',  valueKind: 'select', options: ['Pending', 'Shipped', 'Delayed', 'Delivered', 'On Hold', 'Needs Review', 'Cancelled', 'Label Created'], operators: ['is', 'is_not', 'one_of'] },

  // LTL-specific (AUT-LTL-01)
  { key: 'freight_class',       label: 'Freight Class',       group: 'ltl', valueKind: 'select', options: ['50', '55', '60', '65', '70', '77.5', '85', '92.5', '100', '110', '125', '150', '175', '200', '250', '300', '400', '500'], operators: ['is', 'is_not', 'one_of'] },
  { key: 'total_pallets',       label: 'Total Pallets',       group: 'ltl', valueKind: 'number', unit: 'pallets', operators: ['gte', 'lte', 'gt', 'lt', 'eq'] },
  { key: 'density',             label: 'Density',             group: 'ltl', valueKind: 'number', unit: 'lb/cuft', operators: ['gte', 'lte', 'gt', 'lt', 'eq'] },
  { key: 'accessorials',        label: 'Accessorial Flags',   group: 'ltl', valueKind: 'multi',  options: ['Lift gate pickup', 'Lift gate delivery', 'Inside delivery', 'Residential', 'Limited access', 'Notification'], operators: ['is', 'is_not', 'one_of', 'contains'] },
  { key: 'location_type',       label: 'Location Type',       group: 'ltl', valueKind: 'select', options: ['Residential', 'Commercial'], operators: ['is', 'is_not'] },
  { key: 'appointment_needed',  label: 'Appointment Needed',  group: 'ltl', valueKind: 'boolean', operators: ['is'] },
  { key: 'origin_region',       label: 'Origin Region',       group: 'ltl', valueKind: 'select', options: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'], operators: ['is', 'is_not', 'one_of'] },
  { key: 'destination_region',  label: 'Destination Region',  group: 'ltl', valueKind: 'select', options: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'], operators: ['is', 'is_not', 'one_of'] },
  { key: 'lane_preference',     label: 'Lane Preference',     group: 'ltl', valueKind: 'select', options: ['Direct', 'Hub', 'Cross-dock'], operators: ['is', 'is_not'] },
];

/**
 * Action operands the rule can execute when conditions match.
 * AUT-LTL-02: must include an "Assign LTL carrier" action.
 */
export const ACTION_FIELDS: FieldDef[] = [
  { key: 'carrier',     label: 'Carrier',     group: 'carrier',  valueKind: 'select', options: ['UPS', 'FedEx', 'USPS', 'DHL'], operators: ['is'] },
  { key: 'service',     label: 'Service',     group: 'carrier',  valueKind: 'select', options: ['Priority', 'Standard', 'Express 2 day', 'Ground', 'Next Day Air'], operators: ['is'] },
  { key: 'ltl_carrier', label: 'LTL Carrier', group: 'ltl',      valueKind: 'select', options: ['XPO', 'Old Dominion', 'Saia', 'YRC', 'Estes', 'R+L Carriers', 'ABF'], operators: ['is'] },
  { key: 'ltl_service', label: 'LTL Service', group: 'ltl',      valueKind: 'select', options: ['Standard LTL', 'Guaranteed', 'Volume', 'Expedited'], operators: ['is'] },
  { key: 'warehouse',   label: 'Ship from Warehouse', group: 'location', valueKind: 'select', options: ['KS Fulfilment center', 'TX Fulfilment center'], operators: ['is'] },
];

export interface Condition {
  id: string;
  fieldKey: string;
  operator: OperatorKey;
  /** number | string (select/region/text) | string[] (multi/one_of) | boolean | null. */
  value: string | number | string[] | boolean | null;
}

export interface Action {
  id: string;
  fieldKey: string;
  /** Action operator is always `is` — kept for chip rendering consistency. */
  operator: OperatorKey;
  value: string | number | string[] | boolean | null;
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  conditionMatch: ConditionMatch;
  conditions: Condition[];
  actions: Action[];
  createdBy: string;
  createdOn: string;
}

export interface DefaultFallback {
  carrier: string;
  service: string;
}

export interface EvaluationTraceEntry {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  /** Plain-language reason ("matched", "no match: Shipment Weight 200 not >/= 500", "disabled"). */
  reason: string;
}

export interface EvaluationResult {
  matchedRuleId: string | null;
  matchedActions: Action[];
  usedFallback: boolean;
  fallback?: DefaultFallback;
  trace: EvaluationTraceEntry[];
}

/** Minimal shipment shape the rule engine evaluates against. */
export interface SampleShipment {
  id: string;
  label: string;
  attrs: Record<string, string | number | string[] | boolean>;
}

export const SAMPLE_TEST_SHIPMENTS: SampleShipment[] = [
  {
    id: 'sample-1',
    label: 'Parcel — 750 lbs, Class 70, UPS, US',
    attrs: {
      shipment_weight: 750,
      shipment_value: 240,
      delivery_location: 'United States',
      ship_from_warehouse: 'KS Fulfilment center',
      carriers: 'UPS',
      status: 'Pending',
      freight_class: '70',
      total_pallets: 2,
      density: 12,
      location_type: 'Commercial',
      appointment_needed: false,
      origin_region: 'Midwest',
      destination_region: 'Northeast',
      lane_preference: 'Direct',
      accessorials: [],
    },
  },
  {
    id: 'sample-2',
    label: 'LTL — 6 pallets, Class 150, residential, Canada',
    attrs: {
      shipment_weight: 2400,
      shipment_value: 1850,
      delivery_location: 'Canada',
      ship_from_warehouse: 'TX Fulfilment center',
      status: 'Pending',
      freight_class: '150',
      total_pallets: 6,
      density: 6,
      location_type: 'Residential',
      appointment_needed: true,
      origin_region: 'Southwest',
      destination_region: 'Northeast',
      lane_preference: 'Hub',
      accessorials: ['Lift gate delivery', 'Residential'],
    },
  },
  {
    id: 'sample-3',
    label: 'Parcel — 4 lbs, Express, US',
    attrs: {
      shipment_weight: 4,
      shipment_value: 38,
      delivery_location: 'United States',
      ship_from_warehouse: 'KS Fulfilment center',
      carriers: 'FedEx',
      status: 'Pending',
      freight_class: '50',
      total_pallets: 0,
      density: 20,
      location_type: 'Residential',
      appointment_needed: false,
      origin_region: 'Midwest',
      destination_region: 'Southeast',
      lane_preference: 'Direct',
      accessorials: [],
    },
  },
];
