import { Injectable, computed, signal } from '@angular/core';
import { TAG_CATEGORIES, Tag, TagCategory, TagInsert } from '../models/tag.model';

const STORAGE_KEY = 'shiplo.tags';

/**
 * Signal-backed tag store with local persistence.
 * Seeded with Figma example rows (Received / Delivered / Pending).
 */
@Injectable({ providedIn: 'root' })
export class TagsService {
  readonly tags = signal<Tag[]>(this.load());
  readonly query = signal<string>('');

  readonly filtered = computed<Tag[]>(() => {
    const q = this.query().trim().toLowerCase();
    const rows = this.tags();
    const filtered = q
      ? rows.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.color.toLowerCase().includes(q),
        )
      : rows;

    return [...filtered].sort((a, b) => {
      const catDiff =
        TAG_CATEGORIES.indexOf(a.category) - TAG_CATEGORIES.indexOf(b.category);
      if (catDiff !== 0) return catDiff;
      return a.name.localeCompare(b.name);
    });
  });

  add(input: TagInsert): Tag {
    const created: Tag = {
      ...input,
      id: `tag-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    this.tags.update((rows) => [...rows, created]);
    this.persist();
    return created;
  }

  update(updated: Tag): void {
    this.tags.update((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
    this.persist();
  }

  delete(id: string): void {
    this.tags.update((rows) => rows.filter((r) => r.id !== id));
    this.persist();
  }

  setQuery(q: string): void {
    this.query.set(q);
  }

  tagsForCategory(category: TagCategory): Tag[] {
    return this.tags().filter((t) => t.category === category);
  }

  getById(id: string): Tag | undefined {
    return this.tags().find((t) => t.id === id);
  }

  resolveMany(ids: string[]): Tag[] {
    const map = new Map(this.tags().map((t) => [t.id, t]));
    return ids.map((id) => map.get(id)).filter((t): t is Tag => !!t);
  }

  private load(): Tag[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Tag[];
        if (Array.isArray(parsed) && parsed.length) {
          return parsed;
        }
      }
    } catch {
      /* fall through to seed */
    }
    return seed();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tags()));
  }
}

function seed(): Tag[] {
  return [
    { id: 'tag-seed-received',  name: 'Received',  category: 'Order',       color: 'Green'  },
    { id: 'tag-seed-delivered', name: 'Delivered', category: 'Shipment',    color: 'Orange' },
    { id: 'tag-seed-pending',   name: 'Pending',   category: 'Transaction', color: 'Blue'   },
    { id: 'tag-seed-priority',  name: 'Priority',  category: 'Shipment',    color: 'Red'    },
    { id: 'tag-seed-featured',  name: 'Featured',  category: 'Products',    color: 'Teal'   },
  ];
}
