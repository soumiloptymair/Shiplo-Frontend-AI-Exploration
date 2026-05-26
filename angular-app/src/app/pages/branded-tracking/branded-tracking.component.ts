import { Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';
import { ColorPickerComponent } from '../../shared/components/color-picker/color-picker.component';
import { ToastService } from '../../core/services/toast.service';
import { BrandedTrackingService } from '../../core/services/branded-tracking.service';
import { TrackingPagePreviewComponent } from './tracking-page-preview/tracking-page-preview.component';

/**
 * Settings → Branded Tracking.
 *
 * Pixel-faithful to Figma `unEpC0FcuWKbB5yO1m7OyX` node `23011:279763`.
 * Left rail: logo upload, URL, brand colors, Reset/Save actions.
 * Right pane: live tracking page preview + open-in-new-window action.
 */
@Component({
  selector: 'app-branded-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppShellComponent,
    ColorPickerComponent,
    TrackingPagePreviewComponent,
  ],
  templateUrl: './branded-tracking.component.html',
})
export class BrandedTrackingComponent implements OnInit {
  private readonly toast = inject(ToastService);
  readonly brandSvc = inject(BrandedTrackingService);

  isDragging = signal(false);
  logoFileName = signal<string | null>(null);
  logoFileSize = signal<number | null>(null);
  private readonly maxBytes = 5 * 1024 * 1024;
  private readonly acceptedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  ngOnInit(): void {
    this.brandSvc.load();
  }

  hasUploadedLogo(): boolean {
    return !!this.brandSvc.draft().logoDataUrl;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  openFilePicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    this.ingestFile(input.files?.[0]);
    input.value = '';
  }

  onDragOver(evt: DragEvent): void {
    evt.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(evt: DragEvent): void {
    evt.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(evt: DragEvent): void {
    evt.preventDefault();
    this.isDragging.set(false);
    this.ingestFile(evt.dataTransfer?.files?.[0]);
  }

  private ingestFile(file: File | null | undefined): void {
    if (!file) return;
    if (!this.acceptedTypes.includes(file.type)) {
      this.toast.show('Only PNG, JPG, or SVG files are supported');
      return;
    }
    if (file.size > this.maxBytes) {
      this.toast.show('File exceeds 5MB limit');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.brandSvc.updateDraft({ logoDataUrl: reader.result as string });
      this.logoFileName.set(file.name);
      this.logoFileSize.set(file.size);
      this.toast.show('Logo uploaded');
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.brandSvc.updateDraft({ logoDataUrl: null });
    this.logoFileName.set(null);
    this.logoFileSize.set(null);
    this.toast.show('Logo removed');
  }

  onUrlChange(value: string): void {
    this.brandSvc.updateDraft({ logoUrl: value.replace(/^https?:\/\//i, '').replace(/^www\./i, '') });
  }

  onResetBrand(): void {
    this.brandSvc.resetDraft();
    this.logoFileName.set(null);
    this.logoFileSize.set(null);
    this.toast.show('Brand settings reset to defaults');
  }

  onSaveBrand(): void {
    this.brandSvc.save();
    this.toast.show('Brand settings saved');
  }

  previewInNewWindow(): void {
    this.brandSvc.stageDraftForPreview();
    window.open('/track/preview', '_blank', 'noopener,noreferrer');
  }
}
