import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BOX_SIZE_OPTIONS,
  FREIGHT_TYPE_OPTIONS,
  FreightTypeOption,
  NewShipmentCustomer,
  NewShipmentDraft,
  NewShipmentSummary,
  PACKAGE_TYPE_OPTIONS,
  PackageTypeOption,
  SAMPLE_PRODUCT_OPTIONS,
  ShipmentTypeChoice,
  WIZARD_STEPS,
  WizardStepNum,
  blankDraft,
  blankItem,
} from '../../../core/models/new-shipment.model';

/**
 * "Create New Shipment" modal — foundation for User Story ES-R8.
 *
 * Layout (Figma `unEpC0FcuWKbB5yO1m7OyX` node `27004:10264`):
 *   - 1312×732 white card centered over a 70% black backdrop.
 *   - Header: title + close (×).
 *   - Body splits into three regions:
 *       1. Left rail (~190px, light-blue): vertical 4-step wizard list.
 *       2. Main content (white): renders the active step's form.
 *       3. Right rail (~220px, light-blue): live Summary panel.
 *   - Footer: Cancel on the left; Save as Quote / Back / Continue on the right.
 *
 * Only step 1 (Shipment Details) is built end-to-end. Steps 2–4 render a
 * "Coming soon" placeholder so wizard nav works without locking in their UI.
 */
@Component({
  selector: 'app-new-shipment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-shipment-modal.component.html',
})
export class NewShipmentModalComponent implements AfterViewInit, OnDestroy, OnInit {
  @Output() close = new EventEmitter<void>();
  /** Emitted when the user clicks "Save as Quote". Parent persists the draft. */
  @Output() saveAsQuote = new EventEmitter<NewShipmentDraft>();
  /** Optional draft to seed the wizard with (used when reopening a saved quote). */
  @Input() initialDraft?: NewShipmentDraft;
  @ViewChild('dialogRoot') dialogRoot?: ElementRef<HTMLElement>;

  /** Element that held focus before the modal opened; restored on close. */
  private previouslyFocused: HTMLElement | null = null;

  readonly STEPS = WIZARD_STEPS;
  readonly FREIGHT_TYPES = FREIGHT_TYPE_OPTIONS;
  readonly PACKAGE_TYPES = PACKAGE_TYPE_OPTIONS;
  readonly BOX_SIZES = BOX_SIZE_OPTIONS;
  readonly PRODUCT_OPTIONS = SAMPLE_PRODUCT_OPTIONS;

  /** Draft form state held entirely in-memory for the foundation task. */
  draft = signal<NewShipmentDraft>(blankDraft());

  /** 1-based step index (1=Shipment Details … 4=Label & Pickup). */
  currentStep = signal<WizardStepNum>(1);

  /** Tracks which custom select is open. `null` when none. */
  openPicker = signal<string | null>(null);

  // ============================================================
  // Step 1 — Shipment Details mutators
  // ============================================================

  setShipmentType(t: ShipmentTypeChoice) {
    this.draft.update((d) => ({ ...d, details: { ...d.details, shipmentType: t } }));
  }

  setFreightType(value: FreightTypeOption) {
    this.draft.update((d) => ({ ...d, details: { ...d.details, freightType: value } }));
    this.openPicker.set(null);
  }

  setItemProduct(itemId: string, sku: string) {
    this.draft.update((d) => ({
      ...d,
      details: {
        ...d.details,
        items: d.details.items.map((it) =>
          it.id === itemId ? { ...it, productSku: sku } : it,
        ),
      },
    }));
    this.openPicker.set(null);
  }

  setItemQuantity(itemId: string, raw: string | number) {
    const q = Math.max(0, Math.floor(Number(raw) || 0));
    this.draft.update((d) => ({
      ...d,
      details: {
        ...d.details,
        items: d.details.items.map((it) =>
          it.id === itemId ? { ...it, quantity: q } : it,
        ),
      },
    }));
  }

  incrementItemQty(itemId: string, delta: number) {
    this.draft.update((d) => ({
      ...d,
      details: {
        ...d.details,
        items: d.details.items.map((it) =>
          it.id === itemId
            ? { ...it, quantity: Math.max(0, it.quantity + delta) }
            : it,
        ),
      },
    }));
  }

