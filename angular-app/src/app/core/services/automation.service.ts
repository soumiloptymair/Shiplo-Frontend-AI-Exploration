import { Injectable, computed, signal } from '@angular/core';
import {
  ACTION_FIELDS,
  Action,
  AutomationRule,
  CONDITION_FIELDS,
  Condition,
  ConditionMatch,
  DefaultFallback,
  EvaluationResult,
  EvaluationTraceEntry,
  FieldDef,
  OPERATORS,
  OperatorKey,
  SampleShipment,
} from '../models/automation.model';

/**
 * In-memory store and evaluation engine for LTL Automation Rules.
 *
 * Persistence: lives in signals for the browser session only.
 * Evaluation: pure `evaluate(shipment)` — first-match-wins with a configurable
 * default fallback (US-AUT-04).
 */
@Injectable({ providedIn: 'root' })
export class AutomationService {
  readonly rules = signal<AutomationRule[]>(seedRules());
  readonly defaultFallback = signal<DefaultFallback>({ carrier: 'UPS', service: 'Ground' });

  readonly enabledRules = computed(() => this.rules().filter((r) => r.enabled));

  // ---- Lookups ---------------------------------------------------------
  conditionField(key: string): FieldDef | undefined {
    return CONDITION_FIELDS.find((f) => f.key === key);
  }
  actionField(key: string): FieldDef | undefined {
    return ACTION_FIELDS.find((f) => f.key === key);
  }
  operator(key: OperatorKey) {
    return OPERATORS[key];
  }

