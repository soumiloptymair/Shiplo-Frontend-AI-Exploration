import { Injectable, signal } from '@angular/core';
import { PackagingConfig, PackagingConfigInsert } from '../models/packaging.model';

/**
 * Signal-backed in-memory store of carrier packaging configurations.
 * Seeded with the four Figma rows (Small / Medium / Large / Extra Large).
 */
@Injectable({ providedIn: 'root' })
export class PackagingService {
  readonly configs = signal<PackagingConfig[]>(seed());

  add(input: PackagingConfigInsert): PackagingConfig {
    const created: PackagingConfig = {
      ...input,
      id: `pkg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    this.configs.update((rs) => [...rs, created]);
    return created;
  }

  update(updated: PackagingConfig): void {
    this.configs.update((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
  }

  delete(id: string): void {
    this.configs.update((rs) => rs.filter((r) => r.id !== id));
  }

  toggle(id: string): void {
    this.configs.update((rs) =>
      rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  }
}

function seed(): PackagingConfig[] {
  return [
    { id: 'pkg-seed-small', name: 'Small',       type: 'Box', length: 8,  width: 6,  height: 5, tareWeight: 0.30, maxWeight: 0.30, cost: 2.34, enabled: true },
    { id: 'pkg-seed-medium', name: 'Medium',     type: 'Box', length: 12, width: 9,  height: 6, tareWeight: 0.35, maxWeight: 0.35, cost: 3.45, enabled: true },
    { id: 'pkg-seed-large', name: 'Large',       type: 'Box', length: 12, width: 12, height: 7, tareWeight: 0.40, maxWeight: 0.40, cost: 5.68, enabled: true },
    { id: 'pkg-seed-xl',   name: 'Extra Large', type: 'Box', length: 16, width: 12, height: 9, tareWeight: 0.55, maxWeight: 0.55, cost: 8.20, enabled: true },
  ];
}
