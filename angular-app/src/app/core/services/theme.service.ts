import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'shiplo-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.readInitial());

  constructor() {
    effect(() => {
      const t = this.theme();
      const root = document.documentElement;
      root.classList.toggle('dark', t === 'dark');
      try { localStorage.setItem(STORAGE_KEY, t); } catch {}
    });
  }

  toggle() {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  private readInitial(): Theme {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'dark' || v === 'light') return v;
    } catch {}
    return 'light';
  }
}
