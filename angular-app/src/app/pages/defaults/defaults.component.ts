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
 * a 320px left rail ("Defaults" header + 4 sub-nav items) and a router outlet
 * for the active sub-section (Packaging is the only one wired up).
 */
@Component({
  selector: 'app-defaults',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AppShellComponent],
  templateUrl: './defaults.component.html',
})
export class DefaultsComponent {
  readonly railItems: RailItem[] = [
    { label: 'Brand Assets', description: 'Customize your brand defaults',   disabled: true },
    { label: 'Packaging',    description: 'Modify your packaging defaults',  route: '/settings/defaults/packaging' },
    { label: 'Label',        description: 'Enable or disable label features', disabled: true },
    { label: 'Add Ons',      description: 'Manage available add-ons',         disabled: true },
    { label: 'Tags',         description: 'Manage tag configuration',         route: '/settings/defaults/tags' },
    { label: 'Printer',      description: 'Printer configurations',           disabled: true },
    { label: 'Documents',    description: 'Save document formats',            disabled: true },
  ];

  testId(label: string) {
    return `rail-defaults-${label.toLowerCase().replace(/\s+/g, '-')}`;
  }
}
