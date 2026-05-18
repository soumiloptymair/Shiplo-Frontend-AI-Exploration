import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment, ShipmentStatus, STATUS_PILL_CLASS } from '../../../core/models/shipment.model';

export type PanelTab = 'Label' | 'Details' | 'Products' | 'Notes';

interface DocFile { id: number; name: string; type: string; date: string; size: string; }
interface PodImage { id: number; dataUrl: string; name: string; }

@Component({
  selector: 'app-shipment-detail-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-detail-panel.component.html',
})
export class ShipmentDetailPanelComponent {
  @Input({ required: true }) shipment!: Shipment;
  @Output() closePanel = new EventEmitter<void>();

  readonly CARRIER_ICON = 'figmaAssets/pngegg--2--1-1.png';
  readonly SOURCE_ICON  = 'figmaAssets/integrations-1.png';
  readonly TABS: PanelTab[] = ['Label', 'Details', 'Products', 'Notes'];

  activeTab = signal<PanelTab>('Label');
  docs = signal<DocFile[]>([]);
  podImages = signal<PodImage[]>([]);
  private nextDocId = 1;
  private nextPodId = 1;

  statusPillClass(status: ShipmentStatus | ''): string {
    return status ? (STATUS_PILL_CLASS[status as ShipmentStatus] ?? 'bg-neutral-100') : '';
  }

  setTab(tab: PanelTab) { this.activeTab.set(tab); }

  handleDocUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const added: DocFile[] = files.map((f) => ({
      id: this.nextDocId++,
      name: f.name,
      type: f.name.split('.').pop()?.toUpperCase() ?? 'FILE',
      date: now,
      size: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(0)} KB`
        : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    this.docs.update((d) => [...d, ...added]);
    input.value = '';
  }

  removeDoc(id: number) { this.docs.update((d) => d.filter((x) => x.id !== id)); }

  handlePodUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    Array.from(input.files ?? []).forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.podImages.update((prev) => [
          ...prev,
          { id: this.nextPodId++, dataUrl: ev.target?.result as string, name: f.name },
        ]);
      };
      reader.readAsDataURL(f);
    });
    input.value = '';
  }

  removePod(id: number) { this.podImages.update((p) => p.filter((x) => x.id !== id)); }
}
