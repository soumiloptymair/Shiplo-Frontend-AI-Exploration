import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectedPrinter } from '../../../core/models/printer.model';
import { PrinterService } from '../../../core/services/printer.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConnectPrinterModalComponent } from './connect-printer-modal/connect-printer-modal.component';
import { ConfigurePrinterModalComponent } from './configure-printer-modal/configure-printer-modal.component';
import { DisconnectPrinterDialogComponent } from './disconnect-printer-dialog/disconnect-printer-dialog.component';

/**
 * Settings → Defaults → Printer.
 *
 * Pixel-faithful to Figma `7d1Ged8LHQYBV9abYhNhxG` node `27494:520276`.
 * Includes connected printers list, connect / configure / disconnect flows,
 * and mock ShiploSync bridge status. Print queue and history UI deferred.
 */
@Component({
  selector: 'app-printer-defaults',
  standalone: true,
  imports: [
    CommonModule,
    ConnectPrinterModalComponent,
    ConfigurePrinterModalComponent,
    DisconnectPrinterDialogComponent,
  ],
  templateUrl: './printer.component.html',
  host: { class: 'flex h-full min-h-0 flex-col overflow-hidden' },
})
export class PrinterDefaultsComponent {
  readonly svc = inject(PrinterService);
  private readonly toast = inject(ToastService);

  connectOpen = signal<boolean>(false);
  configureTarget = signal<ConnectedPrinter | null>(null);
  disconnectTarget = signal<ConnectedPrinter | null>(null);
  openMenuId = signal<string | null>(null);

  @HostListener('document:click')
  onDocClick() {
    this.openMenuId.set(null);
  }

  openConnect() {
    if (this.svc.bridgeStatus() === 'inactive') {
      this.toast.show('Launch ShiploSync to connect printers');
    }
    this.connectOpen.set(true);
  }

  closeConnect() {
    this.connectOpen.set(false);
  }

  onConnected(payload: { name: string }) {
    this.closeConnect();
    this.toast.show(`${payload.name} connected successfully`);
  }

  downloadShiploSync() {
    this.svc.simulateBridgeDownload();
    this.toast.show('ShiploSync connected');
  }

  openConfigure(row: ConnectedPrinter, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
    this.configureTarget.set(row);
  }

  closeConfigure() {
    this.configureTarget.set(null);
  }

  onSaveConfigure(updated: ConnectedPrinter) {
    this.svc.updatePrinter(updated);
    this.closeConfigure();
    this.toast.show('Printer settings saved');
  }

  onTestPrintFromConfigure() {
    const printer = this.configureTarget();
    if (!printer) return;
    const job = this.svc.testPrint(printer.id);
    if (job) {
      this.toast.show('Test print sent to queue');
    } else {
      this.toast.show('Unable to send test print');
    }
  }

  openDisconnect(row: ConnectedPrinter, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
    this.disconnectTarget.set(row);
  }

  closeDisconnect() {
    this.disconnectTarget.set(null);
  }

  confirmDisconnect() {
    const target = this.disconnectTarget();
    if (!target) return;
    this.svc.disconnectPrinter(target.id);
    this.closeDisconnect();
    this.toast.show('Printer disconnected');
  }

  testPrint(row: ConnectedPrinter, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.set(null);
    const job = this.svc.testPrint(row.id);
    this.toast.show(job ? 'Test print sent to queue' : 'Unable to send test print');
  }

  toggleMenu(id: string, evt: MouseEvent) {
    evt.stopPropagation();
    this.openMenuId.update((cur) => (cur === id ? null : id));
  }

  trackById(_i: number, row: { id: string }) {
    return row.id;
  }
}
