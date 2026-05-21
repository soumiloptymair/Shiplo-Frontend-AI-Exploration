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
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BOX_SIZE_OPTIONS,
  CARRIER_ACCOUNT_OPTIONS,
  CARRIER_ADDONS,
  CARRIER_OPTIONS,
  CarrierAddOn,
  CarrierName,
  CarrierRateOption,
  FREIGHT_TYPE_OPTIONS,
  FreightTypeOption,
  LABEL_FORMAT_OPTIONS,
  LabelFormat,
  NewShipmentCustomer,
  NewShipmentDraft,
  NewShipmentLabel,
  NewShipmentSummary,
  PACKAGE_TYPE_OPTIONS,
  PICKUP_WINDOW_OPTIONS,
  PackageTypeOption,
  PickupWindow,
  SAMPLE_CARRIER_RATES,
  SAMPLE_PRODUCT_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  ServiceType,
  ShipmentTypeChoice,
  WAREHOUSE_OPTIONS,
  WarehouseName,
  WIZARD_STEPS,
  WizardStepNum,
  blankDraft,
  blankItem,
} from '../../../core/models/new-shipment.model';
import { ShipmentService } from '../../../core/services/shipment.service';
import { Shipment } from '../../../core/models/shipment.model';
import {
  AddressSuggestion,
  UspsService,
  UspsValidatedAddress,
} from '../../../core/services/usps.service';

/** Field keys that gate Step 2 — used for touched/error tracking. */
export type CustomerFieldKey =
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'street1'
  | 'country'
  | 'city'
  | 'state'
  | 'postalCode';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './new-shipment-modal.component.html',
})
export class NewShipmentModalComponent implements AfterViewInit, OnDestroy, OnInit {
  @Output() close = new EventEmitter<void>();
  /** Emitted when the user clicks "Save as Quote". Parent persists the draft. */
  @Output() saveAsQuote = new EventEmitter<NewShipmentDraft>();
  /** Optional draft to seed the wizard with (used when reopening a saved quote). */
  @Input() initialDraft?: NewShipmentDraft;
  @ViewChild('dialogRoot') dialogRoot?: ElementRef<HTMLElement>;

  private readonly shipmentService = inject(ShipmentService);
  private readonly uspsService = inject(UspsService);

  /** Set of Step-2 fields the user has interacted with (blurred). */
  readonly touchedFields = signal<ReadonlySet<CustomerFieldKey>>(new Set());
  /** True once the user has attempted to leave Step 2 — forces all errors visible. */
  readonly submitAttempted = signal<boolean>(false);

  /** Address typeahead state — drives the dropdown under Address Line 1. */
  readonly addressSuggestions = signal<readonly AddressSuggestion[]>([]);
  readonly addressLoading = signal<boolean>(false);
  readonly addressDropdownOpen = signal<boolean>(false);

  /**
   * Confirm-address card state machine:
   *   idle          → not enough info yet, or user is still editing
   *   validating    → request in flight
   *   matched       → server matches what user typed; auto-confirmed
   *   needs-confirm → server has a recommendation that differs; show card
   *   confirmed     → user picked one and pressed Confirm
   *   failed        → upstream error; don't block the user
   */
  readonly addressConfirmState = signal<
    'idle' | 'validating' | 'matched' | 'needs-confirm' | 'confirmed' | 'failed'
  >('idle');
  readonly addressRecommended = signal<UspsValidatedAddress | null>(null);
  readonly addressConfirmChoice = signal<'entered' | 'recommended'>('entered');
  /** Snapshot of inputs the last completed validation was run against. */
  private addressConfirmSnapshot = '';

  private addressLookupTimer: ReturnType<typeof setTimeout> | null = null;
  private addressLookupSeq = 0;
  private addressConfirmTimer: ReturnType<typeof setTimeout> | null = null;
  private addressConfirmSeq = 0;
  private zipLookupTimer: ReturnType<typeof setTimeout> | null = null;
  private lastZipLookup = '';

  /** Element that held focus before the modal opened; restored on close. */
  private previouslyFocused: HTMLElement | null = null;

