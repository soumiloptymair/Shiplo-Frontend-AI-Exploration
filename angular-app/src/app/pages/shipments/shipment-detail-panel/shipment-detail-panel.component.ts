import { Component, Input, Output, EventEmitter, signal, computed, HostListener, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment, ShipmentStatus, STATUS_PILL_CLASS, SHIPMENT_STATUSES, MaterialFlags } from '../../../core/models/shipment.model';
import { NotesTabComponent } from '../../../shared/notes-tab/notes-tab.component';
import { SplitRecommendationBannerComponent } from '../split-recommendation-banner/split-recommendation-banner.component';
import { SplitShipmentModalComponent, SplitConfirmPayload } from '../split-shipment-modal/split-shipment-modal.component';
import { MergeRecommendationBannerComponent } from '../merge-recommendation-banner/merge-recommendation-banner.component';
import { MergeShipmentModalComponent, MergeConfirmPayload } from '../merge-shipment-modal/merge-shipment-modal.component';
import { ToastService } from '../../../core/services/toast.service';
import { ShipmentService } from '../../../core/services/shipment.service';
import { PrinterService } from '../../../core/services/printer.service';
import { TrackingDocument } from '../../../core/models/branded-tracking.model';
import { TrackingDocumentPreviewComponent } from '../../branded-tracking/tracking-document-preview/tracking-document-preview.component';
import { EntityTagsComponent } from '../../../shared/components/entity-tags/entity-tags.component';

export type PanelTab = 'Label' | 'Details' | 'Products' | 'Notes' | 'Shipment Log';
export type PanelMenuAction =
  | 'split'
  | 'merge'
  | 'noop'
  | 'view-label'
  | 'view-receipt'
  | 'view-packing-slip';

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
    MergeRecommendationBannerComponent,
    MergeShipmentModalComponent,
    TrackingDocumentPreviewComponent,
    EntityTagsComponent,
  ],
  templateUrl: './shipment-detail-panel.component.html',
})
export class ShipmentDetailPanelComponent implements OnChanges {
  @Input({ required: true }) shipment!: Shipment;
  @Output() closePanel = new EventEmitter<void>();

  private toast = inject(ToastService);
  private shipmentSvc = inject(ShipmentService);
  private printerSvc = inject(PrinterService);

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
  mergeModalOpen = signal(false);
  /** Per-session set of shipment ids whose merge banner was dismissed. */
  dismissedMergeBanners = signal<Set<string>>(new Set());
  previewDocumentIndex = signal<number | null>(null);

  /** Sample shipment documents for preview (Figma node 24943:220509). */
  readonly SHIPMENT_PREVIEW_DOCUMENTS: TrackingDocument[] = [
    {
      name: 'Shipping Label',
      thumbnailSrc: 'figmaAssets/tracking-doc-label-01.png',
      previewSrc: 'figmaAssets/tracking-doc-label-01.png',
    },
    {
      name: 'Receipt',
      thumbnailSrc: 'figmaAssets/tracking-doc-bill-of-lading.png',
      previewSrc: 'figmaAssets/tracking-doc-bill-of-lading.png',
    },
    {
      name: 'Packing Slip',
      thumbnailSrc: 'figmaAssets/tracking-doc-packaging-slip.png',
      previewSrc: 'figmaAssets/tracking-doc-packaging-slip.png',
    },
    {
      name: 'Manifest',
      thumbnailSrc: 'figmaAssets/tracking-doc-manifest.png',
      previewSrc: 'figmaAssets/tracking-doc-manifest.png',
    },
  ];

  private readonly previewDocumentKeys: Record<
    'view-label' | 'view-receipt' | 'view-packing-slip',
    number
  > = {
    'view-label': 0,
    'view-receipt': 1,
    'view-packing-slip': 2,
  };

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

  readonly MENU_ITEMS: { label: string; testid: string; action: PanelMenuAction }[] = [
    { label: 'Split Shipment', testid: 'menu-item-split-shipment', action: 'split' },
    { label: 'Merge Shipments', testid: 'menu-item-merge-shipments', action: 'merge' },
    { label: 'Edit Shipment', testid: 'menu-item-edit-shipment', action: 'noop' },
    { label: 'View Receipt', testid: 'menu-item-view-receipt', action: 'view-receipt' },
    { label: 'View Label', testid: 'menu-item-view-label', action: 'view-label' },
    { label: 'View Packing Slip', testid: 'menu-item-view-packing-slip', action: 'view-packing-slip' },
  ];

