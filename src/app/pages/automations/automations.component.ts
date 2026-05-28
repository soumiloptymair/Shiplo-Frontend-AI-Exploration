import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';
import { AutomationService } from '../../core/services/automation.service';
import {
  Action,
  AutomationRule,
  CONDITION_FIELDS,
  Condition,
  DefaultFallback,
  OPERATORS,
} from '../../core/models/automation.model';
import { AutomationRuleModalComponent } from './automation-rule-modal/automation-rule-modal.component';
import { ToastService } from '../../core/services/toast.service';

/**
 * LTL Automation Rules listing page.
 *
 * Pixel-faithful to Figma `Assignment Rules_01` (file unEpC0FcuWKbB5yO1m7OyX,
 * node 23008-79297). Single white panel inside `AppShell`:
 *   - 68px Title Bar (icon + "Automation Rules" + Search + Filters + Add Rule)
 *   - Two-row table header (Rule [If/Then split] | Created by | Created on)
 *   - Rule rows render the IF and THEN chip strips side-by-side, then user
 *     pill, date, and a 3-dot row menu (Edit / Duplicate / Move / Disable /
 *     Delete).
 *   - Default Fallback card sits below the table.
 *
 * Builder modal is mounted conditionally via `*ngIf="modalOpen()"`.
 */
@Component({
  selector: 'app-automations',
  standalone: true,
  imports: [CommonModule, FormsModule, AppShellComponent, AutomationRuleModalComponent],
  templateUrl: './automations.component.html',
})
export class AutomationsComponent {
  readonly svc = inject(AutomationService);
  private readonly toastSvc = inject(ToastService);

  readonly OPERATORS = OPERATORS;
  readonly CONDITION_FIELDS = CONDITION_FIELDS;

  search = signal<string>('');
  modalOpen = signal<boolean>(false);
  editing = signal<AutomationRule | null>(null);
  /** Id of the row whose ⋮ menu is open. */
  openMenuId = signal<string | null>(null);
  /** Id of the rule pending a delete confirmation, or null when no prompt is open. */
  pendingDeleteId = signal<string | null>(null);

  fallbackDraft = signal<DefaultFallback>({ ...this.svc.defaultFallback() });
  fallbackEditing = signal<boolean>(false);
  /** Collapsed (true) hides the body of the Default Fallback card. */
  fallbackCollapsed = signal<boolean>(false);

  /** Search filter across rule name + chip labels. */
  readonly filtered = computed<AutomationRule[]>(() => {
    const q = this.search().trim().toLowerCase();
    const rows = this.svc.rules();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [
        r.name,
        ...r.conditions.map((c) => this.svc.conditionField(c.fieldKey)?.label ?? ''),
        ...r.actions.map((a) => this.svc.actionField(a.fieldKey)?.label ?? ''),
        ...r.actions.map((a) => String(a.value ?? '')),
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  });

  @HostListener('document:click')
  onDocClick() {
    this.openMenuId.set(null);
  }

  // ---- Modal open/save ------------------------------------------------
  openCreate() {
    this.editing.set(null);
    this.modalOpen.set(true);
  }
  openEdit(rule: AutomationRule, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
    this.editing.set(rule);
    this.modalOpen.set(true);
  }
  closeModal() {
    this.modalOpen.set(false);
    this.editing.set(null);
  }
  onSave(payload: Omit<AutomationRule, 'id' | 'createdOn' | 'createdBy'>) {
    if (this.editing()) {
      const merged: AutomationRule = { ...this.editing()!, ...payload };
      this.svc.updateRule(merged);
      this.toastSvc.show('Rule has been updated');
    } else {
      this.svc.addRule(payload);
      this.toastSvc.show('Rule has been added');
    }
    this.closeModal();
  }

  // ---- Row menu actions ----------------------------------------------
  toggleMenu(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.update((cur) => (cur === id ? null : id));
  }
  duplicate(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
    this.svc.duplicateRule(id);
    this.toastSvc.show('Rule duplicated');
  }
  toggleEnabled(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
    this.svc.toggleEnabled(id);
  }
  /** Opens the inline delete confirmation modal; actual deletion runs in `confirmDelete`. */
  remove(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
    this.pendingDeleteId.set(id);
  }
  confirmDelete() {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.svc.deleteRule(id);
    this.pendingDeleteId.set(null);
    this.toastSvc.show('Rule deleted');
  }
  cancelDelete() {
    this.pendingDeleteId.set(null);
  }
  /** Name of the rule pending deletion, for the confirmation prompt copy. */
  pendingDeleteName(): string {
    const id = this.pendingDeleteId();
    return id ? (this.svc.rules().find((r) => r.id === id)?.name ?? '') : '';
  }

  toggleFallbackCollapsed() {
    this.fallbackCollapsed.update((v) => !v);
  }
  moveUp(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
    this.svc.moveRule(id, -1);
  }
  moveDown(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
    this.svc.moveRule(id, 1);
  }

  // ---- Fallback -------------------------------------------------------
  startEditFallback() {
    this.fallbackDraft.set({ ...this.svc.defaultFallback() });
    this.fallbackEditing.set(true);
  }
  saveFallback() {
    this.svc.setFallback(this.fallbackDraft());
    this.fallbackEditing.set(false);
    this.toastSvc.show('Default fallback updated');
  }
  cancelFallback() {
    this.fallbackEditing.set(false);
  }
  setFallbackCarrier(v: string) {
    this.fallbackDraft.update((f) => ({ ...f, carrier: v }));
  }
  setFallbackService(v: string) {
    this.fallbackDraft.update((f) => ({ ...f, service: v }));
  }

  // ---- Chip helpers ---------------------------------------------------
  /** Pretty-print a condition value for chip rendering. Arrays join with comma. */
  formatValue(c: Condition | Action): string {
    const field = this.svc.conditionField(c.fieldKey) ?? this.svc.actionField(c.fieldKey);
    const v = c.value;
    if (v === null || v === undefined || v === '') return '—';
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'number' && field?.unit) {
      const unit = field.unit === '$' ? '' : ` ${field.unit}`;
      const prefix = field.unit === '$' ? '$' : '';
      return `${prefix}${v}${unit}`;
    }
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    return String(v);
  }

  fieldLabel(c: Condition | Action): string {
    return this.svc.conditionField(c.fieldKey)?.label ?? this.svc.actionField(c.fieldKey)?.label ?? c.fieldKey;
  }

  /** Two-letter user initials for the pill (e.g. "Abrams, Abe" → "AA"). */
  initials(name: string): string {
    return name
      .split(/[ ,]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? '')
      .join('');
  }

  /** Is this action's value a carrier name we have a logo glyph for? */
  carrierGlyph(a: Action): string {
    const v = String(a.value ?? '');
    const map: Record<string, string> = {
      UPS: '🟫',
      FedEx: '🟪',
      USPS: '🟦',
      DHL: '🟨',
      XPO: '🟥',
      'Old Dominion': '🟩',
      Saia: '🟧',
    };
    return map[v] ?? '';
  }

  /** Truncates chip strips with "N more..." when there are more than 4 chips. */
  visibleChips<T>(rows: T[], max = 4): T[] {
    return rows.slice(0, max);
  }
  hiddenChipCount<T>(rows: T[], max = 4): number {
    return Math.max(0, rows.length - max);
  }

  trackById(_i: number, row: { id: string }) { return row.id; }
}
