import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandedTrackingService } from '../../../core/services/branded-tracking.service';
import { BrandedTrackingConfig } from '../../../core/models/branded-tracking.model';
import { TrackingPagePreviewComponent } from '../tracking-page-preview/tracking-page-preview.component';

/**
 * Standalone customer-facing tracking preview opened from Branded Tracking settings.
 * Route: `/track/preview` (no app shell, no auth).
 */
@Component({
  selector: 'app-customer-tracking-page',
  standalone: true,
  imports: [CommonModule, TrackingPagePreviewComponent],
  template: `
    <main class="min-h-screen py-6" data-testid="page-customer-tracking-preview">
      <app-tracking-page-preview [config]="config()" [compact]="false" />
    </main>
  `,
})
export class CustomerTrackingPageComponent {
  private readonly brandSvc = inject(BrandedTrackingService);
  readonly config = signal<BrandedTrackingConfig>(this.brandSvc.readPreviewConfig());
}
