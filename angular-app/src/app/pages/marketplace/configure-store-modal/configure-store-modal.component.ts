import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type AddressMode = 'best' | 'default' | 'unique';

export interface AddressFormValue {
  companyName: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  country: string;
  city: string;
  state: string;
  zip: string;
}

export interface ConfigureStoreFormValue {
  domainUrl: string;
  storeName: string;
  authKey: string;
  extraField: string;
  shipFromMode: AddressMode;
  shipFromAddress: AddressFormValue;
  returnMode: AddressMode;
  returnAddress: AddressFormValue;
  labelSize: string;
  labelCopies: number;
  packingSlip: string;
  packingCopies: number;
  bolName: string;
  bolCopies: number;
  notes: string;
}

interface Step {
  num: number;
  title: string;
  subtitle: string;
}

const STEPS: Step[] = [
  { num: 1, title: 'Connect Account',    subtitle: 'Auth, Signup' },
  { num: 2, title: 'Shipping Accounts',  subtitle: 'Carrier, Account, Warehouses' },
  { num: 3, title: 'Warehouse Settings', subtitle: 'Default, Codes, Groups' },
  { num: 4, title: 'Addresses',          subtitle: 'Ship From, Returns' },
  { num: 5, title: 'Extras',             subtitle: 'Printer, Attachments, Notes' },
];

function emptyAddress(): AddressFormValue {
  return {
    companyName: '', phone: '', email: '',
    line1: '', line2: '',
    country: 'United States', city: '', state: '', zip: '',
  };
}

@Component({
  selector: 'app-configure-store-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configure-store-modal.component.html',
})
export class ConfigureStoreModalComponent implements AfterViewInit {
  @Input() brand = '';
  @Input() storeTitle: string | null = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<ConfigureStoreFormValue>();
  @Output() confirm = new EventEmitter<ConfigureStoreFormValue>();
  @ViewChild('firstField') firstField?: ElementRef<HTMLInputElement>;

  readonly STEPS = STEPS;

  readonly currentStep = signal(1);
  readonly completedSteps = signal<Set<number>>(new Set());

  // Step 1 — Connect Account
  readonly domainUrl = signal('');
  readonly storeName = signal('');
  readonly authKey = signal('');
  readonly extraField = signal('');

  // Step 2 — Shipping Accounts (visual model: a couple of pre-seeded tabs)
  readonly shippingTabs = signal<string[]>([
    'UPS- Default UPS Account Name',
    'UPS-Default Acc..',
    'Amazon-Defau..',
  ]);
  readonly activeShippingTab = signal(0);
  readonly carrier = signal('UPS');
  readonly carrierAccountName = signal('Default UPS Account Name');
  readonly selectedWarehouses = signal<string[]>(['NJ Fulfilment Center', 'PA Fulfilment Center']);
  readonly shippingMethodMode = signal<'include' | 'exclude'>('include');
  readonly selectedShippingMethods = signal<string[]>([
    'Amazon Large Media Delivery (US)',
    'Amazon One-Day Delivery',
    'Amazon Premium Air Delivery (US)',
    'Amazon Bulk Delivery (US)',
    'Amazon Parcel Delivery (US)',
  ]);

  // Step 3 — Warehouse Settings
  readonly warehouses = signal<Array<{ name: string; code: string; carriers: string[] }>>([
    { name: 'Warehouse Name 1', code: 'ABCD', carriers: ['UPS', 'Chip'] },
    { name: 'Warehouse Name 2', code: 'PQRI', carriers: ['UPS', 'Chip'] },
    { name: 'Warehouse Name 3', code: 'MHYS', carriers: ['UPS', 'Chip'] },
  ]);
  readonly warehouseGroups = signal<Array<{ name: string; destinations: string; warehouses: string; fallback: string }>>([
    { name: 'Group Name',    destinations: '8 States', warehouses: '4 Warehouses', fallback: 'NJ Fulfilment Center' },
    { name: 'North America', destinations: '4 States', warehouses: '4 Warehouses', fallback: 'Default' },
  ]);
  readonly groupEditing = signal(false);

  // Step 4 — Addresses
  readonly shipFromMode = signal<AddressMode>('best');
  readonly shipFromUseCompanyName = signal(false);
  readonly shipFromAddress = signal<AddressFormValue>(emptyAddress());
  readonly returnMode = signal<AddressMode>('best');
  readonly returnUseCompanyName = signal(false);
  readonly returnAddress = signal<AddressFormValue>(emptyAddress());

