import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';
import { MarketplaceDetailPanelComponent } from './marketplace-detail-panel/marketplace-detail-panel.component';
import { ConnectIntegrationModalComponent, ConnectFormValue } from './connect-modal/connect-integration-modal.component';

export interface MarketplaceCategory {
  id: string;
  label: string;
}

export type ConnectorStatus = 'Connected' | 'Disconnected';
export type ConnectorTab = 'Connected' | 'Available';
export type AvailableBucket = 'connect' | 'request';

export interface ConnectorRow {
  id: string;
  category: string;
  brand: string;
  logoUrl: string;
  accountName: string;
  installedDate: string;
  installedBy: string;
  description: string;
  status: ConnectorStatus;
  availableBucket?: AvailableBucket;
  setupTime: string;
  installs: string;
  rating: { score: string; count: number };
}

const CATEGORY_LABELS: Record<string, string> = {
  carriers:   'Carriers',
  ecommerce:  'E-Commerce',
  erp:        'ERP',
  oms:        'OMS',
  wms:        'WMS',
  tms:        'TMS',
  accounting: 'Accounting',
};

interface BrandSeed { brand: string; slug: string; color: string; }

interface CatSeed {
  id: string;
  connected: number;
  availableConnect: number;
  availableRequest: number;
  pool: BrandSeed[];
}

const CATEGORY_SEEDS: CatSeed[] = [
  { id: 'carriers',   connected: 8, availableConnect: 7, availableRequest: 21,
    pool: [
      { brand: 'FedEx', slug: 'fedex', color: '4D148C' },
      { brand: 'DHL',   slug: 'dhl',   color: 'D40511' },
      { brand: 'dpd',   slug: 'dpd',   color: 'DC0032' },
      { brand: 'UPS',   slug: 'ups',   color: '8B5A2B' },
      { brand: 'USPS',  slug: 'usps',  color: '004B87' },
    ]},
  { id: 'ecommerce',  connected: 5, availableConnect: 5, availableRequest: 11,
    pool: [
      { brand: 'Shopify',     slug: 'shopify',     color: '95BF47' },
      { brand: 'WooCommerce', slug: 'woocommerce', color: '7F54B3' },
      { brand: 'Magento',     slug: 'magento',     color: 'EE672F' },
      { brand: 'BigCommerce', slug: 'bigcommerce', color: '121118' },
      { brand: 'Etsy',        slug: 'etsy',        color: 'F16521' },
    ]},
  { id: 'erp',        connected: 4, availableConnect: 4, availableRequest: 10,
    pool: [
      { brand: 'SAP',      slug: 'sap',      color: '0FAAFF' },
      { brand: 'Oracle',   slug: 'oracle',   color: 'C74634' },
      { brand: 'NetSuite', slug: 'oracle',   color: 'C74634' },
      { brand: 'Sage',     slug: 'sage',     color: '00D639' },
      { brand: 'Workday',  slug: 'workday',  color: 'F38B00' },
    ]},
  { id: 'oms',        connected: 6, availableConnect: 6, availableRequest: 18,
    pool: [
      { brand: 'Salesforce', slug: 'salesforce', color: '00A1E0' },
      { brand: 'HubSpot',    slug: 'hubspot',    color: 'FF7A59' },
      { brand: 'Zendesk',    slug: 'zendesk',    color: '03363D' },
      { brand: 'Freshdesk',  slug: 'freshworks', color: '169958' },
      { brand: 'Pipedrive',  slug: 'pipedrive',  color: '1A1A1A' },
    ]},
  { id: 'wms',        connected: 1, availableConnect: 1, availableRequest: 2,
    pool: [
      { brand: 'Oracle', slug: 'oracle', color: 'C74634' },
      { brand: 'SAP',    slug: 'sap',    color: '0FAAFF' },
    ]},
  { id: 'tms',        connected: 1, availableConnect: 1, availableRequest: 2,
    pool: [
      { brand: 'DHL',   slug: 'dhl',   color: 'D40511' },
      { brand: 'FedEx', slug: 'fedex', color: '4D148C' },
    ]},
  { id: 'accounting', connected: 1, availableConnect: 1, availableRequest: 1,
    pool: [
      { brand: 'Xero',       slug: 'xero',       color: '13B5EA' },
      { brand: 'QuickBooks', slug: 'quickbooks', color: '2CA01C' },
    ]},
];

function logoFor(slug: string, color: string): string {
  return `https://cdn.simpleicons.org/${slug}/${color}`;
}

function ratingFor(i: number): { score: string; count: number } {
  const scores = ['4.8', '4.6', '4.5', '4.2', '3.9', '3.8', '4.1'];
  const counts = [188, 234, 412, 96, 521, 308, 145];
  return { score: scores[i % scores.length], count: counts[i % counts.length] };
}

function installsFor(i: number): string {
  const vals = ['12K', '8K', '24K', '3K', '46K', '5K', '17K'];
  return `${vals[i % vals.length]} Installs`;
}

