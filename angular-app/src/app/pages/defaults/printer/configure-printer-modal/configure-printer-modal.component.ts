import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ConnectedPrinter,
  DOCUMENT_TYPES,
  PRINT_FORMATS,
  PrinterDocumentMapping,
  defaultAdvancedSettings,
} from '../../../../core/models/printer.model';

/**
 * Configure printer modal — document mapping, format selection, advanced settings.
 */
@Component({
  selector: 'app-configure-printer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configure-printer-modal.component.html',
})
export class ConfigurePrinterModalComponent {
  @Input({ required: true }) printer!: ConnectedPrinter;
  @Output() save = new EventEmitter<ConnectedPrinter>();
  @Output() testPrint = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  readonly DOCUMENT_TYPES = DOCUMENT_TYPES;
  readonly PRINT_FORMATS = PRINT_FORMATS;

  mappings = signal<PrinterDocumentMapping[]>([]);
  silentPrint = signal<boolean>(true);
  copies = signal<number>(1);
  orientation = signal<'Portrait' | 'Landscape'>('Portrait');
  scaleToFit = signal<boolean>(true);
  dpi = signal<number>(300);
  advancedOpen = signal<boolean>(false);

  ngOnInit() {
    this.mappings.set(this.printer.mappings.map((m) => ({ ...m })));
    this.silentPrint.set(this.printer.advanced.silentPrint);
    this.copies.set(this.printer.advanced.copies);
    this.orientation.set(this.printer.advanced.orientation);
    this.scaleToFit.set(this.printer.advanced.scaleToFit);
    this.dpi.set(this.printer.advanced.dpi);
  }

  toggleMapping(documentType: string, enabled: boolean) {
    this.mappings.update((rows) =>
      rows.map((m) =>
        m.documentType === documentType ? { ...m, enabled } : m,
      ),
    );
  }

  setFormat(documentType: string, format: string) {
    this.mappings.update((rows) =>
      rows.map((m) =>
        m.documentType === documentType
          ? { ...m, format: format as PrinterDocumentMapping['format'] }
          : m,
      ),
    );
  }

  toggleAdvanced() {
    this.advancedOpen.update((v) => !v);
  }

  onSave() {
    this.save.emit({
      ...this.printer,
      mappings: this.mappings(),
      advanced: {
        ...defaultAdvancedSettings(),
        silentPrint: this.silentPrint(),
        copies: Math.max(1, this.copies()),
        orientation: this.orientation(),
        scaleToFit: this.scaleToFit(),
        dpi: Math.max(72, this.dpi()),
      },
    });
  }

  onTestPrint() {
    this.testPrint.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
