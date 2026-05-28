import { Component, EventEmitter, HostListener, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CONNECT_PRINTER_PURPOSES,
  ConnectPrinterPurposeOption,
  DiscoveredPrinter,
  DocumentType,
  PrinterDocumentMapping,
  defaultMappings,
} from '../../../../core/models/printer.model';
import { PrinterService } from '../../../../core/services/printer.service';

const MAX_ASSIGNED_PURPOSES = 4;

/**
 * Connect printer modal — Figma workflow `27892:216405` / dialog `26410:107872`.
 */
@Component({
  selector: 'app-connect-printer-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connect-printer-modal.component.html',
})
export class ConnectPrinterModalComponent {
  @Output() connected = new EventEmitter<{ name: string }>();
  @Output() cancel = new EventEmitter<void>();

  readonly svc = inject(PrinterService);
  readonly PURPOSE_OPTIONS = CONNECT_PRINTER_PURPOSES;
  readonly maxPurposes = MAX_ASSIGNED_PURPOSES;

  selectedId = signal<string | null>(null);
  selectedPurposes = signal<DocumentType[]>([]);
  printerOpen = signal<boolean>(false);
  purposeOpen = signal<boolean>(false);

  readonly discoveredPrinters = computed(() => this.svc.discoveredPrinters());

  readonly selectedPrinter = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.discoveredPrinters().find((p) => p.id === id) ?? null;
  });

  readonly canConnect = computed(
    () =>
      this.svc.bridgeStatus() === 'active' &&
      !!this.selectedPrinter() &&
      this.selectedPurposes().length > 0,
  );

  readonly selectedPurposeChips = computed(() =>
    this.PURPOSE_OPTIONS.filter((opt) =>
      this.selectedPurposes().includes(opt.documentType),
    ),
  );

  @HostListener('document:click')
  closePickers() {
    this.printerOpen.set(false);
    this.purposeOpen.set(false);
  }

  togglePrinterPicker(evt: MouseEvent) {
    evt.stopPropagation();
    if (this.svc.bridgeStatus() === 'inactive') return;
    this.purposeOpen.set(false);
    this.printerOpen.update((v) => !v);
  }

  togglePurposePicker(evt: MouseEvent) {
    evt.stopPropagation();
    this.printerOpen.set(false);
    this.purposeOpen.update((v) => !v);
  }

  pickPrinter(printer: DiscoveredPrinter, evt: MouseEvent) {
    evt.stopPropagation();
    this.selectedId.set(printer.id);
    this.printerOpen.set(false);
  }

  togglePurpose(option: ConnectPrinterPurposeOption, evt: MouseEvent) {
    evt.stopPropagation();
    const purpose = option.documentType;
    this.selectedPurposes.update((current) => {
      if (current.includes(purpose)) {
        return current.filter((p) => p !== purpose);
      }
      if (current.length >= MAX_ASSIGNED_PURPOSES) {
        return current;
      }
      return [...current, purpose];
    });
  }

  removePurpose(option: ConnectPrinterPurposeOption, evt: MouseEvent) {
    evt.stopPropagation();
    this.selectedPurposes.update((current) =>
      current.filter((p) => p !== option.documentType),
    );
  }

  isPurposeSelected(option: ConnectPrinterPurposeOption): boolean {
    return this.selectedPurposes().includes(option.documentType);
  }

  purposeDisabled(option: ConnectPrinterPurposeOption): boolean {
    return (
      !this.isPurposeSelected(option) &&
      this.selectedPurposes().length >= MAX_ASSIGNED_PURPOSES
    );
  }

  purposeTestId(option: ConnectPrinterPurposeOption): string {
    return `option-purpose-${option.label.toLowerCase().replace(/\s+/g, '-')}`;
  }

  detailValue(value: string | undefined): string {
    return value ?? '-';
  }

  onConnect() {
    if (!this.canConnect()) return;
    const printer = this.selectedPrinter();
    if (!printer) return;

    const enabled = new Set(this.selectedPurposes());
    const mappings: PrinterDocumentMapping[] = defaultMappings().map((m) => ({
      ...m,
      enabled: enabled.has(m.documentType),
    }));

    this.svc.connectPrinter(printer, mappings);
    this.connected.emit({ name: printer.name });
  }

  onCancel() {
    this.cancel.emit();
  }

  onDownloadBridge() {
    this.svc.simulateBridgeDownload();
  }
}
