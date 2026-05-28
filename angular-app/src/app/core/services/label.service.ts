import { Injectable, computed, signal } from '@angular/core';
import {
  DEFAULT_ENABLED_LABEL_IDS,
  SYSTEM_LABEL_REFERENCES,
  seedLabelReferences,
} from '../fixtures/label-references';
import { LabelReference, LabelReferenceInsert } from '../models/label.model';

const STORAGE_KEY = 'shiplo.label-defaults';

interface LabelStoreSnapshot {
  enabledById: Record<string, boolean>;
  custom: LabelReference[];
}

/**
 * Signal-backed label reference store with local persistence.
 */
@Injectable({ providedIn: 'root' })
export class LabelService {
  private readonly references = signal<LabelReference[]>(this.load());
  readonly query = signal<string>('');

  readonly filtered = computed<LabelReference[]>(() => {
    const q = this.query().trim().toLowerCase();
    const rows = this.references();
    const filtered = q
      ? rows.filter(
          (r) =>
            r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
        )
      : rows;

    return [...filtered].sort((a, b) => {
      if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  });

  readonly totalCount = computed(() => this.references().length);
  readonly enabledCount = computed(() => this.references().filter((r) => r.enabled).length);

  add(input: LabelReferenceInsert): LabelReference {
    const created: LabelReference = {
      ...input,
      id: `label-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      enabled: true,
      isSystem: false,
    };
    this.references.update((rows) => [...rows, created]);
    this.persist();
    return created;
  }

  update(updated: LabelReference): void {
    this.references.update((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
    this.persist();
  }

  delete(id: string): void {
    const row = this.references().find((r) => r.id === id);
    if (!row || row.isSystem) return;
    this.references.update((rows) => rows.filter((r) => r.id !== id));
    this.persist();
  }

  toggleEnabled(id: string): void {
    this.references.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
    this.persist();
  }

  setQuery(q: string): void {
    this.query.set(q);
  }

  private load(): LabelReference[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LabelStoreSnapshot;
        if (parsed && typeof parsed === 'object') {
          return this.mergeSnapshot(parsed);
        }
      }
    } catch {
      /* fall through to seed */
    }
    return seedLabelReferences();
  }

  private mergeSnapshot(snapshot: LabelStoreSnapshot): LabelReference[] {
    const enabledById = snapshot.enabledById ?? {};
    const custom = Array.isArray(snapshot.custom) ? snapshot.custom : [];

    const systemRows: LabelReference[] = SYSTEM_LABEL_REFERENCES.map((ref) => ({
      ...ref,
      enabled:
        enabledById[ref.id] ??
        DEFAULT_ENABLED_LABEL_IDS.has(ref.id),
    }));

    const validCustom = custom.filter(
      (r) => r && !r.isSystem && typeof r.name === 'string' && typeof r.description === 'string',
    );

    return [...systemRows, ...validCustom];
  }

  private persist(): void {
    const rows = this.references();
    const snapshot: LabelStoreSnapshot = {
      enabledById: Object.fromEntries(
        rows.filter((r) => r.isSystem).map((r) => [r.id, r.enabled]),
      ),
      custom: rows.filter((r) => !r.isSystem),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }
}
