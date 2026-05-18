import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'shipments',
    pathMatch: 'full',
  },
  {
    path: 'shipments',
    loadComponent: () =>
      import('./pages/shipments/shipments.component').then((m) => m.ShipmentsComponent),
  },
  {
    path: 'pick-and-pack',
    loadComponent: () =>
      import('./pages/pick-and-pack/pick-and-pack.component').then((m) => m.PickAndPackComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
