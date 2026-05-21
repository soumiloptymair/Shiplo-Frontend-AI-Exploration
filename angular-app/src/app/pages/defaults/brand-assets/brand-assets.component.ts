import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

interface UploadedLogo {
  dataUrl: string;
  name: string;
  size: number;
}

/**
 * Settings → Defaults → Brand Assets.
 *
 * Pixel-faithful to Figma `7d1Ged8LHQYBV9abYhNhxG` node `27863:83417`
 * (and empty-state sub-frame `25720:702578`). Renders the brand-defaults
 * editor: page header with Cancel/Save actions, a Company Logo card
 * (empty dropzone state OR filled preview with Change/Delete), and an
 * Account Information form (Company Name, Address, City, State, ZIP,
 * Phone, Email).
 *
 * Account-info form is presentational — no backend persistence (out of
 * scope per task-35). Logo upload is in-memory only (FileReader →
 * dataURL); persistence across reloads is a follow-up.
 */
@Component({
  selector: 'app-brand-assets-defaults',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brand-assets.component.html',
})
export class BrandAssetsDefaultsComponent {
  private readonly toast = inject(ToastService);

  // Account info
  companyName = signal<string>('Company Name Inc.');
  addressLine = signal<string>('123 Market Street, Suite 400');
  city = signal<string>('San Francisco');
  state = signal<string>('CA');
  zip = signal<string>('94105');
  phone = signal<string>('(415) 555-0142');
  email = signal<string>('support@companyname.com');

  // Logo
  logo = signal<UploadedLogo | null>(null);
  isDragging = signal<boolean>(false);
  private readonly maxBytes = 5 * 1024 * 1024;
  private readonly acceptedTypes = ['image/png', 'image/jpeg'];

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  openFilePicker() {
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    this.ingestFile(file);
    // reset so picking the same file again still triggers change
    input.value = '';
  }

  onDragOver(evt: DragEvent) {
    evt.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(evt: DragEvent) {
    evt.preventDefault();
    this.isDragging.set(false);
    const file = evt.dataTransfer?.files?.[0];
    this.ingestFile(file);
  }

  private ingestFile(file: File | null | undefined) {
    if (!file) return;
    if (!this.acceptedTypes.includes(file.type)) {
      this.toast.show('Only PNG or JPG files are supported');
      return;
    }
    if (file.size > this.maxBytes) {
      this.toast.show('File exceeds 5MB limit');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.logo.set({
        dataUrl: reader.result as string,
        name: file.name,
        size: file.size,
      });
      this.toast.show('Logo uploaded');
    };
    reader.readAsDataURL(file);
  }

  deleteLogo() {
    this.logo.set(null);
    this.toast.show('Logo deleted');
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  onCancel() {
    // stub — reset would require pristine snapshot; out of scope
  }

  onSave() {
    // stub — persistence is out of scope for task-35
  }
}
