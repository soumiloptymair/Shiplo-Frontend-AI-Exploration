import { Injectable, computed, signal } from '@angular/core';
import { Tag, TagInsert } from '../models/tag.model';

/**
 * Signal-backed in-memory store of user-defined tags.
 *
 * Seeded with the three Figma example rows (Received / Delivered / Pending).
 */
@Injectable({ providedIn: 'root' })
export class TagsService {
  readonly tags = signal<Tag[]>(seed());

  readonly query = signal<string>('');

  readonly filtered = computed<Tag[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.tags();
    return this.tags().filter((t) => t.name.toLowerCase().includes(q));
  });

  add(input: TagInsert): Tag {
    const created: Tag = {
      ...input,
      id: `tag-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    this.tags.update((rs) => [...rs, created]);
    return created;
  }

  update(updated: Tag): void {
    this.tags.update((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
  }

  delete(id: string): void {
    this.tags.update((rs) => rs.filter((r) => r.id !== id));
  }

  setQuery(q: string): void {
    this.query.set(q);
  }
}

function seed(): Tag[] {
  return [
    { id: 'tag-seed-received',  name: 'Received',  category: 'Order',       color: 'Green'  },
    { id: 'tag-seed-delivered', name: 'Delivered', category: 'Shipment',    color: 'Orange' },
    { id: 'tag-seed-pending',   name: 'Pending',   category: 'Transaction', color: 'Blue'   },
  ];
}