  // Step 5 — Extras
  readonly labelSize = signal('Standard 4x6');
  readonly labelCopies = signal(1);
  readonly packingSlip = signal('Default Name');
  readonly packingCopies = signal(1);
  readonly bolName = signal('Default Name');
  readonly bolCopies = signal(1);
  readonly attachments = signal<Array<{ name: string; uploaded: string }>>([
    { name: 'FileName.csv', uploaded: '02/12/2026 • 14:45 CT' },
  ]);
  readonly notes = signal('');

  readonly isFirstStep = computed(() => this.currentStep() === 1);
  readonly isLastStep  = computed(() => this.currentStep() === STEPS.length);

  readonly modalTitle = computed(() => {
    if (this.storeTitle) return `Configure Store: ${this.storeTitle}`;
    const step = this.currentStep();
    return step >= 3 && step <= 3 ? 'Configure Store' : (this.brand ? `Configure Store: ${this.brand}` : 'Configure Store');
  });

  ngAfterViewInit() {
    queueMicrotask(() => this.firstField?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.cancel.emit(); }

  setStr(sig: ReturnType<typeof signal<string>>, ev: Event) {
    sig.set((ev.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value);
  }

  setNum(sig: ReturnType<typeof signal<number>>, ev: Event) {
    const v = Number((ev.target as HTMLInputElement).value);
    if (!isNaN(v) && v >= 1) sig.set(v);
  }

  incCopies(sig: ReturnType<typeof signal<number>>, delta: number) {
    const next = sig() + delta;
    if (next >= 1) sig.set(next);
  }

  updateAddress(
    sig: ReturnType<typeof signal<AddressFormValue>>,
    field: keyof AddressFormValue,
    ev: Event,
  ) {
    const value = (ev.target as HTMLInputElement | HTMLSelectElement).value;
    sig.update(a => ({ ...a, [field]: value }));
  }

  removeWarehouseChip(name: string) {
    this.selectedWarehouses.update(list => list.filter(w => w !== name));
  }

  removeShippingMethod(name: string) {
    this.selectedShippingMethods.update(list => list.filter(m => m !== name));
  }

  selectShippingTab(i: number) { this.activeShippingTab.set(i); }
  addShippingTab() {
    const next = this.shippingTabs().length + 1;
    this.shippingTabs.update(list => [...list, `New Account ${next}`]);
    this.activeShippingTab.set(this.shippingTabs().length - 1);
  }

  startAddGroup() { this.groupEditing.set(true); }
  cancelAddGroup() { this.groupEditing.set(false); }
  confirmAddGroup() {
    this.warehouseGroups.update(list => [
      { name: 'New Group', destinations: '0 States', warehouses: '0 Warehouses', fallback: 'Default' },
      ...list,
    ]);
    this.groupEditing.set(false);
  }

  goBack() {
    const c = this.currentStep();
    if (c > 1) this.currentStep.set(c - 1);
  }

  goContinue() {
    const c = this.currentStep();
    this.completedSteps.update(set => {
      const next = new Set(set);
      next.add(c);
      return next;
    });
    if (c < STEPS.length) this.currentStep.set(c + 1);
  }

  isCompleted(step: number): boolean {
    return this.completedSteps().has(step);
  }

  onSaveDraft() {
    this.saveDraft.emit(this.collectValue());
  }

  onConnect() {
    // Mark all steps complete on submit
    this.completedSteps.update(set => {
      const next = new Set(set);
      for (const s of STEPS) next.add(s.num);
      return next;
    });
    this.confirm.emit(this.collectValue());
  }

  private collectValue(): ConfigureStoreFormValue {
    return {
      domainUrl: this.domainUrl(),
      storeName: this.storeName(),
      authKey: this.authKey(),
      extraField: this.extraField(),
      shipFromMode: this.shipFromMode(),
      shipFromAddress: this.shipFromAddress(),
      returnMode: this.returnMode(),
      returnAddress: this.returnAddress(),
      labelSize: this.labelSize(),
      labelCopies: this.labelCopies(),
      packingSlip: this.packingSlip(),
      packingCopies: this.packingCopies(),
      bolName: this.bolName(),
      bolCopies: this.bolCopies(),
      notes: this.notes(),
    };
  }
}
