import { ChangeDetectionStrategy, Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BrandedTrackingConfig,
  TrackingDocument,
  TrackingPreviewData,
} from '../../../core/models/branded-tracking.model';
import { SAMPLE_TRACKING_PREVIEW } from '../../../core/fixtures/sample-tracking-preview';
import { TrackingDocumentPreviewComponent } from '../tracking-document-preview/tracking-document-preview.component';

/**
 * Customer-facing shipment tracking page preview.
 * Used inline on the Branded Tracking settings screen and on the standalone
 * `/track/preview` route opened in a new window.
 */
@Component({
  selector: 'app-tracking-page-preview',
  standalone: true,
  imports: [CommonModule, TrackingDocumentPreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tracking-page-preview.component.html',
})
export class TrackingPagePreviewComponent {
  readonly config = input.required<BrandedTrackingConfig>();
  readonly data = input<TrackingPreviewData>(SAMPLE_TRACKING_PREVIEW);
  /** Smaller typography for the embedded settings preview pane. */
  readonly compact = input(false);
  /** Stretch to fill the parent preview frame (settings panel). */
  readonly fillFrame = input(false);

  readonly defaultLogoSrc = 'figmaAssets/shiplo-lt---logo---two-color.svg';
  readonly poweredByLogoSrc = 'figmaAssets/shiplo-lt---logo---two-color.svg';

  readonly previewDocumentIndex = signal<number | null>(null);
  documentsCarousel = viewChild<ElementRef<HTMLDivElement>>('documentsCarousel');

  previewDocument(): TrackingDocument | null {
    const index = this.previewDocumentIndex();
    if (index === null) return null;
    return this.data().documents[index] ?? null;
  }

  shipmentPreviewLabel(): string {
    return `Shipment: ${this.data().shipmentInfo.shipmentId}`;
  }

  openDocumentPreview(index: number): void {
    this.previewDocumentIndex.set(index);
  }

  closeDocumentPreview(): void {
    this.previewDocumentIndex.set(null);
  }

  showPreviousDocument(): void {
    const index = this.previewDocumentIndex();
    if (index === null || index <= 0) return;
    this.previewDocumentIndex.set(index - 1);
  }

  showNextDocument(): void {
    const index = this.previewDocumentIndex();
    const last = this.data().documents.length - 1;
    if (index === null || index >= last) return;
    this.previewDocumentIndex.set(index + 1);
  }

  scrollDocumentsCarousel(direction: 'next' | 'prev'): void {
    const el = this.documentsCarousel()?.nativeElement;
    if (!el) return;
    const amount = direction === 'next' ? 84 : -84;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  hasPreviousDocument(): boolean {
    const index = this.previewDocumentIndex();
    return index !== null && index > 0;
  }

  hasNextDocument(): boolean {
    const index = this.previewDocumentIndex();
    return index !== null && index < this.data().documents.length - 1;
  }

  logoHref(domain: string): string {
    const trimmed = domain.trim();
    if (!trimmed) return '#';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  displayDomain(domain: string): string {
    const trimmed = domain.trim();
    if (!trimmed) return 'shiplo.com';
    return trimmed.replace(/^https?:\/\//i, '').replace(/^www\./i, 'www.');
  }
}
