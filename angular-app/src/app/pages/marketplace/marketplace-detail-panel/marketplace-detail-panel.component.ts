import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  get storeUrl(): string {
    const slug = this.row.brand.toLowerCase().replace(/\s+/g, '');
    return `https://${slug}storeurl.com`;
  }

  get overview(): string {
    return `${this.row.brand} is connected as an active shipping partner for domestic and international shipments. The account supports multiple service types including Priority Overnight, 2Day, Ground, and International Economy. Real-time rate calculation and label generation are enabled, with tracking updates automatically synchronized back to the platform. Shipments are processed under production mode using negotiated contract rates associated with this account.`;
  }

  get lastSynced(): string { return '20 Feb 2026, 11:32 CST'; }

  get statusLabel(): string { return this.row.status === 'Connected' ? 'Connected' : 'Not Connected'; }
}
