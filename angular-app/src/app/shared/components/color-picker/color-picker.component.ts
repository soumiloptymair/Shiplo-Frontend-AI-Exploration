import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ============================================================
// Color math (HSV ↔ RGB ↔ HEX)
// ============================================================

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return {
    h,
    s: max === 0 ? 0 : Math.round((d / max) * 100),
    v: Math.round(max * 100),
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/**
 * EyeDropper API (Chromium-only at time of writing). Typed minimally so we
 * don't need a global lib reference.
 */
interface EyeDropperApi {
  open(): Promise<{ sRGBHex: string }>;
}
declare global {
  interface Window {
    EyeDropper?: new () => EyeDropperApi;
  }
}

// ============================================================
// Component
// ============================================================

/**
 * Brand color field + popover picker, mirroring the Figma color picker on
 * node `27686-193656` (Tag color picker) adapted for non-tag use:
 *   - HSV saturation/value pad with draggable thumb
 *   - Horizontal hue slider with draggable thumb
 *   - Eyedropper (uses `window.EyeDropper` where supported, no-op otherwise)
 *   - Color preview chip
 *   - RGB numeric inputs (Type select is RGB only for now)
 *   - Cancel / Apply actions — Apply emits `valueChange`
 *
 * The closed state renders an input-style row with a small color swatch and
 * the hex code, matching the Figma "Primary Color / Background Color" fields
 * (node `25889-29595`).
 */
@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-flex w-full flex-col gap-1.5">
      <span *ngIf="label()" class="font-body text-[12px] text-fg-secondary">
        {{ label() }}
      </span>

      <!-- Closed field -->
      <button type="button"
        (click)="togglePicker()"
        [attr.data-testid]="testIdPrefix() + '-field'"
        [attr.aria-label]="(label() || 'Color') + ' picker, current value ' + value()"
        [attr.aria-haspopup]="'dialog'"
        [attr.aria-expanded]="open()"
        class="flex h-10 w-full items-center gap-2 rounded-token border border-divider bg-surface pl-1 pr-3 text-left transition-colors hover:border-fg-tertiary"
        [class.border-action-primary]="open()">
        <span class="h-8 w-8 shrink-0 rounded-[3px] border border-divider"
          [style.background-color]="value()"
          [attr.data-testid]="testIdPrefix() + '-swatch'"></span>
        <span class="flex-1 font-body text-[13px] font-medium tracking-wide text-fg-primary"
          [attr.data-testid]="testIdPrefix() + '-hex'">
          {{ value() | uppercase }}
        </span>
      </button>

      <!-- Popover -->
      <div *ngIf="open()"
        #popover
        class="absolute left-0 top-[calc(100%+6px)] z-50 w-[280px] select-none rounded-token border border-divider bg-surface p-3 shadow-lg"
        [attr.data-testid]="testIdPrefix() + '-popover'"
        (click)="$event.stopPropagation()">

        <!-- Saturation / Value pad -->
        <div #svPad
          (pointerdown)="onSvPointerDown($event)"
          class="relative h-[160px] w-full cursor-crosshair overflow-hidden rounded-[6px]"
          [style.background]="svBackground()"
          [attr.data-testid]="testIdPrefix() + '-sv-pad'">
          <div class="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            [style.left.%]="s()"
            [style.top.%]="100 - v()"
            [style.background-color]="hex()"></div>
        </div>

        <!-- Eyedropper + preview + hue slider row -->
        <div class="mt-3 flex items-center gap-2">
          <button type="button"
            (click)="useEyedropper()"
            [disabled]="!eyedropperSupported"
            [attr.data-testid]="testIdPrefix() + '-eyedropper'"
            aria-label="Pick a color from the screen"
            title="Pick a color from the screen"
            class="grid h-7 w-7 shrink-0 place-items-center rounded-token text-fg-primary transition-colors hover:bg-surface-light-primary disabled:opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21a3 3 0 0 1-3-3 3 3 0 0 1 .9-2.1L18 7.8a2.5 2.5 0 0 1 3.5 3.5L13.1 19.1A3 3 0 0 1 12 21z"/>
              <path d="m18 8 .8.8a2.5 2.5 0 1 0 3.5-3.5L21.5 4.5a2 2 0 0 0-2.8 0L17 6.2"/>
              <path d="m13.5 13.5-6 6"/>
            </svg>
          </button>
          <span class="h-5 w-5 shrink-0 rounded-full border border-divider"
            [style.background-color]="hex()"></span>

          <div #huePad
            (pointerdown)="onHuePointerDown($event)"
            class="relative h-3 flex-1 cursor-pointer rounded-full"
            [style.background]="hueGradient"
            [attr.data-testid]="testIdPrefix() + '-hue-slider'">
            <div class="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              [style.left.%]="(h() / 360) * 100"
              [style.background-color]="'hsl(' + h() + ', 100%, 50%)'"></div>
          </div>
        </div>

        <!-- Type / RGB inputs -->
        <div class="mt-3 grid items-end gap-2"
          style="grid-template-columns: 64px repeat(3, 1fr);">
          <div class="flex flex-col gap-1">
            <span class="font-body text-[11px] text-fg-secondary">Type</span>
            <div class="flex h-8 items-center justify-between rounded-token border border-divider bg-surface px-2 text-[12px] font-medium text-fg-primary">
              <span>RGB</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
            </div>
          </div>
          <ng-container *ngFor="let ch of channels">
            <label class="flex flex-col gap-1">
              <span class="font-body text-[11px] text-fg-secondary">{{ ch.label }}</span>
              <input type="number" min="0" max="255"
                [ngModel]="ch.get()"
                (ngModelChange)="setChannel(ch.key, $event)"
                [attr.data-testid]="testIdPrefix() + '-' + ch.key"
                class="h-8 w-full rounded-token border border-divider bg-surface px-2 text-center font-body text-[12px] tabular-nums text-fg-primary outline-none focus:border-action-primary"/>
            </label>
          </ng-container>
        </div>

        <!-- Footer -->
        <div class="mt-4 flex items-center justify-end gap-2">
          <button type="button"
            (click)="cancel()"
            [attr.data-testid]="testIdPrefix() + '-cancel'"
            class="inline-flex h-8 items-center rounded-token border border-divider bg-surface px-3 text-[13px] font-medium text-fg-primary transition-colors hover:bg-surface-light-primary">
            Cancel
          </button>
          <button type="button"
            (click)="apply()"
            [attr.data-testid]="testIdPrefix() + '-apply'"
            class="inline-flex h-8 items-center gap-1 rounded-token bg-action-primary px-3 text-[13px] font-medium text-fg-on-action transition-colors hover:bg-action-primary-hover">
            Apply
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ColorPickerComponent implements OnDestroy {
  /** Current committed hex value, e.g. `#008572`. */
  readonly value = input.required<string>();
  readonly label = input<string>('');
  /** Prefix for data-testid attributes inside the picker. */
  readonly testIdPrefix = input<string>('color');

  /** Emits the new hex when the user clicks Apply. */
  readonly valueChange = output<string>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);

  readonly open = signal(false);

  // Working HSV state, updated as the user drags/types.
  readonly h = signal(0);
  readonly s = signal(0);
  readonly v = signal(0);

  readonly hex = computed(() => {
    const { r, g, b } = hsvToRgb(this.h(), this.s(), this.v());
    return rgbToHex(r, g, b);
  });

  /** Background gradient for the SV pad — white→hue horizontal, transparent→black vertical. */
  readonly svBackground = computed(
    () =>
      `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${this.h()}, 100%, 50%))`,
  );

  readonly hueGradient =
    'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)';

  readonly eyedropperSupported = typeof window !== 'undefined' && !!window.EyeDropper;

  readonly channels = [
    { key: 'r' as const, label: 'Red',   get: () => hsvToRgb(this.h(), this.s(), this.v()).r },
    { key: 'g' as const, label: 'Green', get: () => hsvToRgb(this.h(), this.s(), this.v()).g },
    { key: 'b' as const, label: 'Blue',  get: () => hsvToRgb(this.h(), this.s(), this.v()).b },
  ];

  private readonly svPad = viewChild<ElementRef<HTMLDivElement>>('svPad');
  private readonly huePad = viewChild<ElementRef<HTMLDivElement>>('huePad');
  private removePointerListeners?: () => void;

  constructor() {
    // Whenever the picker opens, seed working HSV from the committed value.
    effect(() => {
      if (this.open()) this.seedFromValue();
    });
  }

  togglePicker() {
    this.open.update((v) => !v);
  }

  cancel() {
    this.open.set(false);
  }

  apply() {
    this.valueChange.emit(this.hex());
    this.open.set(false);
  }

  setChannel(ch: 'r' | 'g' | 'b', raw: number | string) {
    const n = Math.max(0, Math.min(255, Math.round(Number(raw) || 0)));
    const cur = hsvToRgb(this.h(), this.s(), this.v());
    const next = { ...cur, [ch]: n };
    const { h, s, v } = rgbToHsv(next.r, next.g, next.b);
    // Preserve hue when chroma collapses (e.g. user clears two channels), so
    // the hue thumb doesn't jump back to red.
    this.h.set(s === 0 ? this.h() : h);
    this.s.set(s);
    this.v.set(v);
  }

  async useEyedropper() {
    if (!this.eyedropperSupported || !window.EyeDropper) return;
    try {
      const dropper = new window.EyeDropper();
      const result = await dropper.open();
      const rgb = hexToRgb(result.sRGBHex);
      if (!rgb) return;
      const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
      this.h.set(s === 0 ? this.h() : h);
      this.s.set(s);
      this.v.set(v);
    } catch {
      // user dismissed
    }
  }

  // ---- Drag handling --------------------------------------------------

  onSvPointerDown(evt: PointerEvent) {
    const el = this.svPad()?.nativeElement;
    if (!el) return;
    const update = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      this.s.set(Math.round(x * 100));
      this.v.set(Math.round((1 - y) * 100));
    };
    this.startDrag(evt, update);
  }

  onHuePointerDown(evt: PointerEvent) {
    const el = this.huePad()?.nativeElement;
    if (!el) return;
    const update = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.h.set(Math.round(x * 360));
    };
    this.startDrag(evt, update);
  }

  private startDrag(evt: PointerEvent, update: (e: PointerEvent) => void) {
    evt.preventDefault();
    // Defensively clear any prior drag listeners before starting a new one.
    this.removePointerListeners?.();
    update(evt);
    const move = (e: PointerEvent) => update(e);
    const end = () => this.removePointerListeners?.();
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, { once: true });
    window.addEventListener('pointercancel', end, { once: true });
    this.removePointerListeners = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      this.removePointerListeners = undefined;
    };
  }

  // ---- Lifecycle / outside click -------------------------------------

  private seedFromValue() {
    const rgb = hexToRgb(this.value());
    if (!rgb) return;
    const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.h.set(s === 0 ? this.h() : h);
    this.s.set(s);
    this.v.set(v);
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocPointerDown(evt: PointerEvent) {
    if (!this.open()) return;
    const host = this.hostRef.nativeElement as HTMLElement;
    if (!host.contains(evt.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open()) this.open.set(false);
  }

  ngOnDestroy(): void {
    // Detach any in-flight drag listeners so a mid-drag route change or
    // template removal doesn't leak window listeners.
    this.removePointerListeners?.();
  }
}