  // ---- CRUD ------------------------------------------------------------
  addRule(rule: Omit<AutomationRule, 'id' | 'createdOn' | 'createdBy'> & { createdBy?: string }): AutomationRule {
    const created: AutomationRule = {
      ...rule,
      id: `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdOn: formatDateMDY(new Date()),
      createdBy: rule.createdBy ?? 'Abrams, Abe',
    };
    this.rules.update((rs) => [...rs, created]);
    return created;
  }

  updateRule(updated: AutomationRule): void {
    this.rules.update((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
  }

  deleteRule(id: string): void {
    this.rules.update((rs) => rs.filter((r) => r.id !== id));
  }

  duplicateRule(id: string): AutomationRule | null {
    const src = this.rules().find((r) => r.id === id);
    if (!src) return null;
    const copy: AutomationRule = {
      ...src,
      id: `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${src.name} (Copy)`,
      createdOn: formatDateMDY(new Date()),
      conditions: src.conditions.map((c) => ({ ...c, id: `c-${cryptoRandom()}` })),
      actions: src.actions.map((a) => ({ ...a, id: `a-${cryptoRandom()}` })),
    };
    const idx = this.rules().findIndex((r) => r.id === id);
    this.rules.update((rs) => [...rs.slice(0, idx + 1), copy, ...rs.slice(idx + 1)]);
    return copy;
  }

  toggleEnabled(id: string): void {
    this.rules.update((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }

  moveRule(id: string, direction: -1 | 1): void {
    this.rules.update((rs) => {
      const idx = rs.findIndex((r) => r.id === id);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= rs.length) return rs;
      const next = [...rs];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  setFallback(fallback: DefaultFallback): void {
    this.defaultFallback.set({ ...fallback });
  }

  // ---- Evaluation ------------------------------------------------------
  /**
   * Evaluate `shipment` against every enabled rule in order.
   * First rule that matches wins; if none match, returns the default fallback
   * action with `usedFallback: true`. Always returns a full trace so the
   * Test panel can show which rules were considered and why.
   */
  evaluate(shipment: SampleShipment): EvaluationResult {
    const trace: EvaluationTraceEntry[] = [];
    for (const rule of this.rules()) {
      if (!rule.enabled) {
        trace.push({ ruleId: rule.id, ruleName: rule.name, matched: false, reason: 'rule is disabled' });
        continue;
      }
      const results = rule.conditions.map((c) => evaluateCondition(c, shipment));
      const matched = rule.conditionMatch === 'all' ? results.every((r) => r.matched) : results.some((r) => r.matched);
      if (matched) {
        trace.push({ ruleId: rule.id, ruleName: rule.name, matched: true, reason: 'all conditions matched' });
        return { matchedRuleId: rule.id, matchedActions: rule.actions, usedFallback: false, trace };
      }
      const firstFail = results.find((r) => !r.matched);
      trace.push({
        ruleId: rule.id,
        ruleName: rule.name,
        matched: false,
        reason: firstFail?.reason ?? 'no conditions matched',
      });
    }
    return {
      matchedRuleId: null,
      matchedActions: [],
      usedFallback: true,
      fallback: this.defaultFallback(),
      trace,
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ConditionEvalResult {
  matched: boolean;
  reason: string;
}

function evaluateCondition(c: Condition, shipment: SampleShipment): ConditionEvalResult {
  const field = CONDITION_FIELDS.find((f) => f.key === c.fieldKey);
  if (!field) return { matched: false, reason: `unknown field ${c.fieldKey}` };
  const actual = shipment.attrs[c.fieldKey];
  const op = c.operator;
  const expected = c.value;
  const label = field.label;

  if (actual === undefined || actual === null) {
    return { matched: false, reason: `${label} has no value on this shipment` };
  }

  switch (op) {
    case 'is':
      return { matched: String(actual) === String(expected), reason: `${label} is ${stringify(actual)} (expected ${stringify(expected)})` };
    case 'is_not':
      return { matched: String(actual) !== String(expected), reason: `${label} is ${stringify(actual)} (expected not ${stringify(expected)})` };
    case 'gte':
      return { matched: Number(actual) >= Number(expected), reason: `${label} ${stringify(actual)} >/= ${stringify(expected)}` };
    case 'lte':
      return { matched: Number(actual) <= Number(expected), reason: `${label} ${stringify(actual)} </= ${stringify(expected)}` };
    case 'gt':
      return { matched: Number(actual) > Number(expected), reason: `${label} ${stringify(actual)} > ${stringify(expected)}` };
    case 'lt':
      return { matched: Number(actual) < Number(expected), reason: `${label} ${stringify(actual)} < ${stringify(expected)}` };
    case 'eq':
      return { matched: Number(actual) === Number(expected), reason: `${label} ${stringify(actual)} = ${stringify(expected)}` };
    case 'between': {
      const [lo, hi] = Array.isArray(expected) ? expected.map(Number) : [NaN, NaN];
      const a = Number(actual);
      return { matched: a >= lo && a <= hi, reason: `${label} ${a} between ${lo} and ${hi}` };
    }
    case 'contains': {
      if (Array.isArray(actual)) {
        const needle = String(expected);
        return { matched: actual.map(String).includes(needle), reason: `${label} contains ${needle}` };
      }
      return { matched: String(actual).toLowerCase().includes(String(expected).toLowerCase()), reason: `${label} contains ${stringify(expected)}` };
    }
    case 'one_of': {
      const list = Array.isArray(expected) ? expected.map(String) : [String(expected)];
      return { matched: list.includes(String(actual)), reason: `${label} ${stringify(actual)} one of ${list.join(', ')}` };
    }
  }
}

function stringify(v: unknown): string {
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

function formatDateMDY(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function cryptoRandom(): string {
  return Math.random().toString(36).slice(2, 10);
}

function newCondition(fieldKey: string, operator: OperatorKey, value: Condition['value']): Condition {
  return { id: `c-${cryptoRandom()}`, fieldKey, operator, value };
}
function newAction(fieldKey: string, value: Action['value']): Action {
  return { id: `a-${cryptoRandom()}`, fieldKey, operator: 'is', value };
}

/**
 * Seed rules so the list isn't empty on first load and showcases the chip
 * rendering for both parcel and LTL operands.
 */
function seedRules(): AutomationRule[] {
  return [
    {
      id: 'r-seed-1',
      name: 'Heavy parcel → UPS Priority',
      enabled: true,
      conditionMatch: 'all',
      conditions: [
        newCondition('shipment_weight', 'gte', 500),
        newCondition('shipment_weight', 'gte', 500),
        newCondition('shipment_weight', 'gte', 500),
      ],
      actions: [
        newAction('carrier', 'UPS'),
        newAction('service', 'Priority'),
      ],
      createdBy: 'Abrams, Abe',
      createdOn: '01/15/2025',
    },
    {
      id: 'r-seed-2',
      name: 'International to Canada → On Hold',
      enabled: true,
      conditionMatch: 'all',
      conditions: [
        newCondition('delivery_location', 'is_not', 'United States'),
        newCondition('shipment_weight', 'gt', 5),
      ],
      actions: [
        newAction('ltl_carrier', 'XPO'),
      ],
      createdBy: 'Abrams, Abe',
      createdOn: '01/15/2025',
    },
    {
      id: 'r-seed-3',
      name: 'High freight class → XPO',
      enabled: true,
      conditionMatch: 'all',
      conditions: [
        newCondition('freight_class', 'one_of', ['150', '175', '200']),
        newCondition('total_pallets', 'gte', 3),
      ],
      actions: [
        newAction('ltl_carrier', 'XPO'),
        newAction('ltl_service', 'Standard LTL'),
      ],
      createdBy: 'Abrams, Abe',
      createdOn: '01/15/2025',
    },
  ];
}
