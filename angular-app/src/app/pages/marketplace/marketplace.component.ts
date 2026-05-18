import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';

export interface MarketplaceCategory {
  id: string;
  label: string;
}

export type ConnectorStatus = 'Connected' | 'Disconnected';
export type ConnectorTab = 'Connected' | 'Available';

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

interface CatSeed { id: string; connected: number; available: number; brand: string; slug: string; color: string; }

const CATEGORY_SEEDS: CatSeed[] = [
  { id: 'carriers',   connected: 8,  available: 2,  brand: 'FedEx',      slug: 'fedex',      color: '4D148C' },
  { id: 'ecommerce',  connected: 5,  available: 11, brand: 'Shopify',    slug: 'shopify',    color: '95BF47' },
  { id: 'erp',        connected: 4,  available: 10, brand: 'SAP',        slug: 'sap',        color: '0FAAFF' },
  { id: 'oms',        connected: 6,  available: 18, brand: 'Salesforce', slug: 'salesforce', color: '00A1E0' },
  { id: 'wms',        connected: 1,  available: 2,  brand: 'Oracle',     slug: 'oracle',     color: 'C74634' },
  { id: 'tms',        connected: 1,  available: 2,  brand: 'DHL',        slug: 'dhl',        color: 'D40511' },
  { id: 'accounting', connected: 1,  available: 1,  brand: 'Xero',       slug: 'xero',       color: '13B5EA' },
];

function logoFor(slug: string, color: string): string {
  return `https://cdn.simpleicons.org/${slug}/${color}`;
}

function generateRows(): ConnectorRow[] {
  const rows: ConnectorRow[] = [];
  for (const seed of CATEGORY_SEEDS) {
    const url = logoFor(seed.slug, seed.color);
    for (let i = 0; i < seed.connected; i++) {
      rows.push({
        id: `${seed.id}-c-${i + 1}`,
        category: seed.id,
        brand: seed.brand,
        logoUrl: url,
        accountName: `${seed.brand} Default Account`,
        installedDate: '19 Feb 2026, 18:32 CST',
        installedBy: i < Math.ceil(seed.connected * 0.6) ? 'Shipper 1' : i < seed.connected - 1 ? 'Shipper 2' : 'Admin 1',
        description: 'Application one line descri...',
        status: 'Connected',
      });
    }
    for (let i = 0; i < seed.available; i++) {
      rows.push({
        id: `${seed.id}-a-${i + 1}`,
        category: seed.id,
        brand: seed.brand,
        logoUrl: url,
        accountName: `${seed.brand} Test Account`,
        installedDate: '19 Feb 2026, 18:32 CST',
        installedBy: 'Admin 1',
        description: 'Application one line descri...',
        status: 'Disconnected',
      });
    }
  }
  return rows;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, AppShellComponent],
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

  readonly rows: ConnectorRow[] = generateRows();

  categoryCount(id: string): number {
    return this.rows.filter(r => r.category === id && r.status === 'Connected').length;
  }

  readonly tabCounts = computed(() => {
    const cat = this.selectedCategory();
    const inCat = this.rows.filter(r => r.category === cat);
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
    return this.rows.filter(r => {
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

  selectCategory(id: string) { this.selectedCategory.set(id); }
  setTab(t: ConnectorTab) { this.activeTab.set(t); }
  onSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }
  tabCount(t: ConnectorTab): number { return this.tabCounts()[t]; }
}
