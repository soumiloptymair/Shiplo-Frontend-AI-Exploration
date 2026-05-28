import { Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ConnectorRow } from '../marketplace.component';

@Component({
  selector: 'app-marketplace-detail-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketplace-detail-panel.component.html',
})
export class MarketplaceDetailPanelComponent {
  @Input({ required: true }) row!: ConnectorRow;
  @Output() close = new EventEmitter<void>();
  @Output() connect = new EventEmitter<void>();
  @Output() disconnect = new EventEmitter<void>();
  @Output() requestAccess = new EventEmitter<void>();

  readonly menuOpen = signal(false);

  toggleMenu(ev: Event) {
    ev.stopPropagation();
    this.menuOpen.update(v => !v);
  }

  @HostListener('document:click')
  closeMenuOnOutsideClick() { this.menuOpen.set(false); }

  onDisconnect() {
    this.menuOpen.set(false);
    this.disconnect.emit();
  }

  get storeUrl(): string {
    const slug = this.row.brand.toLowerCase().replace(/\s+/g, '');
    return `https://${slug}storeurl.com`;
  }

  get overview(): string {
    return `${this.row.brand} is connected as an active shipping partner for domestic and international shipments. The account supports multiple service types including Priority Overnight, 2Day, Ground, and International Economy. Real-time rate calculation and label generation are enabled, with tracking updates automatically synchronized back to the platform. Shipments are processed under production mode using negotiated contract rates associated with this account.`;
  }

  get lastSynced(): string { return '20 Feb 2026, 11:32 CST'; }

  get isRequestBucket(): boolean { return this.row.availableBucket === 'request'; }

  get statusLabel(): string {
    if (this.row.status === 'Connected') return 'Connected';
    if (this.row.status === 'Requested') return 'Requested';
    return this.isRequestBucket ? 'Unavailable' : 'Not Connected';
  }
}
