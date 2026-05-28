import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';

interface RailItem {
  label: string;
  description: string;
  route?: string;
  disabled?: boolean;
}

/**
 * Settings → Defaults page shell.
 *
 * Pixel-faithful to Figma `7d1Ged8LHQYBV9abYhNhxG` node `25739:522`. Renders
 * a 400px left rail ("Defaults" header + section rows) and a router outlet for
 * the active sub-section.
 */
@Component({
  selector: 'app-defaults',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AppShellComponent],
  templateUrl: './defaults.component.html',
  styles: [
    `
      /* Figma selected row — primary/selected rgba(0,133,114,0.08) */
      a.defaults-rail-link:hover:not(.defaults-rail-link-active) {
        background-color: hsl(var(--surface-light-primary));
      }

      a.defaults-rail-link-active {
        background-color: rgba(0, 133, 114, 0.08);
      }

      a.defaults-rail-link-active:hover {
        background-color: rgba(0, 133, 114, 0.08);
      }
    `,
  ],
})
export class DefaultsComponent {
  readonly railItems: RailItem[] = [
    { label: 'Brand Assets', description: 'Customize your brand defaults',  route: '/settings/defaults/brand-assets' },
    { label: 'Packaging',    description: 'Modify your packaging defaults', route: '/settings/defaults/packaging' },
    { label: 'Label',        description: 'Enable or disable label features', route: '/settings/defaults/label' },
    { label: 'Add Ons',      description: 'Manage available add-ons',         disabled: true },
    { label: 'Tags',         description: 'Manage tag configuration',         route: '/settings/defaults/tags' },
    { label: 'Printer',      description: 'Printer configurations',           route: '/settings/defaults/printer' },
    { label: 'Documents',    description: 'Save document formats',            disabled: true },
  ];

  testId(label: string) {
    return `rail-defaults-${label.toLowerCase().replace(/\s+/g, '-')}`;
  }
}
