import { Component, Input, Output, EventEmitter, signal, HostListener, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment, ShipmentStatus, STATUS_PILL_CLASS, SHIPMENT_STATUSES } from '../../../core/models/shipment.model';
import { NotesTabComponent } from '../../../shared/notes-tab/notes-tab.component';

export type PanelTab = 'Label' | 'Details' | 'Products' | 'Notes';

interface DocFile { id: number; name: string; type: string; date: string; size: string; }
interface PodImage { id: number; dataUrl: string; name: string; }

@Component({
  selector: 'app-shipment-detail-panel',
  standalone: true,
  imports: [CommonModule, NotesTabComponent],
  templateUrl: './shipment-detail-panel.component.html',
})
export class ShipmentDetailPanelComponent implements OnChanges {
  @Input({ required: true }) shipment!: Shipment;
  @Output() closePanel = new EventEmitter<void>();

  readonly CARRIER_ICON = 'figmaAssets/pngegg--2--1-1.png';
  readonly SOURCE_ICON  = 'figmaAssets/integrations-1.png';
  readonly TABS: PanelTab[] = ['Label', 'Details', 'Products', 'Notes'];

  activeTab = signal<PanelTab>('Label');
  docs = signal<DocFile[]>([]);
  podImages = signal<PodImage[]>([]);
  menuOpen = signal(false);
  statusDropdownOpen = signal(false);
  selectedStatus = signal<ShipmentStatus | ''>('');
  private nextDocId = 1;
  private nextPodId = 1;

  readonly ALL_STATUSES = SHIPMENT_STATUSES;

  readonly STATUS_DOT: Record<ShipmentStatus, string> = {
    'Shipped':       'bg-status-shipped',
    'Pending':       'bg-status-picking',
    'Label Created': 'bg-status-label-created',
    'Delayed':       'bg-status-delayed',
    'Delivered':     'bg-status-delivered',
    'On Hold':       'bg-status-on-hold',
    'Needs Review':  'bg-status-needs-review',
    'Cancelled':     'bg-status-cancelled',
  };

  readonly MENU_ITEMS = [
    { label: 'Split Shipment', testid: 'menu-item-split-shipment' },
    { label: 'Edit Shipment',  testid: 'menu-item-edit-shipment' },
    { label: 'View Receipt',   testid: 'menu-item-view-receipt' },
    { label: 'View Label',     testid: 'menu-item-view-label' },
  ];

  ngOnChanges() {
    this.selectedStatus.set(this.shipment?.status ?? '');
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.statusDropdownOpen.set(false);
    this.menuOpen.update(v => !v);
  }

  toggleStatusDropdown(event: Event) {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.statusDropdownOpen.update(v => !v);
  }

  selectStatus(status: ShipmentStatus, event: Event) {
    event.stopPropagation();
    this.selectedStatus.set(status);
    this.statusDropdownOpen.set(false);
  }

  @HostListener('document:click')
  closeAllDropdowns() {
    this.menuOpen.set(false);
    this.statusDropdownOpen.set(false);
  }

  statusPillClass(status: ShipmentStatus | ''): string {
    return status ? (STATUS_PILL_CLASS[status as ShipmentStatus] ?? 'bg-neutral-100') : '';
  }

  statusDotClass(status: ShipmentStatus | ''): string {
    return status ? (this.STATUS_DOT[status as ShipmentStatus] ?? '') : '';
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