function generateRows(): ConnectorRow[] {
  const rows: ConnectorRow[] = [];
  for (const seed of CATEGORY_SEEDS) {
    const primary = seed.pool[0];
    for (let i = 0; i < seed.connected; i++) {
      rows.push({
        id: `${seed.id}-c-${i + 1}`,
        category: seed.id,
        brand: primary.brand,
        logoUrl: logoFor(primary.slug, primary.color),
        accountName: `${primary.brand} Default Account`,
        installedDate: '19 Feb 2026, 18:32 CST',
        installedBy: i < Math.ceil(seed.connected * 0.6) ? 'Shipper 1' : i < seed.connected - 1 ? 'Shipper 2' : 'Admin 1',
        description: 'A leading delivery partner with 50 years of fulfilling orders across 100 countries',
        status: 'Connected',
        setupTime: '3 min',
        installs: installsFor(i),
        rating: ratingFor(i),
      });
    }
    const pushAvail = (count: number, bucket: AvailableBucket, prefix: string) => {
      for (let i = 0; i < count; i++) {
        const b = seed.pool[i % seed.pool.length];
        rows.push({
          id: `${seed.id}-${prefix}-${i + 1}`,
          category: seed.id,
          brand: b.brand,
          logoUrl: logoFor(b.slug, b.color),
          accountName: `${b.brand} Default Account`,
          installedDate: '19 Feb 2026, 18:32 CST',
          installedBy: 'Admin 1',
          description: 'A leading delivery partner with 50 years of fulfilling orders across 100 countries',
          status: 'Disconnected',
          availableBucket: bucket,
          setupTime: '3 min',
          installs: installsFor(i),
          rating: ratingFor(i),
        });
      }
    };
    pushAvail(seed.availableConnect, 'connect', 'ac');
    pushAvail(seed.availableRequest, 'request', 'ar');
  }
  return rows;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, AppShellComponent, MarketplaceDetailPanelComponent, ConnectIntegrationModalComponent],
  templateUrl: './marketplace.component.html',
})
export class MarketplaceComponent {
  readonly categories: MarketplaceCategory[] = CATEGORY_SEEDS.map(s => ({
    id: s.id,
    label: CATEGORY_LABELS[s.id],
  }));

  readonly TABS: ConnectorTab[] = ['Connected', 'Available'];

  readonly selectedCategory = signal<string>('carriers');
  readonly activeTab = signal<ConnectorTab>('Connected');
  readonly search = signal('');
  readonly selectedRowId = signal<string | null>(null);
  readonly connectModalOpen = signal(false);
  readonly toast = signal<string | null>(null);
  readonly openRowMenuId = signal<string | null>(null);

  readonly rows = signal<ConnectorRow[]>(generateRows());

  categoryCount(id: string): number {
    return this.rows().filter(r => r.category === id && r.status === 'Connected').length;
  }

  readonly tabCounts = computed(() => {
    const cat = this.selectedCategory();
    const inCat = this.rows().filter(r => r.category === cat);
    return {
      Connected: inCat.filter(r => r.status === 'Connected').length,
      Available: inCat.filter(r => r.status === 'Disconnected').length,
    } as Record<ConnectorTab, number>;
  });

  readonly filteredRows = computed(() => {
    const cat = this.selectedCategory();
    const tab = this.activeTab();
    const q = this.search().trim().toLowerCase();
    const wantStatus: ConnectorStatus = tab === 'Connected' ? 'Connected' : 'Disconnected';
    return this.rows().filter(r => {
      if (r.category !== cat) return false;
      if (r.status !== wantStatus) return false;
      if (!q) return true;
      return (
        r.accountName.toLowerCase().includes(q) ||
        r.installedBy.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q)
      );
    });
  });

  readonly availableConnect = computed(() =>
    this.filteredRows().filter(r => r.availableBucket === 'connect'));
  readonly availableRequest = computed(() =>
    this.filteredRows().filter(r => r.availableBucket === 'request'));

  readonly selectedRow = computed(() => {
    const id = this.selectedRowId();
    return id ? this.rows().find(r => r.id === id) ?? null : null;
  });

  selectCategory(id: string) { this.selectedCategory.set(id); this.selectedRowId.set(null); this.connectModalOpen.set(false); }
  setTab(t: ConnectorTab) { this.activeTab.set(t); this.selectedRowId.set(null); this.connectModalOpen.set(false); }
  onSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }
  tabCount(t: ConnectorTab): number { return this.tabCounts()[t]; }
  selectRow(id: string) { this.selectedRowId.set(id); }
  closePanel() { this.selectedRowId.set(null); this.connectModalOpen.set(false); }

  openConnectModal() {
    if (this.selectedRow()?.status !== 'Connected') {
      this.connectModalOpen.set(true);
    }
  }
  closeConnectModal() { this.connectModalOpen.set(false); }

  confirmConnect(form: ConnectFormValue) {
    const target = this.selectedRow();
    if (!target) return;
    const accountName = form.accountName.trim() || target.accountName;
    this.rows.update(list => list.map(r =>
      r.id === target.id
        ? {
            ...r,
            accountName,
            status: 'Connected' as ConnectorStatus,
            availableBucket: undefined,
            installedDate: '19 Feb 2026, 18:32 CST',
            installedBy: 'Shipper 1',
          }
        : r));
    this.connectModalOpen.set(false);
    this.toast.set(`Successfully connected “${accountName}”`);
    setTimeout(() => this.toast.set(null), 4000);
  }

  dismissToast() { this.toast.set(null); }

  toggleRowMenu(id: string, ev?: Event) {
    ev?.stopPropagation();
    this.openRowMenuId.update(curr => curr === id ? null : id);
  }

  closeRowMenu() { this.openRowMenuId.set(null); }

  disconnect(id: string) {
    const target = this.rows().find(r => r.id === id);
    if (!target) return;
    const name = target.accountName;
    this.rows.update(list => list.map(r =>
      r.id === id
        ? { ...r, status: 'Disconnected' as ConnectorStatus, availableBucket: 'connect' as AvailableBucket }
        : r));
    this.openRowMenuId.set(null);
    if (this.selectedRowId() === id) this.selectedRowId.set(null);
    this.toast.set(`Disconnected “${name}”`);
    setTimeout(() => this.toast.set(null), 4000);
  }
}
