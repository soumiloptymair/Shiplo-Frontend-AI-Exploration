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
    path: 'inventory',
    loadComponent: () =>
      import('./pages/inventory/inventory.component').then((m) => m.InventoryComponent),
  },
  {
    path: 'wallet',
    loadComponent: () =>
      import('./pages/wallet/wallet.component').then((m) => m.WalletComponent),
  },
  {
    path: 'marketplace',
    loadComponent: () =>
      import('./pages/marketplace/marketplace.component').then((m) => m.MarketplaceComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
