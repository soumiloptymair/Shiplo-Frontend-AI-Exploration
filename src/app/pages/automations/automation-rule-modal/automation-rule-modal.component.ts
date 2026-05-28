import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ACTION_FIELDS,
  Action,
  AutomationRule,
  CONDITION_FIELDS,
  Condition,
  ConditionMatch,
  EvaluationResult,
  FieldDef,
  OPERATORS,
  OperatorKey,
  SAMPLE_TEST_SHIPMENTS,
} from '../../../core/models/automation.model';
import { AutomationService } from '../../../core/services/automation.service';

/**
 * Builder modal for creating or editing one automation rule.
 * Pixel-faithful to Figma `Assignment Rules_02`–`_12` (file unEpC0FcuWKbB5yO1m7OyX).
 *
 * Layout: 820px-wide white modal centered over a 70%-black backdrop. Header
 * holds the title + close (x). Body has the Match All/Any toggle above two
 * symmetric columns ("If this is true" / "Then take these actions") separated
 * by a circular → arrow. Footer: Cancel + green save CTA + optional Test rule.
 */
@Component({
  selector: 'app-automation-rule-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './automation-rule-modal.component.html',
})
export class AutomationRuleModalComponent {
  @Input() initialRule: AutomationRule | null = null;
  @Output() save = new EventEmitter<Omit<AutomationRule, 'id' | 'createdOn' | 'createdBy'>>();
  @Output() cancel = new EventEmitter<void>();

  private readonly svc = inject(AutomationService);

  readonly OPERATORS = OPERATORS;
  readonly CONDITION_FIELDS = CONDITION_FIELDS;
  readonly ACTION_FIELDS = ACTION_FIELDS;
  readonly SAMPLES = SAMPLE_TEST_SHIPMENTS;

  conditionMatch = signal<ConditionMatch>('all');
  conditions = signal<Condition[]>([blankCondition()]);
  actions = signal<Action[]>([blankAction()]);
  name = signal<string>('Untitled rule');

  /** Which row+side dropdown is currently open: e.g. `c0:field`, `a1:value`. null = none open. */
  openPicker = signal<string | null>(null);
  pickerSearch = signal<string>('');

  /** Test panel state (collapsed by default — opens via "Test rule" footer button). */
  testOpen = signal(false);
  testResult = signal<EvaluationResult | null>(null);
  testShipmentId = signal<string>(SAMPLE_TEST_SHIPMENTS[0].id);

  readonly isEdit = computed(() => !!this.initialRule);

  ngOnInit() {
    if (this.initialRule) {
      this.name.set(this.initialRule.name);
      this.conditionMatch.set(this.initialRule.conditionMatch);
      this.conditions.set(this.initialRule.conditions.map((c) => ({ ...c })));
      this.actions.set(this.initialRule.actions.map((a) => ({ ...a })));
    }
  }

  // ---- Field / operator lookup ---------------------------------------
  conditionField(key: string): FieldDef | undefined { return this.svc.conditionField(key); }
  actionField(key: string): FieldDef | undefined { return this.svc.actionField(key); }

  // ---- Picker open/close ---------------------------------------------
  togglePicker(key: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.openPicker.update((cur) => (cur === key ? null : key));
    this.pickerSearch.set('');
  }
  closePicker() {
    this.openPicker.set(null);
  }

  // ---- Mutations ------------------------------------------------------
  setConditionField(idx: number, key: string) {
    this.conditions.update((rows) => {
      const next = [...rows];
      const field = this.svc.conditionField(key);
      const firstOp = field?.operators[0] ?? 'is';
      next[idx] = { ...next[idx], fieldKey: key, operator: firstOp, value: defaultValueFor(field) };
      return next;
    });
    this.closePicker();
  }
  setConditionOperator(idx: number, op: OperatorKey) {
    this.conditions.update((rows) => {
      const next = [...rows];
      next[idx] = { ...next[idx], operator: op };
      return next;
    });
    this.closePicker();
  }
  setConditionValue(idx: number, value: Condition['value']) {
    this.conditions.update((rows) => {
      const next = [...rows];
      next[idx] = { ...next[idx], value };
      return next;
    });
  }
  pickConditionValue(idx: number, value: string) {
    this.setConditionValue(idx, value);
    this.closePicker();
  }
  toggleConditionMulti(idx: number, value: string) {
    this.conditions.update((rows) => {
      const next = [...rows];
      const cur = Array.isArray(next[idx].value) ? [...(next[idx].value as string[])] : [];
      const i = cur.indexOf(value);
      if (i >= 0) cur.splice(i, 1); else cur.push(value);
      next[idx] = { ...next[idx], value: cur };
      return next;
    });
  }

  addCondition() {
    this.conditions.update((rows) => [...rows, blankCondition()]);
  }
  removeCondition(idx: number) {
    this.conditions.update((rows) => rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);
  }

