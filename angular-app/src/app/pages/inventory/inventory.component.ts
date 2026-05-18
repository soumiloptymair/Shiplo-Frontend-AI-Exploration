import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppShellComponent } from '../../layout/app-shell/app-shell.component';
import { InventoryService } from '../../core/services/inventory.service';
import { InventoryTab } from '../../core/models/inventory.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, AppShellComponent],
  templateUrl: './inventory.component.html',
})
export class InventoryComponent {
  svc = inject(InventoryService);

  readonly TABS: InventoryTab[] = ['SKUs', 'Products'];

  setTab(tab: InventoryTab) { this.svc.activeTab.set(tab); }
  isExpanded(id: string): boolean { return this.svc.isExpanded(id); }
  toggleExpand(id: string) { this.svc.toggleExpand(id); }
}
