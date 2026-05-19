import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
  label: string;
  route?: string;
  iconSrc?: string;
  lucideIcon?: string;
  matchPaths: string[];
}

interface ResourceItem {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-nav-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-sidebar.component.html',
})
export class NavSidebarComponent {
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  private router = inject(Router);
  readonly themeService = inject(ThemeService);

  readonly planningItems: NavItem[] = [
    { label: 'Shipments',    iconSrc: 'figmaAssets/icon-2.svg',        matchPaths: ['/', '/shipments'],   route: '/shipments' },
    { label: 'Pickup',       iconSrc: 'figmaAssets/package-2.svg',     matchPaths: [] },
    { label: 'Quotes',       iconSrc: 'figmaAssets/clipboard-list.svg',matchPaths: [] },
    { label: 'Wallet',       iconSrc: 'figmaAssets/wallet.svg',        matchPaths: ['/wallet'],           route: '/wallet' },
    { label: 'Pick and Pack',iconSrc: 'figmaAssets/package-plus.svg',  matchPaths: ['/pick-and-pack'],    route: '/pick-and-pack' },
  ];

  readonly resourceItems: ResourceItem[] = [
    { label: 'Roles and permissions', icon: '⚙' },
    { label: 'Automations',           icon: '⚙' },
    { label: 'Preferences',           icon: '⚙' },
    { label: 'Branded Tracking',      icon: '⚙' },
    { label: 'Defaults',              icon: '⚙' },
  ];

  readonly resourceNavItems: NavItem[] = [
    { label: 'Inventory',  matchPaths: ['/inventory'],  route: '/inventory' },
  ];

  readonly settingsNavItems: NavItem[] = [
    { label: 'Automations', matchPaths: ['/settings/automations'], route: '/settings/automations' },
    { label: 'Marketplace', matchPaths: ['/marketplace'],          route: '/marketplace' },
  ];

  resourcesExpanded = true;
  settingsExpanded = true;

  isActive(item: NavItem): boolean {
    const url = this.router.url;
    return item.matchPaths.some((p) => p === url || (p !== '/' && url.startsWith(p)));
  }

  testId(label: string) {
    return `nav-${label.toLowerCase().replace(/\s+/g, '-')}`;
  }
}