  setActionField(idx: number, key: string) {
    this.actions.update((rows) => {
      const next = [...rows];
      const field = this.svc.actionField(key);
      next[idx] = { ...next[idx], fieldKey: key, operator: 'is', value: defaultValueFor(field) };
      return next;
    });
    this.closePicker();
  }
  setActionOperator(idx: number, op: OperatorKey) {
    this.actions.update((rows) => {
      const next = [...rows];
      next[idx] = { ...next[idx], operator: op };
      return next;
    });
    this.closePicker();
  }
  setActionValue(idx: number, value: Action['value']) {
    this.actions.update((rows) => {
      const next = [...rows];
      next[idx] = { ...next[idx], value };
      return next;
    });
  }
  pickActionValue(idx: number, value: string) {
    this.setActionValue(idx, value);
    this.closePicker();
  }
  addAction() {
    this.actions.update((rows) => [...rows, blankAction()]);
  }
  removeAction(idx: number) {
    this.actions.update((rows) => rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);
  }

  // ---- Save / cancel --------------------------------------------------
  /** Conditions and actions must each have a field + value for save to enable. */
  readonly canSave = computed(() => {
    const conds = this.conditions();
    const acts = this.actions();
    const condsValid = conds.length > 0 && conds.every((c) => !!c.fieldKey && hasValue(c.value));
    const actsValid = acts.length > 0 && acts.every((a) => !!a.fieldKey && hasValue(a.value));
    return condsValid && actsValid;
  });

  onCancel() { this.cancel.emit(); }

  onSave() {
    if (!this.canSave()) return;
    const payload: Omit<AutomationRule, 'id' | 'createdOn' | 'createdBy'> = {
      name: this.name() || 'Untitled rule',
      enabled: this.initialRule?.enabled ?? true,
      conditionMatch: this.conditionMatch(),
      conditions: this.conditions().map((c) => ({ ...c })),
      actions: this.actions().map((a) => ({ ...a })),
    };
    this.save.emit(payload);
  }

  // ---- Test rule ------------------------------------------------------
  toggleTest() {
    this.testOpen.update((v) => !v);
    if (this.testOpen()) this.runTest();
  }
  runTest() {
    const sample = SAMPLE_TEST_SHIPMENTS.find((s) => s.id === this.testShipmentId());
    if (!sample) return;
    // Build an in-memory "rule under construction" trace by temporarily evaluating it.
    const draft: AutomationRule = {
      id: 'draft',
      name: this.name() || 'Untitled rule',
      enabled: true,
      conditionMatch: this.conditionMatch(),
      conditions: this.conditions(),
      actions: this.actions(),
      createdBy: '',
      createdOn: '',
    };
    // Evaluate against just the draft + fallback (do not contaminate the service rules).
    const fallback = this.svc.defaultFallback();
    const tempSvc = new AutomationService();
    tempSvc.rules.set([draft]);
    tempSvc.setFallback(fallback);
    this.testResult.set(tempSvc.evaluate(sample));
  }

  // ---- Picker dropdown helpers ---------------------------------------
  filteredFields(fields: FieldDef[]): FieldDef[] {
    const q = this.pickerSearch().trim().toLowerCase();
    if (!q) return fields;
    return fields.filter((f) => f.label.toLowerCase().includes(q));
  }

  /** Display string for the Value chip. */
  valueDisplay(value: Condition['value']): string {
    if (value === null || value === undefined || value === '') return 'Value';
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'Value';
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    return String(value);
  }

  /** Coerces a raw input string into a number (or null for empty) for numeric value fields. */
  onNumberInput(idx: number, raw: string) {
    const trimmed = (raw ?? '').toString().trim();
    this.setConditionValue(idx, trimmed === '' ? null : Number(trimmed));
  }

  trackById(_i: number, row: { id: string }) { return row.id; }

  /** "Carrier: UPS, Service: Priority" — used in the Test panel summary. */
  getActionSummary(): string {
    const res = this.testResult();
    if (!res) return '';
    return res.matchedActions
      .map((a) => `${this.actionField(a.fieldKey)?.label ?? a.fieldKey}: ${this.valueDisplay(a.value)}`)
      .join(', ');
  }
}

function blankCondition(): Condition {
  return { id: `c-${rid()}`, fieldKey: '', operator: 'is', value: null };
}
function blankAction(): Action {
  return { id: `a-${rid()}`, fieldKey: '', operator: 'is', value: null };
}
function rid(): string { return Math.random().toString(36).slice(2, 10); }
function defaultValueFor(field?: FieldDef): Condition['value'] {
  if (!field) return null;
  switch (field.valueKind) {
    case 'number': return null;
    case 'multi': return [];
    case 'boolean': return true;
    default: return null;
  }
}
function hasValue(v: Condition['value']): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'number') return !Number.isNaN(v);
  return true;
}
