import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Disconnect confirmation dialog — Figma node `26410:104889`.
 */
@Component({
  selector: 'app-disconnect-printer-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disconnect-printer-dialog.component.html',
})
export class DisconnectPrinterDialogComponent {
  @Input({ required: true }) printerName!: string;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