  addItem() {
    this.draft.update((d) => ({
      ...d,
      details: { ...d.details, items: [...d.details.items, blankItem()] },
    }));
  }

  setPackageType(value: PackageTypeOption) {
    this.draft.update((d) => ({
      ...d,
      details: { ...d.details, packaging: { ...d.details.packaging, packageType: value } },
    }));
    this.openPicker.set(null);
  }

  setBoxSize(label: string) {
    this.draft.update((d) => ({
      ...d,
      details: { ...d.details, packaging: { ...d.details.packaging, boxSizeLabel: label } },
    }));
    this.openPicker.set(null);
  }

  setDimension(
    key: 'lengthIn' | 'widthIn' | 'heightIn' | 'weightLbs',
    raw: string | number,
  ) {
    const trimmed = String(raw ?? '').trim();
    const value = trimmed === '' ? null : Number(trimmed);
    this.draft.update((d) => ({
      ...d,
      details: { ...d.details, packaging: { ...d.details.packaging, [key]: value } },
    }));
  }

  bumpDimension(
    key: 'lengthIn' | 'widthIn' | 'heightIn' | 'weightLbs',
    delta: number,
  ) {
    this.draft.update((d) => {
      const cur = d.details.packaging[key] ?? 0;
      const next = Math.max(0, Number((cur + delta).toFixed(2)));
      return {
        ...d,
        details: { ...d.details, packaging: { ...d.details.packaging, [key]: next } },
      };
    });
  }

  // ============================================================
  // Step 2 — Customer Information mutators
  // ============================================================

  setCustomerField<K extends keyof NewShipmentCustomer>(
    key: K,
    value: NewShipmentCustomer[K],
  ) {
    this.draft.update((d) => ({
      ...d,
      customer: { ...d.customer, [key]: value },
    }));
  }

  /** Inputs feed raw `string` values; this trampoline keeps the template terse. */
  onCustomerInput(key: keyof NewShipmentCustomer, evt: Event) {
    const value = (evt.target as HTMLInputElement).value;
    this.setCustomerField(key, value);
  }

  toggleMaterial(key: keyof NewShipmentDraft['details']['materials']) {
    this.draft.update((d) => ({
      ...d,
      details: {
        ...d.details,
        materials: { ...d.details.materials, [key]: !d.details.materials[key] },
      },
    }));
  }

  // ============================================================
  // Lookups & helpers used in the template
  // ============================================================

  productFor(sku: string) {
    return this.PRODUCT_OPTIONS.find((p) => p.sku === sku);
  }

  itemValue(qty: number, sku: string): number {
    const p = this.productFor(sku);
    return p ? p.unitValue * qty : 0;
  }

  boxFor(label: string) {
    return this.BOX_SIZES.find((b) => b.label === label);
  }

  /** Picker open/close. `key` is e.g. `freight`, `pkgType`, `box`, `item:<id>`. */
  togglePicker(key: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.openPicker.update((cur) => (cur === key ? null : key));
  }

  // ============================================================
  // Right-rail Summary — derived live from the draft.
  // ============================================================

  summary = computed<NewShipmentSummary>(() => {
    const d = this.draft();
    const orderValue = d.details.items.reduce(
      (sum, it) => sum + this.itemValue(it.quantity, it.productSku),
      0,
    );
    const packagingCost = this.boxFor(d.details.packaging.boxSizeLabel)?.cost ?? 0;
    // Carrier pricing isn't wired up yet — leave at $0 per task scope.
    const shipmentCost = 0;
    const total = orderValue + shipmentCost + packagingCost;
    // Placeholder margin so the footer line isn't always blank.
    const profit = total > 0 ? Number((total * 0.18).toFixed(2)) : 0;
    const pkgLabel = d.details.packaging.boxSizeLabel
      ? `Box:  ${d.details.packaging.boxSizeLabel}`
      : '';
    return {
      orderValue,
      shipmentCost,
      packagingCost,
      total,
      profit,
      packagingDescription: pkgLabel,
    };
  });

  fmt(n: number): string {
    return `$${n.toFixed(2)}`;
  }