  readonly showRecommendationBanner = computed(() => {
    const s = this.shipment;
    return !!s?.splitRecommendation && !this.dismissedBanners().has(s.id);
  });

  /**
   * Live list of merge-eligible peers. Implemented as a plain getter (not a `computed`) because
   * `this.shipment` is a non-signal `@Input` — a `computed` would not re-run when the parent swaps
   * the selected shipment without re-creating the panel. Getters re-evaluate every change-detection
   * cycle, which Angular triggers on input changes, so the result always tracks the current input.
   */
  get mergeCandidates(): Shipment[] {
    const s = this.shipment;
    if (!s) return [];
    // Read the service signal so changes from merge/split mutations are visible during CD.
    void this.shipmentSvc.allShipments();
    return this.shipmentSvc.mergeCandidatesFor(s.id);
  }

  get showMergeBanner(): boolean {
    const s = this.shipment;
    if (!s) return false;
    if (this.dismissedMergeBanners().has(s.id)) return false;
    // Live trigger: any shipment with at least one eligible peer shows the banner.
    return this.mergeCandidates.length > 0;
  }

  /** Live destination string for the banner: prefer the seeded copy, fall back to the ZIP. */
  get bannerDestination(): string {
    return this.shipment?.mergeRecommendation?.destination
      ?? (this.shipment?.destinationZip ? `ZIP ${this.shipment.destinationZip}` : 'the same destination');
  }

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

  onTagIdsChange(tagIds: string[]) {
    this.shipmentSvc.setTagIds(this.shipment.id, tagIds);
  }

  @HostListener('document:click')
  closeAllDropdowns() {
    this.menuOpen.set(false);
    this.statusDropdownOpen.set(false);
  }

  onMenuItem(action: PanelMenuAction, event: Event) {
    event.stopPropagation();
    this.menuOpen.set(false);
    if (action === 'split') this.openSplitModal();
    if (action === 'merge') this.openMergeModal();
    if (action === 'view-label' || action === 'view-receipt' || action === 'view-packing-slip') {
      this.openDocumentPreview(this.previewDocumentKeys[action]);
    }
  }

  previewDocument(): TrackingDocument | null {
    const index = this.previewDocumentIndex();
    if (index === null) return null;
    return this.SHIPMENT_PREVIEW_DOCUMENTS[index] ?? null;
  }

  shipmentPreviewLabel(): string {
    return `Shipment: ${this.shipment.shipmentId}`;
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
    const last = this.SHIPMENT_PREVIEW_DOCUMENTS.length - 1;
    if (index === null || index >= last) return;
    this.previewDocumentIndex.set(index + 1);
  }

  hasPreviousDocument(): boolean {
    const index = this.previewDocumentIndex();
    return index !== null && index > 0;
  }

  hasNextDocument(): boolean {
    const index = this.previewDocumentIndex();
    return index !== null && index < this.SHIPMENT_PREVIEW_DOCUMENTS.length - 1;
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

  openMergeModal() {
    if (this.mergeCandidates.length === 0) {
      this.toast.show('No merge candidates found for this shipment.');
      return;
    }
    this.mergeModalOpen.set(true);
  }

  closeMergeModal() { this.mergeModalOpen.set(false); }

  confirmMerge(payload: MergeConfirmPayload) {
    const result = this.shipmentSvc.mergeShipments(payload.sourceIds, payload.keptWarehouse);
    this.mergeModalOpen.set(false);
    if (result) {
      this.toast.show(`Shipments merged into ${result.newId}`);
    }
  }

  dismissBanner() {
    this.dismissedBanners.update(prev => {
      const next = new Set(prev);
      next.add(this.shipment.id);
      return next;
    });
  }

  dismissMergeBanner() {
    this.dismissedMergeBanners.update(prev => {
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

  printLabel() {
    const result = this.printerSvc.silentPrint({
      documentType: 'Labels',
      shipmentRef: this.shipment.id,
    });
    if (result.ok) {
      this.toast.show(`Label sent to ${result.printerName}`);
      return;
    }
    this.toast.show(result.error ?? 'Unable to print label');
  }
}
