import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingDocument } from '../../../core/models/branded-tracking.model';

/**
 * Full-screen document preview overlay (Figma `7d1Ged8LHQYBV9abYhNhxG` node `24943:220509`).
 * Dark header with download / print / close; centered document canvas.
 */
@Component({
  selector: 'app-tracking-document-preview',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="open() && activeDocument()"
      class="fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="'Preview ' + activeDocument()!.name"
      data-testid="modal-document-preview">
      <div class="absolute inset-0 bg-black/60"
        (click)="onClose()"
        data-testid="document-preview-backdrop"></div>

      <header class="relative z-10 flex h-16 shrink-0 items-center justify-between bg-[#0b1516] px-5">
        <div class="flex min-w-0 items-center gap-2">
          <svg class="h-6 w-6 shrink-0 text-white" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="truncate font-body text-[18px] leading-[1.43] text-white"
            data-testid="text-document-preview-title">
            {{ shipmentLabel() }} · {{ activeDocument()!.name }}
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-3">
          <button type="button"
            (click)="downloadDocument()"
            data-testid="button-document-download"
            class="inline-flex h-9 items-center gap-1 rounded border border-white/50 bg-[#131314] px-2 text-[14px] font-medium text-[#e3e9ec] transition-colors hover:bg-[#1a1b1c]">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            Download
          </button>
          <button type="button"
            (click)="printDocument()"
            data-testid="button-document-print"
            class="inline-flex h-9 items-center gap-1 rounded border border-white/50 bg-[#131314] px-2 text-[14px] font-medium text-[#e3e9ec] transition-colors hover:bg-[#1a1b1c]">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
            </svg>
            Print
          </button>
          <button type="button"
            (click)="onClose()"
            aria-label="Close document preview"
            data-testid="button-document-preview-close"
            class="grid h-10 w-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <div class="relative z-10 flex min-h-0 flex-1 items-start justify-center gap-4 overflow-y-auto px-4 py-8 sm:px-8">
        <button *ngIf="hasPrevious()"
          type="button"
          (click)="previous.emit()"
          aria-label="Previous document"
          data-testid="button-document-previous"
          class="sticky top-1/2 hidden h-10 w-10 shrink-0 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-fg-primary shadow-md transition-colors hover:bg-white sm:grid">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
          </svg>
        </button>

        <div class="w-full max-w-[595px] shrink-0 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          data-testid="document-preview-canvas">
          <img [src]="previewSrc()"
            [alt]="activeDocument()!.name"
            class="block w-full object-contain"
            data-testid="img-document-preview" />
          <footer class="flex items-center justify-center gap-1 border-t border-divider px-4 py-4 text-[12px] text-fg-secondary">
            <span>generated by</span>
            <img src="figmaAssets/shiplo-lt---logo---two-color.svg" alt="Shiplo" class="h-[18px] w-auto opacity-70" />
            <span>on {{ generatedAt() }}</span>
          </footer>
        </div>

        <button *ngIf="hasNext()"
          type="button"
          (click)="next.emit()"
          aria-label="Next document"
          data-testid="button-document-next"
          class="sticky top-1/2 hidden h-10 w-10 shrink-0 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-fg-primary shadow-md transition-colors hover:bg-white sm:grid">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class TrackingDocumentPreviewComponent {
  readonly open = input(false);
  readonly activeDocument = input<TrackingDocument | null>(null);
  readonly shipmentLabel = input('Shipment');
  readonly hasPrevious = input(false);
  readonly hasNext = input(false);

  readonly close = output<void>();
  readonly previous = output<void>();
  readonly next = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.onClose();
  }

  @HostListener('document:keydown.arrowLeft')
  onArrowLeft(): void {
    if (this.open() && this.hasPrevious()) this.previous.emit();
  }

  @HostListener('document:keydown.arrowRight')
  onArrowRight(): void {
    if (this.open() && this.hasNext()) this.next.emit();
  }

  previewSrc(): string {
    const doc = this.activeDocument();
    if (!doc) return '';
    return doc.previewSrc || doc.thumbnailSrc;
  }

  generatedAt(): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());
  }

  onClose(): void {
    this.close.emit();
  }

  downloadDocument(): void {
    const doc = this.activeDocument();
    if (!doc) return;
    const link = document.createElement('a');
    link.href = this.previewSrc();
    link.download = `${doc.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
  }

  printDocument(): void {
    const doc = this.activeDocument();
    if (!doc) return;
    const src = this.previewSrc();
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>${doc.name}</title></head>
        <body style="margin:0;display:flex;justify-content:center;">
          <img src="${src}" alt="${doc.name}" style="max-width:100%;height:auto;" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
