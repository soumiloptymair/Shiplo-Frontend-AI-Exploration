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
  brandLogoBg: string;
  brandLogoText: string;
  brandLogoColor: string;
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

interface CatSeed { id: string; connected: number; available: number; brand: string; logoBg: string; logoColor: string; }

const CATEGORY_SEEDS: CatSeed[] = [
  { id: 'carriers',   connected: 8, available: 2, brand: 'FedEx',    logoBg: '#4D148C', logoColor: '#FF6200' },
  { id: 'ecommerce',  connected: 5, available: 11, brand: 'Shopify', logoBg: '#95BF47', logoColor: '#FFFFFF' },
  { id: 'erp',        connected: 4, available: 10, brand: 'SAP',     logoBg: '#0FAAFF', logoColor: '#FFFFFF' },
  { id: 'oms',        connected: 6, available: 18, brand: 'Brightpearl', logoBg: '#0C2340', logoColor: '#FFFFFF' },
  { id: 'wms',        connected: 1, available: 2, brand: 'Manhattan', logoBg: '#1F2937', logoColor: '#FFFFFF' },
  { id: 'tms',        connected: 1, available: 2, brand: 'Oracle',   logoBg: '#C74634', logoColor: '#FFFFFF' },
  { id: 'accounting', connected: 1, available: 1, brand: 'Xero',     logoBg: '#13B5EA', logoColor: '#FFFFFF' },
];

function generateRows(): ConnectorRow[] {
  const rows: ConnectorRow[] = [];
  for (const seed of CATEGORY_SEEDS) {
    for (let i = 0; i < seed.connected; i++) {
      rows.push({
        id: `${seed.id}-c-${i + 1}`,
        category: seed.id,
        brand: seed.brand,
        brandLogoBg: seed.logoBg,
        brandLogoText: seed.brand,
        brandLogoColor: seed.logoColor,
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
        brandLogoBg: seed.logoBg,
        brandLogoText: seed.brand,
        brandLogoColor: seed.logoColor,
        accountName: `${seed.brand} Test Account`,
        installedDate: '—',
        installedBy: '—',
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