  // ============================================================
  // Wizard navigation & lifecycle
  // ============================================================

  goToStep(n: WizardStepNum) {
    this.currentStep.set(n);
  }

  back() {
    const n = this.currentStep();
    if (n > 1) this.currentStep.set((n - 1) as WizardStepNum);
  }

  continueOrSubmit() {
    if (!this.canContinue()) return;
    const n = this.currentStep();
    if (n < 4) {
      this.currentStep.set((n + 1) as WizardStepNum);
    } else {
      // Foundation: Submit just closes. Persistence is a follow-up task.
      this.requestClose();
    }
  }

  /** Used by the template to swap the rightmost button label on step 4. */
  readonly primaryLabel = computed(() => (this.currentStep() === 4 ? 'Submit' : 'Continue'));

  /**
   * Whether the Continue / Submit button is enabled for the active step.
   * Step 2 requires all contact + address fields except `company` / `street2`.
   * Other steps don't gate yet — that lands with their own task.
   */
  readonly canContinue = computed(() => {
    if (this.currentStep() !== 2) return true;
    const c = this.draft().customer;
    const required: (keyof NewShipmentCustomer)[] = [
      'name', 'email', 'phone',
      'street1', 'city', 'state', 'postalCode', 'country',
    ];
    if (!required.every((k) => c[k].trim().length > 0)) return false;
    // Minimal email shape check so obvious typos can't slip past.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email);
  });

  requestClose() {
    this.openPicker.set(null);
    this.draft.set(blankDraft());
    this.currentStep.set(1);
    this.close.emit();
  }

  /**
   * Emit the current draft for the parent to persist as a quote.
   * The parent is responsible for the toast + closing the modal.
   */
  onSaveAsQuote() {
    this.openPicker.set(null);
    this.saveAsQuote.emit(this.draft());
  }

  ngOnInit(): void {
    if (this.initialDraft) {
      // Deep-clone so editing the wizard doesn't mutate the stored quote.
      this.draft.set(JSON.parse(JSON.stringify(this.initialDraft)) as NewShipmentDraft);
    }
  }

  /** Close on Escape. */
  @HostListener('document:keydown.escape')
  onEsc() {
    this.requestClose();
  }

  /**
   * Lightweight focus trap: while the modal is mounted, Tab / Shift+Tab cycle
   * focus within the dialog root rather than escaping to background controls.
   * Implemented at the document level so picker dropdowns rendered inside the
   * dialog still participate naturally.
   */
  @HostListener('document:keydown.tab', ['$event'])
  onTab(evt: KeyboardEvent) {
    const root = this.dialogRoot?.nativeElement;
    if (!root) return;
    const focusables = this.getFocusables(root);
    if (focusables.length === 0) {
      evt.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    // If focus has somehow escaped the dialog, pull it back to the first element.
    if (!active || !root.contains(active)) {
      evt.preventDefault();
      first.focus();
      return;
    }
    if (evt.shiftKey && active === first) {
      evt.preventDefault();
      last.focus();
    } else if (!evt.shiftKey && active === last) {
      evt.preventDefault();
      first.focus();
    }
  }

  ngAfterViewInit(): void {
    this.previouslyFocused = (document.activeElement as HTMLElement) ?? null;
    // Defer so the dialog DOM is fully laid out before we grab focus.
    queueMicrotask(() => {
      const root = this.dialogRoot?.nativeElement;
      if (!root) return;
      const first = this.getFocusables(root)[0];
      first?.focus();
    });
  }

  ngOnDestroy(): void {
    // Restore focus to whatever opened the modal (typically the "+ New Shipment" button).
    this.previouslyFocused?.focus?.();
  }

  private getFocusables(root: HTMLElement): HTMLElement[] {
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),' +
      ' textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );
  }

  /** Backdrop click closes; clicks inside the dialog do not bubble. */
  onBackdrop(evt: MouseEvent) {
    // Only count clicks that originate on the backdrop element itself.
    if (evt.target === evt.currentTarget) this.requestClose();
  }

  /** Click inside the dialog should dismiss any open picker, nothing else. */
  onDialogClick() {
    this.openPicker.set(null);
  }

  trackById(_i: number, x: { id: string }) {
    return x.id;
  }
}
