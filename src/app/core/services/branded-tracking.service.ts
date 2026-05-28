import { Injectable, computed, signal } from '@angular/core';
import {
  BrandedTrackingConfig,
  DEFAULT_BRANDED_TRACKING_CONFIG,
  ReasonCodeRow,
} from '../models/branded-tracking.model';

const STORAGE_KEY = 'shiplo.branded-tracking.config';
const DRAFT_SESSION_KEY = 'shiplo.branded-tracking.draft';

function cloneReasonCodes(rows: ReasonCodeRow[]): ReasonCodeRow[] {
  return rows.map((row) => ({ ...row }));
}

function cloneConfig(config: BrandedTrackingConfig): BrandedTrackingConfig {
  return {
    ...config,
    reasonCodes: cloneReasonCodes(config.reasonCodes),
  };
}

function normalizeConfig(raw: Partial<BrandedTrackingConfig>): BrandedTrackingConfig {
  return {
    ...DEFAULT_BRANDED_TRACKING_CONFIG,
    ...raw,
    reasonCodes:
      raw.reasonCodes?.length
        ? cloneReasonCodes(raw.reasonCodes)
        : cloneReasonCodes(DEFAULT_BRANDED_TRACKING_CONFIG.reasonCodes),
  };
}

@Injectable({ providedIn: 'root' })
export class BrandedTrackingService {
  private readonly saved = signal<BrandedTrackingConfig>(this.loadSaved());
  readonly draft = signal<BrandedTrackingConfig>(cloneConfig(this.saved()));

  readonly isDirty = computed(() => !this.configsEqual(this.draft(), this.saved()));

  load(): void {
    const saved = this.loadSaved();
    this.saved.set(saved);
    this.draft.set(cloneConfig(saved));
  }

  updateDraft(patch: Partial<BrandedTrackingConfig>): void {
    this.draft.update((current) => normalizeConfig({ ...current, ...patch }));
  }

  addReasonCode(): void {
    this.draft.update((current) => ({
      ...current,
      reasonCodes: [
        ...current.reasonCodes,
        { id: `reason-${Date.now()}`, code: '' },
      ],
    }));
  }

  updateReasonCode(id: string, code: string): void {
    this.draft.update((current) => ({
      ...current,
      reasonCodes: current.reasonCodes.map((row) =>
        row.id === id ? { ...row, code } : row,
      ),
    }));
  }

  removeReasonCode(id: string): void {
    this.draft.update((current) => ({
      ...current,
      reasonCodes: current.reasonCodes.filter((row) => row.id !== id),
    }));
  }

  save(): void {
    const next = cloneConfig(this.draft());
    this.saved.set(next);
    this.persist(next);
    this.draft.set(cloneConfig(next));
  }

  resetDraft(): void {
    this.draft.set(cloneConfig(DEFAULT_BRANDED_TRACKING_CONFIG));
  }

  resetToSaved(): void {
    this.draft.set(cloneConfig(this.saved()));
  }

  /** Push the current draft to sessionStorage so a preview tab can read it immediately. */
  stageDraftForPreview(): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(this.draft()));
  }

  readPreviewConfig(): BrandedTrackingConfig {
    if (typeof sessionStorage !== 'undefined') {
      const staged = sessionStorage.getItem(DRAFT_SESSION_KEY);
      if (staged) {
        try {
          return normalizeConfig(JSON.parse(staged));
        } catch {
          // fall through to saved config
        }
      }
    }
    return cloneConfig(this.saved());
  }

  fullLogoUrl(domain: string): string {
    const trimmed = domain.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed.replace(/^www\./i, '')}`;
  }

  private loadSaved(): BrandedTrackingConfig {
    if (typeof localStorage === 'undefined') {
      return cloneConfig(DEFAULT_BRANDED_TRACKING_CONFIG);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneConfig(DEFAULT_BRANDED_TRACKING_CONFIG);
    try {
      return normalizeConfig(JSON.parse(raw));
    } catch {
      return cloneConfig(DEFAULT_BRANDED_TRACKING_CONFIG);
    }
  }

  private persist(config: BrandedTrackingConfig): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  private configsEqual(a: BrandedTrackingConfig, b: BrandedTrackingConfig): boolean {
    if (
      a.logoDataUrl !== b.logoDataUrl ||
      a.logoUrl !== b.logoUrl ||
      a.primaryColor.toUpperCase() !== b.primaryColor.toUpperCase() ||
      a.backgroundColor.toUpperCase() !== b.backgroundColor.toUpperCase() ||
      a.displayDocuments !== b.displayDocuments ||
      a.reasonCodes.length !== b.reasonCodes.length
    ) {
      return false;
    }

    return a.reasonCodes.every(
      (row, index) =>
        row.id === b.reasonCodes[index]?.id && row.code === b.reasonCodes[index]?.code,
    );
  }
}