  readonly STEPS = WIZARD_STEPS;
  readonly FREIGHT_TYPES = FREIGHT_TYPE_OPTIONS;
  readonly PACKAGE_TYPES = PACKAGE_TYPE_OPTIONS;
  readonly BOX_SIZES = BOX_SIZE_OPTIONS;
  readonly PRODUCT_OPTIONS = SAMPLE_PRODUCT_OPTIONS;
  readonly CARRIER_RATES = SAMPLE_CARRIER_RATES;
  readonly CARRIER_ADDONS = CARRIER_ADDONS;
  readonly WAREHOUSES = WAREHOUSE_OPTIONS;
  readonly CARRIERS = CARRIER_OPTIONS;
  readonly SERVICE_TYPES = SERVICE_TYPE_OPTIONS;

  // ---- Step 3 rate-shop filter / sort state -----------------------------
  readonly carrierFilter = signal<CarrierName | 'All'>('All');
  readonly serviceFilter = signal<ServiceType | 'All'>('All');
  readonly rateSort      = signal<'lowest' | 'fastest'>('lowest');
  readonly LABEL_FORMATS = LABEL_FORMAT_OPTIONS;
  readonly PICKUP_WINDOWS = PICKUP_WINDOW_OPTIONS;
  /** US state two-letter codes for the Receiver State select (Figma 27004-11049). */
  readonly US_STATES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
    'VA','WA','WV','WI','WY',
  ] as const;

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
    // Street typing triggers the typeahead; clear it when the user blanks the input.
    if (key === 'street1' && typeof value === 'string') {
      this.scheduleAddressLookup(value);
    }
    // ZIP → City/State autofill (debounced).
    if (key === 'postalCode' && typeof value === 'string') {
      this.scheduleZipAutofill(value);
    }
    // Any address-field edit invalidates a prior confirmation and requeues validation.
    if (key === 'street1' || key === 'street2' || key === 'city' ||
        key === 'state'   || key === 'postalCode') {
      this.scheduleAddressConfirm();
    }
  }

  /** Inputs feed raw `string` values; this trampoline keeps the template terse. */
  onCustomerInput(key: keyof NewShipmentCustomer, evt: Event) {
    const target = evt.target as HTMLInputElement | HTMLSelectElement;
    this.setCustomerField(key, target.value as never);
  }

  /** Track which fields the user has interacted with (blur). */
  markCustomerTouched(key: CustomerFieldKey) {
    if (this.touchedFields().has(key)) return;
    const next = new Set(this.touchedFields());
    next.add(key);
    this.touchedFields.set(next);
  }

  /**
   * Map of customer field → human-readable error, recomputed on every
   * draft change. Empty string means the field is valid.
   */
  readonly customerErrors = computed<Record<CustomerFieldKey, string>>(() => {
    const c = this.draft().customer;
    const e: Record<CustomerFieldKey, string> = {
      firstName: '', lastName: '', phone: '',
      street1: '', country: '', city: '', state: '', postalCode: '',
    };
    if (!c.firstName.trim()) e.firstName = 'First name is required.';
    if (!c.lastName.trim())  e.lastName  = 'Last name is required.';
    const digits = c.phone.replace(/\D/g, '');
    if (!c.phone.trim())       e.phone = 'Phone number is required.';
    else if (digits.length < 7) e.phone = 'Enter a valid phone number.';
    if (!c.street1.trim()) e.street1 = 'Address line 1 is required.';
    if (!c.country.trim()) e.country = 'Country is required.';
    if (!c.city.trim())    e.city    = 'City is required.';
    if (!c.state.trim())   e.state   = 'State is required.';
    const zipDigits = c.postalCode.replace(/\D/g, '');
    if (!c.postalCode.trim()) e.postalCode = 'Zip code is required.';
    else if (zipDigits.length !== 5) e.postalCode = 'Enter a 5-digit zip code.';
    return e;
  });

  /** Should the error message for `field` be visible right now? */
  shouldShowError(field: CustomerFieldKey): boolean {
    if (!this.customerErrors()[field]) return false;
    return this.submitAttempted() || this.touchedFields().has(field);
  }

  /** Helper for the template — true if the field is in an error state. */
  hasError(field: CustomerFieldKey): boolean {
    return this.shouldShowError(field);
  }

  // ------------------------------------------------------------
  // USPS address autofill + validation
  // ------------------------------------------------------------

  /** Debounce ZIP → city/state autofill. Fires once ZIP is 5 digits. */
  private scheduleZipAutofill(rawZip: string) {
    if (this.zipLookupTimer) clearTimeout(this.zipLookupTimer);
    const zip = rawZip.replace(/\D/g, '').slice(0, 5);
    if (zip.length !== 5 || zip === this.lastZipLookup) return;
    this.zipLookupTimer = setTimeout(() => this.lookupZip(zip), 350);
  }

  private lookupZip(zip: string) {
    this.lastZipLookup = zip;
    this.uspsService.safeCityState(zip).subscribe((res) => {
      if (!res) return;
      this.draft.update((d) => ({
        ...d,
        customer: {
          ...d.customer,
          // Only fill blank fields so we don't overwrite the user's edits.
          city:  d.customer.city.trim()  ? d.customer.city  : (res.city  ?? ''),
          state: d.customer.state.trim() ? d.customer.state : (res.state ?? ''),
        },
      }));
      // City/state may have just become filled — kick off Confirm-Address validation.
      this.scheduleAddressConfirm();
    });
  }

  // --- Address typeahead --------------------------------------------------

  /** Debounce typeahead requests so we don't hammer the proxy per keystroke. */
  private scheduleAddressLookup(raw: string) {
    // Any input change supersedes outstanding requests, regardless of length.
    if (this.addressLookupTimer) clearTimeout(this.addressLookupTimer);
    this.addressLookupTimer = null;
    const seq = ++this.addressLookupSeq;
    const q = raw.trim();
    if (q.length < 3) {
      this.addressSuggestions.set([]);
      this.addressDropdownOpen.set(false);
      this.addressLoading.set(false);
      return;
    }
    this.addressDropdownOpen.set(true);
    this.addressLoading.set(true);
    this.addressLookupTimer = setTimeout(() => {
      this.uspsService.autocomplete(q).subscribe((rows) => {
        // Ignore results from stale, superseded requests.
        if (seq !== this.addressLookupSeq) return;
        this.addressSuggestions.set(rows);
        this.addressLoading.set(false);
      });
    }, 300);
  }

  /** Apply a typeahead suggestion to the draft and close the dropdown. */
  selectAddressSuggestion(s: AddressSuggestion) {
    this.draft.update((d) => ({
      ...d,
      customer: {
        ...d.customer,
        street1: s.street1 || d.customer.street1,
        city:    s.city    || d.customer.city,
        state:   s.state   || d.customer.state,
        postalCode: s.zip  || d.customer.postalCode,
      },
    }));
    this.markCustomerTouched('street1');
    if (s.city)  this.markCustomerTouched('city');
    if (s.state) this.markCustomerTouched('state');
    if (s.zip)   this.markCustomerTouched('postalCode');
    this.closeAddressDropdown();
    // Picking a suggestion fills 4 required fields — kick off validation.
    this.scheduleAddressConfirm();
  }

  /** "Enter address manually" — closes the typeahead and hands control back. */
  closeAddressDropdown() {
    if (this.addressLookupTimer) clearTimeout(this.addressLookupTimer);
    this.addressLookupTimer = null;
    // Bump the seq so any in-flight HTTP response is also discarded.
    this.addressLookupSeq++;
    this.addressDropdownOpen.set(false);
    this.addressSuggestions.set([]);
    this.addressLoading.set(false);
  }

  /**
   * Escape inside the street1 combobox should dismiss only the dropdown — not
   * the whole modal. Stops the document-level Esc handler from firing.
   */
  onStreetEscape(evt: Event) {
    if (this.addressDropdownOpen()) {
      evt.stopPropagation();
      this.closeAddressDropdown();
    }
  }

  /** Close the dropdown when the input loses focus to anything outside it. */
  onStreetBlur() {
    this.markCustomerTouched('street1');
    // Defer so a click on a <li> still fires `selectAddressSuggestion` first.
    setTimeout(() => this.closeAddressDropdown(), 120);
  }

  /** Re-open the dropdown on focus when there are stashed suggestions to show. */
  reopenAddressDropdownIfPopulated() {
    if (this.addressSuggestions().length > 0) {
      this.addressDropdownOpen.set(true);
    }
  }

  // --- Confirm-address card ----------------------------------------------

  /**
   * Debounced auto-validate. Fires once all four required address fields
   * are populated (5-digit zip), and only when the input differs from the
   * last validated snapshot. Shows a Confirm Address card when the server's
   * standardized version differs from what the user typed.
   */
  private scheduleAddressConfirm() {
    if (this.addressConfirmTimer) clearTimeout(this.addressConfirmTimer);
    this.addressConfirmTimer = null;
    // Any edit invalidates a prior confirmation immediately.
    if (this.addressConfirmState() === 'confirmed' ||
        this.addressConfirmState() === 'matched') {
      this.addressConfirmState.set('idle');
    }
    const c = this.draft().customer;
    const zip = c.postalCode.replace(/\D/g, '').slice(0, 5);
    if (!c.street1.trim() || !c.city.trim() || !c.state.trim() || zip.length !== 5) {
      // Not enough to validate — drop any in-flight result.
      this.addressConfirmSeq++;
      this.addressConfirmState.set('idle');
      this.addressRecommended.set(null);
      return;
    }
    const snap = `${c.street1.trim()}|${c.street2.trim()}|${c.city.trim()}|${c.state.trim()}|${zip}`;
    if (snap === this.addressConfirmSnapshot &&
        this.addressConfirmState() !== 'idle') {
      return; // already validated this exact input
    }
    const seq = ++this.addressConfirmSeq;
    this.addressConfirmTimer = setTimeout(() => {
      this.addressConfirmState.set('validating');
      this.uspsService
        .validate({
          street1: c.street1.trim(),
          street2: c.street2.trim() || undefined,
          city:    c.city.trim(),
          state:   c.state.trim(),
          zip,
        })
        .subscribe({
          next: (res) => {
            if (seq !== this.addressConfirmSeq) return;
            this.addressConfirmSnapshot = snap;
            this.addressRecommended.set(res);
            if (this.recommendedMatchesEntered(res)) {
              this.addressConfirmState.set('matched');
              this.addressConfirmChoice.set('entered');
            } else {
              this.addressConfirmState.set('needs-confirm');
              this.addressConfirmChoice.set('entered');
            }
          },
          error: () => {
            if (seq !== this.addressConfirmSeq) return;
            // No match / upstream error — don't gate the user.
            this.addressConfirmSnapshot = snap;
            this.addressRecommended.set(null);
            this.addressConfirmState.set('failed');
          },
        });
    }, 600);
  }

  /** Compare server-standardized result against the user's typed address. */
  private recommendedMatchesEntered(r: UspsValidatedAddress): boolean {
    const c = this.draft().customer;
    const norm = (s: string) => s.trim().toUpperCase().replace(/\s+/g, ' ');
    const enteredZip = c.postalCode.replace(/\D/g, '').slice(0, 5);
    return (
      norm(r.street1)        === norm(c.street1) &&
      norm(r.street2 ?? '')  === norm(c.street2) &&
      norm(r.city)           === norm(c.city) &&
      norm(r.state)          === norm(c.state) &&
      r.zip                  === enteredZip
    );
  }

  /** Pick between the entered version and the server's recommendation. */
  setAddressChoice(choice: 'entered' | 'recommended') {
    this.addressConfirmChoice.set(choice);
  }

  /** Apply the picked address and dismiss the card. */
  confirmAddress() {
    const r = this.addressRecommended();
    if (this.addressConfirmChoice() === 'recommended' && r) {
      this.draft.update((d) => ({
        ...d,
        customer: {
          ...d.customer,
          street1:    r.street1,
          street2:    r.street2 ?? d.customer.street2,
          city:       r.city,
          state:      r.state,
          postalCode: r.zipPlus4 ? `${r.zip}-${r.zipPlus4}` : r.zip,
        },
      }));
      // Reset the snapshot so the (now-applied) recommended address is what
      // a fresh validation would compare against — no re-prompt loop.
      const c = this.draft().customer;
      const zip = c.postalCode.replace(/\D/g, '').slice(0, 5);
      this.addressConfirmSnapshot =
        `${c.street1.trim()}|${c.street2.trim()}|${c.city.trim()}|${c.state.trim()}|${zip}`;
    }
    this.addressConfirmState.set('confirmed');
  }

  /** Clear all address fields and reset the card. */
  resetAddress() {
    if (this.addressConfirmTimer) clearTimeout(this.addressConfirmTimer);
    this.addressConfirmTimer = null;
    this.addressConfirmSeq++;
    this.draft.update((d) => ({
      ...d,
      customer: {
        ...d.customer,
        street1: '', street2: '', city: '', state: '', postalCode: '',
      },
    }));
    this.addressConfirmSnapshot = '';
    this.addressRecommended.set(null);
    this.addressConfirmState.set('idle');
    this.addressConfirmChoice.set('entered');
  }

  /** Multi-line display tokens for the "What you entered" card. */
  readonly enteredAddressLines = computed(() => {
    const c = this.draft().customer;
    return this.diffTokenize(
      this.formatAddressLines(c.street1, c.street2, c.city, c.state, c.postalCode, c.country),
      this.recommendedAddressLinesRaw(),
    );
  });

  /** Multi-line display tokens for the "Recommended" card. */
  readonly recommendedAddressLines = computed(() => {
    const r = this.addressRecommended();
    if (!r) return [] as string[][];
    return this.diffTokenize(
      this.recommendedAddressLinesRaw(),
      this.formatAddressLines(
        this.draft().customer.street1,
        this.draft().customer.street2,
        this.draft().customer.city,
        this.draft().customer.state,
        this.draft().customer.postalCode,
        this.draft().customer.country,
      ),
    );
  });

  private recommendedAddressLinesRaw(): string[] {
    const r = this.addressRecommended();
    if (!r) return [];
    const zip = r.zipPlus4 ? `${r.zip}-${r.zipPlus4}` : r.zip;
    return this.formatAddressLines(
      r.street1, r.street2 ?? '', r.city, r.state, zip,
      this.draft().customer.country,
    );
  }

  private formatAddressLines(
    street1: string, street2: string, city: string,
    state: string, zip: string, country: string,
  ): string[] {
    const line1 = [street1, street2].filter((s) => s && s.trim()).join(', ');
    const line2 = `${city}, ${state}, ${zip}`;
    return [line1, line2, country].filter((s) => s && s.trim());
  }

  /**
   * Produce `[[token, ...], ...]` where each token is the original word
   * (commas preserved) suffixed with `\0` if it doesn't appear in `other`.
   * The template splits on that marker to apply the yellow highlight.
   */
  private diffTokenize(self: string[], other: string[]): string[][] {
    const otherTokens = new Set(
      other.flatMap((line) => line.split(/\s+/)).map((t) => t.toUpperCase()),
    );
    return self.map((line) =>
      line.split(/\s+/).map((t) =>
        otherTokens.has(t.toUpperCase()) ? t : `${t}\0`,
      ),
    );
  }

  /**
   * True while the user must wait on (or resolve) the Confirm Address card.
   * Blocks Continue while a request is in flight, while a recommendation is
   * awaiting the user's choice, and when validation outright failed (the
   * red "Invalid address" variant — user must Reset or edit to proceed).
   */
  readonly addressBlocksContinue = computed(() => {
    const s = this.addressConfirmState();
    return s === 'needs-confirm' || s === 'validating' || s === 'failed';
  });

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
  // Step 3 — Carrier & Add Ons mutators
  // ============================================================

  setCarrierRate(rateId: string) {
    this.draft.update((d) => {
      const rate = this.CARRIER_RATES.find((r) => r.id === rateId);
      // When swapping carriers, reset the account selection so the user picks
      // one that actually belongs to the new carrier.
      const account =
        rate && d.carrier.account &&
        (CARRIER_ACCOUNT_OPTIONS[rate.carrier] ?? []).includes(d.carrier.account)
          ? d.carrier.account
          : '';
      return { ...d, carrier: { ...d.carrier, rateId, account } };
    });
  }

  setCarrierAccount(account: string) {
    this.draft.update((d) => ({ ...d, carrier: { ...d.carrier, account } }));
    this.openPicker.set(null);
  }

  setWarehouse(warehouse: WarehouseName) {
    this.draft.update((d) => ({ ...d, carrier: { ...d.carrier, warehouse } }));
    this.openPicker.set(null);
  }

  setCarrierFilter(c: CarrierName | 'All') {
    this.carrierFilter.set(c);
    this.openPicker.set(null);
    this.clearHiddenRateSelection();
  }

  setServiceFilter(s: ServiceType | 'All') {
    this.serviceFilter.set(s);
    this.openPicker.set(null);
    this.clearHiddenRateSelection();
  }

  /**
   * If the currently selected rate is filtered out, drop it so the user
   * doesn't end up paying for a service they can no longer see on screen.
   */
  private clearHiddenRateSelection() {
    const id = this.draft().carrier.rateId;
    if (!id) return;
    const stillVisible = this.filteredRates().some((r) => r.id === id);
    if (!stillVisible) {
      this.draft.update((d) => ({ ...d, carrier: { ...d.carrier, rateId: '', account: '' } }));
    }
  }

  setRateSort(s: 'lowest' | 'fastest') {
    this.rateSort.set(s);
    this.openPicker.set(null);
  }

  /** Rates after Carrier + Est Delivery filters and current sort. */
  readonly filteredRates = computed<CarrierRateOption[]>(() => {
    const c = this.carrierFilter();
    const s = this.serviceFilter();
    let list = this.CARRIER_RATES.filter(
      (r) => (c === 'All' || r.carrier === c) && (s === 'All' || r.serviceType === s),
    );
    // "Lowest" = ascending price; "Fastest" pushes Next Day → 2 Day → 3 Day → Ground → Economy.
    if (this.rateSort() === 'lowest') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else {
      const rank: Record<ServiceType, number> = {
        'Next Day': 0, '2 Day': 1, '3 Day': 2, 'Ground': 3, 'Economy': 4,
      };
      list = [...list].sort((a, b) => rank[a.serviceType] - rank[b.serviceType] || a.price - b.price);
    }
    return list;
  });

  /** Receiver postal code echoed in the "Shipping to" read-only field. */
  readonly shippingToZip = computed(() => this.draft().customer.postalCode || '—');

  toggleAddOn(key: CarrierAddOn['key']) {
    this.draft.update((d) => ({
      ...d,
      carrier: {
        ...d.carrier,
        addOns: { ...d.carrier.addOns, [key]: !d.carrier.addOns[key] },
      },
    }));
  }

  selectedRate = computed<CarrierRateOption | undefined>(() =>
    this.CARRIER_RATES.find((r) => r.id === this.draft().carrier.rateId),
  );

  /** Accounts available for the currently selected carrier (empty until a rate is picked). */
  carrierAccountOptions = computed<string[]>(() => {
    const rate = this.selectedRate();
    return rate ? CARRIER_ACCOUNT_OPTIONS[rate.carrier] ?? [] : [];
  });

  /**
   * Add-on cost. The Add-Ons UI was removed from Step 3 (Figma 27004-12245),
   * so users can no longer see or edit these flags. Zero out the cost here to
   * avoid invisible charges from a restored saved-quote draft that still has
   * legacy add-on flags set. The flags themselves stay in the draft for
   * back-compat with quote round-tripping.
   */
  addOnTotal = computed<number>(() => 0);

  // ============================================================
  // Step 4 — Label & Pickup mutators
  // ============================================================

  setLabelFormat(format: LabelFormat) {
    this.draft.update((d) => ({ ...d, label: { ...d.label, format } }));
  }

  toggleSchedulePickup() {
    this.draft.update((d) => ({
      ...d,
      label: { ...d.label, schedulePickup: !d.label.schedulePickup },
    }));
  }

  setPickupDate(value: string) {
    this.draft.update((d) => ({ ...d, label: { ...d.label, pickupDate: value } }));
  }

  setPickupWindow(value: PickupWindow) {
    this.draft.update((d) => ({ ...d, label: { ...d.label, pickupWindow: value } }));
    this.openPicker.set(null);
  }

  setLabelField(field: keyof NewShipmentLabel, value: string) {
    this.draft.update((d) => ({ ...d, label: { ...d.label, [field]: value } as NewShipmentLabel }));
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
    const ratePrice = this.selectedRate()?.price ?? 0;
    const shipmentCost = ratePrice + this.addOnTotal();
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
    // On Step 2 a click with errors should reveal all of them at once.
    if (this.currentStep() === 2 && !this.canContinue()) {
      this.submitAttempted.set(true);
      return;
    }
    if (!this.canContinue()) return;
    const n = this.currentStep();
    if (n < 4) {
      // Reset the just-completed step's "submit attempted" state.
      if (n === 2) this.submitAttempted.set(false);
      this.currentStep.set((n + 1) as WizardStepNum);
    } else {
      this.submit();
    }
  }

  /**
   * Build a `Shipment` from the wizard draft and hand it to `ShipmentService.addShipment`.
   * The new row appears at the top of the grid as a Pending shipment so the user sees
   * their work persist immediately.
   */
  private submit() {
    const d = this.draft();
    const s = this.summary();
    const rate = this.selectedRate();
    const ts = Date.now();
    const idSuffix = ts.toString(36);
    const shipmentLabel = `#NEW-${ts}`;

    const products = d.details.items
      .filter((it) => it.productSku)
      .map((it) => {
        const p = this.productFor(it.productSku);
        return {
          sku: p?.sku ?? it.productSku,
          name: p?.name ?? it.productSku,
          qty: it.quantity,
          unitValue: p?.unitValue ?? 0,
        };
      });

    const shipment: Shipment = {
      id: `s-new-${idSuffix}`,
      shipmentId: shipmentLabel,
      freightType: d.details.freightType || '',
      orderRefId: shipmentLabel,
      orderRefKind: d.details.shipmentType === 'return' ? 'return' : 'order',
      status: 'Pending',
      createdOn: this.formatToday(),
      value: this.fmt(s.total),
      source: 'Manual entry',
      warehouse: d.carrier.warehouse || 'KS Fulfilment center',
      shipping: rate ? `${rate.carrier} ${rate.service}` : 'To be assigned',
      method: d.label.schedulePickup ? 'Pickup' : 'Standard',
      customer: 'New Customer',
      tags: [],
      products,
      materials: { ...d.details.materials },
    };

    this.shipmentService.addShipment(shipment);
    this.requestClose();
  }

  private formatToday(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}/${dd}/${d.getFullYear()}`;
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
    const errors = this.customerErrors();
    if (Object.values(errors).some((m) => m)) return false;
    const email = this.draft().customer.email.trim();
    // Email stays optional per Figma; if present, must look like an email.
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    // Block until the recommended-vs-entered card is resolved.
    if (this.addressBlocksContinue()) return false;
    return true;
  });

  /** Toggle the "This is a residential address" checkbox. */
  toggleResidential() {
    this.draft.update((d) => ({
      ...d,
      customer: { ...d.customer, residential: !d.customer.residential },
    }));
  }

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
    // Drop any pending debounce timers and invalidate in-flight responses so
    // they can't update destroyed signals.
    if (this.addressLookupTimer)  clearTimeout(this.addressLookupTimer);
    if (this.addressConfirmTimer) clearTimeout(this.addressConfirmTimer);
    if (this.zipLookupTimer)      clearTimeout(this.zipLookupTimer);
    this.addressLookupSeq++;
    this.addressConfirmSeq++;
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
