import { Component, Input, Output, EventEmitter, signal, computed, HostListener, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment, ShipmentStatus, STATUS_PILL_CLASS, SHIPMENT_STATUSES, MaterialFlags } from '../../../core/models/shipment.model';
import { NotesTabComponent } from '../../../shared/notes-tab/notes-tab.component';
import { SplitRecommendationBannerComponent } from '../split-recommendation-banner/split-recommendation-banner.component';
import { SplitShipmentModalComponent, SplitConfirmPayload } from '../split-shipment-modal/split-shipment-modal.component';
import { ToastService } from '../../../core/services/toast.service';
import { ShipmentService } from '../../../core/services/shipment.service';

export type PanelTab = 'Label' | 'Details' | 'Products' | 'Notes' | 'Shipment Log';

interface DocFile { id: number; name: string; type: string; date: string; size: string; }
interface PodImage { id: number; dataUrl: string; name: string; }
interface MaterialRow { key: keyof MaterialFlags; present: string; absent: string; }

@Component({
  selector: 'app-shipment-detail-panel',
  standalone: true,
  imports: [
    CommonModule,
    NotesTabComponent,
    SplitRecommendationBannerComponent,
    SplitShipmentModalComponent,
  ],
  templateUrl: './shipment-detail-panel.component.html',
})
export class ShipmentDetailPanelComponent implements OnChanges {
  @Input({ required: true }) shipment!: Shipment;
  @Output() closePanel = new EventEmitter<void>();

  private toast = inject(ToastService);
  private shipmentSvc = inject(ShipmentService);

  readonly CARRIER_ICON = 'figmaAssets/pngegg--2--1-1.png';
  readonly SOURCE_ICON  = 'figmaAssets/integrations-1.png';
  readonly TABS: PanelTab[] = ['Label', 'Details', 'Products', 'Notes', 'Shipment Log'];

  readonly MATERIAL_ROWS: MaterialRow[] = [
    { key: 'lithium',       present: 'Contain Lithium Batteries',     absent: 'No lithium batteries' },
    { key: 'hazmat',        present: 'Contains hazmats',              absent: 'No hazmats' },
    { key: 'fragile',       present: 'Contains fragile items',        absent: 'No fragile items' },
    { key: 'tempSensitive', present: 'Contains temperature sensitive items', absent: 'No temperature sensitive items' },
    { key: 'perishable',    present: 'Contains perishables',          absent: 'No perishables' },
  ];

  activeTab = signal<PanelTab>('Label');
  docs = signal<DocFile[]>([]);
  podImages = signal<PodImage[]>([]);
  menuOpen = signal(false);
  statusDropdownOpen = signal(false);
  selectedStatus = signal<ShipmentStatus | ''>('');
  /** Per-session set of shipment ids whose banner the user dismissed. */
  dismissedBanners = signal<Set<string>>(new Set());
  splitModalOpen = signal(false);
  splitTooltipOpen = signal(false);

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
    { label: 'Split Shipment', testid: 'menu-item-split-shipment', action: 'split' as const },
    { label: 'Edit Shipment',  testid: 'menu-item-edit-shipment',  action: 'noop'  as const },
    { label: 'View Receipt',   testid: 'menu-item-view-receipt',   action: 'noop'  as const },
    { label: 'View Label',     testid: 'menu-item-view-label',     action: 'noop'  as const },
  ];

  readonly showRecommendationBanner = computed(() => {
    const s = this.shipment;
    return !!s?.splitRecommendation && !this.dismissedBanners().has(s.id);
  });

  readonly productsTotal = computed(() => {
    const items = this.shipment?.products ?? [];
    return items.reduce((sum, p) => sum + p.qty * p.unitValue, 0);
  });

  ngOnChanges() {
    this.selectedStatus.set(this.shipment?.status ?? '');
    // Reset tab to Label when switching shipments so users land on a familiar tab.
    if (!this.TABS.includes(this.activeTab())) this.activeTab.set('Label');
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

  onMenuItem(action: 'split' | 'noop', event: Event) {
    event.stopPropagation();
    this.menuOpen.set(false);
    if (action === 'split') this.openSplitModal();
  }

  openSplitModal() {
    if ((this.shipment.products ?? []).length === 0) {
      this.toast.show('This shipment has no products to split.');
      return;
    }
    this.splitModalOpen.set(true);
  }

  closeSplitModal() { this.splitModalOpen.set(false); }

  confirmSplit(payload: SplitConfirmPayload) {
    const result = this.shipmentSvc.splitShipment(this.shipment.id, payload.buckets);
    this.splitModalOpen.set(false);
    if (result) {
      this.toast.show(`Shipment ${result.originalLabel} split successfully`);
    }
  }

  dismissBanner() {
    this.dismissedBanners.update(prev => {
      const next = new Set(prev);
      next.add(this.shipment.id);
      return next;
    });
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
