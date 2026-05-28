import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex h-screen flex-col items-center justify-center gap-4 bg-neutral-100">
      <h1 class="font-heading text-4xl font-bold text-neutral-900">404</h1>
      <p class="font-body text-lg text-neutral-700">Page not found</p>
      <a routerLink="/shipments" class="rounded bg-brand-secondary px-4 py-2 font-body text-sm font-medium text-white hover:opacity-90">
        Go to Shipments
      </a>
    </div>
  `,
})
export class NotFoundComponent {}
